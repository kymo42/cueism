#!/usr/bin/env node
/**
 * emdash-login.mjs — device-flow login that actually works against EmDash 0.27.
 *
 * Why this exists
 * ---------------
 * `npx emdash login` (emdash 0.27.0) fails against a deployed EmDash instance:
 * its `pollForToken()` expects flat OAuth errors (`body.error === "authorization_pending"`),
 * but the server returns EmDash's error envelope
 * (`{"error":{"code":"TOKEN_EXCHANGE_ERROR","message":"..."}}`).
 * The CLI therefore aborts on the first poll with
 * `Token exchange failed: [object Object]` before you can approve the code.
 *
 * This script performs the same RFC 8628 device flow, tolerates both response
 * shapes, and writes the token to the same credential store the CLI uses
 * (`~/.config/emdash/auth.json`, keyed by origin) so every later
 * `npx emdash ... --url <instance>` command is authenticated.
 *
 * Usage:
 *   node tools/emdash-login.mjs --url https://cueism.com
 *   node tools/emdash-login.mjs --url https://cueism.com --print-token   # for $EMDASH_TOKEN
 *
 * Exit codes: 0 logged in · 1 failed/timeout · 2 usage error.
 */

import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";

const DEFAULT_URL = "http://localhost:4321";
const CLIENT_ID = "emdash-cli";
const SCOPE = "admin";
const GRANT = "urn:ietf:params:oauth:grant-type:device_code";

function parseArgs(argv) {
	const opts = { url: DEFAULT_URL, printToken: false };
	for (let i = 0; i < argv.length; i++) {
		const arg = argv[i];
		if (arg === "--url" || arg === "-u") opts.url = argv[++i];
		else if (arg === "--print-token") opts.printToken = true;
		else if (arg === "-h" || arg === "--help") {
			console.log(
				"Usage: node tools/emdash-login.mjs --url <instance> [--print-token]\n" +
					"  --url <instance>  EmDash instance (default http://localhost:4321)\n" +
					"  --print-token     Print the access token to stdout (for EMDASH_TOKEN) instead of saving it",
			);
			process.exit(0);
		} else {
			console.error(`Unknown option: ${arg}`);
			process.exit(2);
		}
	}
	if (!opts.url) {
		console.error("--url requires a value");
		process.exit(2);
	}
	return opts;
}

/** EmDash wraps errors as {error:{code,message}}; OAuth uses {error:"pending_code"}. */
function readError(body) {
	if (!body) return { code: null, message: null };
	if (typeof body.error === "string") return { code: body.error, message: body.error_description ?? "" };
	if (body.error && typeof body.error === "object") {
		return { code: body.error.code ?? null, message: body.error.message ?? "" };
	}
	return { code: null, message: null };
}

const PENDING = new Set(["AUTHORIZATION_PENDING", "TOKEN_EXCHANGE_ERROR", "authorization_pending", "invalid_grant"]);
const SLOW_DOWN = new Set(["SLOW_DOWN", "slow_down"]);
const EXPIRED = new Set(["EXPIRED_TOKEN", "expired_token"]);
const DENIED = new Set(["ACCESS_DENIED", "access_denied"]);

function credentialPath() {
	const xdg = process.env.XDG_CONFIG_HOME;
	return join(xdg ? join(xdg, "emdash") : join(homedir(), ".config", "emdash"), "auth.json");
}

function saveCredentials(baseUrl, cred) {
	const path = credentialPath();
	let store = {};
	try {
		if (existsSync(path)) store = JSON.parse(readFileSync(path, "utf-8"));
	} catch {
		store = {};
	}
	store[new URL(baseUrl).origin] = cred;
	mkdirSync(join(path, ".."), { recursive: true });
	writeFileSync(path, JSON.stringify(store, null, "\t"), { encoding: "utf-8", mode: 0o600 });
	return path;
}

async function main() {
	const opts = parseArgs(process.argv.slice(2));
	const base = opts.url.replace(/\/$/, "");

	const discovery = await (await fetch(new URL("/_emdash/.well-known/auth", base))).json();
	const flow = discovery?.auth?.methods?.device_flow;
	if (!flow) {
		console.error(
			"✗ This instance does not offer the OAuth device flow.\n" +
				"  Create an API token in the admin UI (/_emdash/admin → API tokens) and use\n" +
				"  $env:EMDASH_TOKEN = \"<token>\"  (or --token <token>).",
		);
		process.exit(1);
	}

	const codeRes = await fetch(new URL(flow.device_authorization_endpoint, base), {
		method: "POST",
		headers: { "Content-Type": "application/json", "X-EmDash-Request": "1" },
		body: JSON.stringify({ client_id: CLIENT_ID, scope: SCOPE }),
	});
	const codeBody = await codeRes.json();
	if (!codeRes.ok || !codeBody?.data?.device_code) {
		const e = readError(codeBody);
		console.error(`✗ Could not start the device flow: ${e.code ?? codeRes.status} ${e.message ?? ""}`);
		process.exit(1);
	}
	const { device_code, user_code, verification_uri, expires_in, interval } = codeBody.data;

	console.log();
	console.log("  ┌──────────────────────────────────────────────┐");
	console.log(`  │  Code:  ${String(user_code).padEnd(36)}│`);
	console.log("  └──────────────────────────────────────────────┘");
	console.log();
	console.log(`  Open:  ${verification_uri}`);
	console.log(`  Then approve the device. Waiting up to ${Math.round(expires_in / 60)} minutes...`);
	console.log();

	const deadline = Date.now() + expires_in * 1000;
	let wait = interval ?? 5;
	let attempt = 0;
	while (Date.now() < deadline) {
		await new Promise((r) => setTimeout(r, wait * 1000));
		attempt++;
		let res;
		try {
			res = await fetch(new URL(flow.token_endpoint, base), {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ device_code, grant_type: GRANT }),
			});
		} catch (err) {
			console.error(`  (network hiccup, retrying: ${err.message})`);
			continue;
		}
		const body = await res.json().catch(() => null);
		if (res.ok && body?.data?.access_token) {
			const { access_token, refresh_token, expires_in: ttl } = body.data;
			let user = { email: "unknown", role: "unknown" };
			try {
				const meRes = await fetch(new URL("/_emdash/api/auth/me", base), {
					headers: { Authorization: `Bearer ${access_token}` },
				});
				if (meRes.ok) {
					const me = (await meRes.json())?.data ?? {};
					const roles = { 10: "subscriber", 20: "contributor", 30: "author", 40: "editor", 50: "admin" };
					user = { email: me.email ?? "unknown", role: roles[me.role] ?? "unknown" };
				}
			} catch {
				/* best effort */
			}
			if (opts.printToken) {
				console.log(access_token);
				return;
			}
			const path = saveCredentials(base, {
				accessToken: access_token,
				refreshToken: refresh_token,
				expiresAt: new Date(Date.now() + ttl * 1000).toISOString(),
				user,
			});
			console.log(`✓ Logged in as ${user.email} (${user.role})`);
			console.log(`  Token saved to ${path}`);
			console.log(`  Publish with: node tools/publish-post.mjs content/posts/<slug>.md --url ${base}`);
			return;
		}
		const e = readError(body);
		if (DENIED.has(e.code)) {
			console.error("✗ Authorization was denied.");
			process.exit(1);
		}
		if (EXPIRED.has(e.code)) {
			console.error("✗ Device code expired — run the command again.");
			process.exit(1);
		}
		if (SLOW_DOWN.has(e.code)) {
			wait = body?.interval ?? wait + 5;
			continue;
		}
		if (PENDING.has(e.code) || e.code === null) {
			if (attempt % 6 === 0) console.log(`  ...still waiting for approval (${attempt} polls)`);
			continue;
		}
		console.error(`✗ Token exchange failed: ${e.code} ${e.message ?? ""}`);
		process.exit(1);
	}
	console.error("✗ Timed out waiting for approval. Run the command again.");
	process.exit(1);
}

main().catch((err) => {
	console.error(`✗ ${err.message}`);
	process.exit(1);
});
