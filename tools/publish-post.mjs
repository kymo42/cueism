#!/usr/bin/env node
/**
 * publish-post.mjs — publish a markdown article from content/posts/ to an EmDash
 * instance (posts collection).
 *
 * Zero dependencies. Node 18+ (uses global fetch). Windows-friendly (spawns the
 * EmDash CLI through its `.cmd` shim when present, and passes JSON through temp
 * files instead of shell-quoted arguments).
 *
 * Usage:
 *   node tools/publish-post.mjs content/posts/my-post.md [options]
 *
 * Options:
 *   --dry-run            Print every planned command and exit 0 without writing.
 *   --draft              Force draft status (do not publish).
 *   --publish            Force published status (override `status: draft` frontmatter).
 *   --update             Update the existing post with this slug instead of refusing.
 *   --create-terms       Create a missing category/tag term instead of failing.
 *   --url <instance>     Target instance (default http://localhost:4321).
 *   --token <token>      API token (default $EMDASH_TOKEN).
 *   -h, --help           Show this help.
 *
 * See content/posts/README.md (frontmatter contract) and
 * docs/CONTENT-PIPELINE.md (process + troubleshooting).
 */

import { spawn } from "node:child_process";
import {
	closeSync,
	existsSync,
	mkdirSync,
	mkdtempSync,
	openSync,
	readFileSync,
	rmSync,
	statSync,
	writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";

const SCRIPT_DIR = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(SCRIPT_DIR, "..");
const COLLECTION = "posts";
const DEFAULT_URL = "http://localhost:4321";
const MEDIA_PREFIX = "/_emdash/api/media/file/";

// Image types EmDash accepts for upload (kept in sync with the global allowlist).
const IMAGE_EXTENSIONS = new Set([
	".png",
	".jpg",
	".jpeg",
	".webp",
	".gif",
	".avif",
	".svg",
]);

class Fail extends Error {}

const die = (message) => {
	throw new Fail(message);
};

// ---------------------------------------------------------------------------
// Help / arg parsing
// ---------------------------------------------------------------------------

const USAGE = `Publish a markdown article to the EmDash "${COLLECTION}" collection.

  node tools/publish-post.mjs content/posts/<slug>.md [options]

Options:
  --dry-run          Print the plan (files, uploads, commands) and exit 0.
  --draft            Force draft status; do not publish.
  --publish          Force published status; overrides "status: draft".
  --update           Update the existing post with this slug (re-reads --rev).
  --create-terms     Create a missing category/tag term automatically.
  --body-hero        Also insert the featured image as the first body image. Off by
                     default: src/pages/posts/[slug].astro already renders
                     featured_image above the body, so inserting it again shows the
                     same picture twice.
  --url <instance>   Target instance (default: ${DEFAULT_URL}).
  --token <token>    API token (default: $EMDASH_TOKEN).
  -h, --help         Show this help.

Frontmatter contract: see content/posts/README.md
Process and troubleshooting: see docs/CONTENT-PIPELINE.md`;

function parseArgs(argv) {
	const opts = {
		file: null,
		dryRun: false,
		draft: false,
		publish: false,
		update: false,
		createTerms: false,
		bodyHero: false,
		url: process.env.EMDASH_URL || DEFAULT_URL,
		token: process.env.EMDASH_TOKEN || "",
		help: false,
	};

	for (let i = 0; i < argv.length; i++) {
		const arg = argv[i];
		const next = () => {
			const value = argv[++i];
			if (value === undefined || value.startsWith("--")) {
				die(`Option ${arg} requires a value.`);
			}
			return value;
		};
		switch (arg) {
			case "--dry-run":
			case "--dryRun":
				opts.dryRun = true;
				break;
			case "--draft":
				opts.draft = true;
				break;
			case "--publish":
				opts.publish = true;
				break;
			case "--update":
				opts.update = true;
				break;
			case "--create-terms":
				opts.createTerms = true;
				break;
			case "--body-hero":
				opts.bodyHero = true;
				break;
			case "--url":
				opts.url = next();
				break;
			case "--token":
				opts.token = next();
				break;
			case "-h":
			case "--help":
				opts.help = true;
				break;
			default:
				if (arg.startsWith("-")) die(`Unknown option: ${arg}`);
				if (opts.file) die(`Only one markdown file may be given (got "${opts.file}" and "${arg}").`);
				opts.file = arg;
		}
	}

	opts.url = String(opts.url).replace(/\/+$/, "");
	if (opts.draft && opts.publish) die("--draft and --publish are mutually exclusive.");
	return opts;
}

// ---------------------------------------------------------------------------
// Minimal YAML frontmatter parser
//
// Handles the documented subset: `key: value`, single/double quoted strings,
// inline `[a, b]` lists, and `#` comments (whole-line and trailing). No nested
// maps, no block scalars — the contract does not need them.
// ---------------------------------------------------------------------------

const stripComment = (raw) => {
	let quote = null;
	for (let i = 0; i < raw.length; i++) {
		const ch = raw[i];
		if (quote) {
			if (ch === "\\" && quote === '"') i++;
			else if (ch === quote) quote = null;
			continue;
		}
		if (ch === '"' || ch === "'") {
			quote = ch;
			continue;
		}
		if (ch === "#") {
			// A `#` starts a comment only at the start or after whitespace.
			if (i === 0 || /\s/.test(raw[i - 1])) return raw.slice(0, i);
		}
	}
	return raw;
};

const unquote = (value) => {
	const text = value.trim();
	if (text.length >= 2) {
		const first = text[0];
		const last = text[text.length - 1];
		if (first === '"' && last === '"') {
			return text
				.slice(1, -1)
				.replace(/\\n/g, "\n")
				.replace(/\\t/g, "\t")
				.replace(/\\"/g, '"')
				.replace(/\\\\/g, "\\");
		}
		if (first === "'" && last === "'") {
			return text.slice(1, -1).replace(/''/g, "'");
		}
	}
	return text;
};

const parseInlineList = (value) =>
	value
		.replace(/^\[/, "")
		.replace(/\]$/, "")
		.split(",")
		.map((item) => unquote(item))
		.filter((item) => item.length > 0);

function parseFrontmatter(source, filePath) {
	const text = source.replace(/^\uFEFF/, "").replace(/\r\n/g, "\n");
	if (!text.startsWith("---")) {
		die(`${filePath}: missing YAML frontmatter (the file must start with a "---" line).`);
	}
	const end = text.indexOf("\n---", 3);
	if (end === -1) {
		die(`${filePath}: unterminated YAML frontmatter (no closing "---" line).`);
	}
	const rawBlock = text.slice(text.indexOf("\n", 3) + 1, end);
	const bodyStart = text.indexOf("\n", end + 1);
	const body = bodyStart === -1 ? "" : text.slice(bodyStart + 1);

	const data = {};
	const lines = rawBlock.split("\n");
	for (let i = 0; i < lines.length; i++) {
		const rawLine = lines[i];
		if (!rawLine.trim() || rawLine.trimStart().startsWith("#")) continue;
		if (/^\s/.test(rawLine)) {
			die(`${filePath}: line ${i + 1}: nested/indented YAML is not supported by this pipeline.`);
		}
		const colon = rawLine.indexOf(":");
		if (colon === -1) {
			die(`${filePath}: line ${i + 1}: expected "key: value", got "${rawLine.trim()}".`);
		}
		const key = rawLine.slice(0, colon).trim();
		if (!key) die(`${filePath}: line ${i + 1}: empty key.`);
		// Support `tags: [pool, snooker]` split across several lines.
		let value = stripComment(rawLine.slice(colon + 1)).trim();
		if (value.startsWith("[") && !value.includes("]")) {
			while (i + 1 < lines.length && !value.includes("]")) {
				i++;
				value = `${value} ${stripComment(lines[i]).trim()}`.trim();
			}
			if (!value.includes("]")) {
				die(`${filePath}: unterminated inline list for "${key}".`);
			}
		}
		// Scalar values may be quoted; lists keep their raw `[...]` form.
		data[key] = value.startsWith("[") ? value : unquote(value);
	}
	return { data, body: body.trim() };
}

// ---------------------------------------------------------------------------
// Field shaping
// ---------------------------------------------------------------------------

const stringField = (data, key, filePath, { required = false } = {}) => {
	if (!(key in data)) {
		if (required) die(`${filePath}: frontmatter is missing required field "${key}".`);
		return undefined;
	}
	const value = data[key];
	if (typeof value !== "string" || value.length === 0) {
		if (required) die(`${filePath}: frontmatter field "${key}" must be a non-empty string.`);
		return undefined;
	}
	return value;
};

const listField = (data, key, filePath) => {
	if (!(key in data)) return [];
	const value = data[key];
	if (typeof value !== "string") die(`${filePath}: frontmatter field "${key}" must be a list.`);
	if (value.trim() === "" || value.trim() === "[]") return [];
	if (!value.trim().startsWith("[")) {
		die(`${filePath}: frontmatter field "${key}" must be an inline list, e.g. tags: [pool, snooker].`);
	}
	return parseInlineList(value);
};

const SLUG_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

/**
 * Resolve every frontmatter field into a normalised shape, uploading paths are
 * left as absolute file paths here — uploads happen later.
 */
function resolveFields(parsed, filePath, opts) {
	const { data, body } = parsed;

	const title = stringField(data, "title", filePath, { required: true });
	const slug = stringField(data, "slug", filePath, { required: true });
	if (!SLUG_RE.test(slug)) {
		die(
			`${filePath}: "slug" must be lowercase letters, digits and single hyphens (got "${slug}").`,
		);
	}

	const rawStatus = (stringField(data, "status", filePath) ?? "published").toLowerCase();
	if (rawStatus !== "published" && rawStatus !== "draft") {
		die(`${filePath}: "status" must be "published" or "draft" (got "${rawStatus}").`);
	}
	const status = opts.draft ? "draft" : opts.publish ? "published" : rawStatus;

	const excerpt = stringField(data, "excerpt", filePath);
	const category = stringField(data, "category", filePath, { required: true });
	const tags = listField(data, "tags", filePath);
	const seoTitle = stringField(data, "seo_title", filePath);
	const seoDescription = stringField(data, "seo_description", filePath);

	let featuredImage = null;
	const featuredImageRel = stringField(data, "featured_image", filePath);
	if (featuredImageRel) {
		if (/^https?:\/\//i.test(featuredImageRel)) {
			die(
				`${filePath}: "featured_image" must be a path relative to content/ (got a URL). ` +
					`Upload the file into content/images/${slug}/ and reference it by path.`,
			);
		}
		featuredImage = {
			relPath: featuredImageRel,
			alt: stringField(data, "featured_image_alt", filePath) ?? title,
		};
	}

	const known = new Set([
		"title",
		"slug",
		"excerpt",
		"status",
		"category",
		"tags",
		"featured_image",
		"featured_image_alt",
		"seo_title",
		"seo_description",
	]);
	const unknown = Object.keys(data).filter((key) => !known.has(key));
	if (unknown.length > 0) {
		warn(`ignoring unrecognised frontmatter field(s): ${unknown.join(", ")}`);
	}

	return {
		title,
		slug,
		excerpt,
		status,
		category,
		tags,
		seoTitle,
		seoDescription,
		featuredImage,
		body,
	};
}

// ---------------------------------------------------------------------------
// Logging
// ---------------------------------------------------------------------------

const useColor = process.stdout.isTTY && !process.env.NO_COLOR;
const paint = (code, text) => (useColor ? `\u001b[${code}m${text}\u001b[0m` : text);
const log = (message = "") => process.stdout.write(`${message}\n`);
const step = (message) => log(`${paint(36, "›")} ${message}`);
const info = (message) => log(`  ${message}`);
const warn = (message) => log(`${paint(33, "!")} ${message}`);
const ok = (message) => log(`${paint(32, "✓")} ${message}`);
const cmd = (message) => log(`  ${paint(90, `$ ${message}`)}`);
const quoteArg = (arg) => (/[\s"]/.test(arg) ? `"${arg.replace(/"/g, '\\"')}"` : arg);
const formatCommand = (command) =>
	[command.file, ...(command.prefixArgs ?? []), ...command.args].map(quoteArg).join(" ");

// ---------------------------------------------------------------------------
// CLI bridge
// ---------------------------------------------------------------------------

/**
 * Locate the EmDash CLI.
 *
 * Preferred form is `node node_modules/emdash/dist/cli/index.mjs`: spawning node
 * with a script argument works identically on Windows and POSIX, needs no shell,
 * and avoids the `.cmd` shim (Node refuses to spawn `.cmd` without `shell: true`,
 * and going through a shell risks argument mangling for alt text and JSON).
 *
 * Override with EMDASH_BIN (a path to any executable; it is spawned directly).
 */
function resolveCli() {
	if (process.env.EMDASH_BIN) {
		const override = process.env.EMDASH_BIN;
		if (/\.mjs$|\.js$|\.cjs$/i.test(override)) {
			return { file: process.execPath, prefixArgs: [override], shell: false };
		}
		return { file: override, prefixArgs: [], shell: /\.(cmd|bat)$/i.test(override) };
	}
	const entry = path.join(REPO_ROOT, "node_modules", "emdash", "dist", "cli", "index.mjs");
	if (existsSync(entry)) {
		return { file: process.execPath, prefixArgs: [entry], shell: false };
	}
	const binDir = path.join(REPO_ROOT, "node_modules", ".bin");
	for (const candidate of process.platform === "win32" ? ["emdash.cmd", "emdash"] : ["emdash", "emdash.cmd"]) {
		const full = path.join(binDir, candidate);
		if (existsSync(full)) {
			return { file: full, prefixArgs: [], shell: /\.(cmd|bat)$/i.test(full) };
		}
	}
	return { file: "npx", prefixArgs: ["emdash"], shell: process.platform === "win32" };
}

const CLI = resolveCli();

/**
 * Some restricted sandboxes deny creating the pipes that `stdio: "pipe"` needs
 * (spawn fails with EPERM). When that happens we fall back to redirecting the
 * child's stdio to temp files, which needs no pipes at all. The first failure
 * flips the flag for the rest of the run.
 */
let pipesBlocked = false;

const runPiped = (command) =>
	new Promise((resolve, reject) => {
		const child = spawn(command.file, [...command.prefixArgs, ...command.args], {
			cwd: REPO_ROOT,
			stdio: ["ignore", "pipe", "pipe"],
			shell: command.shell ?? false,
			windowsHide: true,
		});
		let stdout = "";
		let stderr = "";
		child.stdout.on("data", (chunk) => {
			stdout += chunk;
		});
		child.stderr.on("data", (chunk) => {
			stderr += chunk;
		});
		child.on("error", (error) => reject(error));
		child.on("close", (code) => resolve({ code, stdout, stderr }));
	});

const runWithFileRedirect = (command) =>
	new Promise((resolve, reject) => {
		const dir = mkdtempSync(path.join(tmpdir(), "emdash-cli-"));
		const outFile = path.join(dir, "stdout.txt");
		const errFile = path.join(dir, "stderr.txt");
		const stdoutFd = openSync(outFile, "w");
		const stderrFd = openSync(errFile, "w");
		const child = spawn(command.file, [...command.prefixArgs, ...command.args], {
			cwd: REPO_ROOT,
			stdio: ["ignore", stdoutFd, stderrFd],
			shell: command.shell ?? false,
			windowsHide: true,
		});
		const cleanup = () => {
			try {
				closeSync(stdoutFd);
			} catch {}
			try {
				closeSync(stderrFd);
			} catch {}
		};
		child.on("error", (error) => {
			cleanup();
			rmSync(dir, { recursive: true, force: true });
			reject(error);
		});
		child.on("close", (code) => {
			cleanup();
			const read = (file) => {
				try {
					return readFileSync(file, "utf8");
				} catch {
					return "";
				}
			};
			const result = { code, stdout: read(outFile), stderr: read(errFile) };
			rmSync(dir, { recursive: true, force: true });
			resolve(result);
		});
	});

const run = async (command) => {
	if (pipesBlocked) return runWithFileRedirect(command);
	try {
		return await runPiped(command);
	} catch (error) {
		if (error?.code === "EPERM") {
			pipesBlocked = true;
			return runWithFileRedirect(command);
		}
		throw new Fail(`failed to run ${command.file}: ${error.message}`);
	}
};

/** Pull the first complete JSON value out of CLI output. */
function extractJson(text) {
	const start = text.search(/[[{]/);
	if (start === -1) return null;
	for (let end = text.length; end > start; end--) {
		const slice = text.slice(start, end);
		try {
			return JSON.parse(slice);
		} catch {
			/* keep shrinking */
		}
	}
	// Fall back to a brace-balancing scan (handles trailing log lines).
	const open = text[start];
	const close = open === "{" ? "}" : "]";
	let depth = 0;
	let inString = false;
	let escaped = false;
	for (let i = start; i < text.length; i++) {
		const ch = text[i];
		if (inString) {
			if (escaped) escaped = false;
			else if (ch === "\\") escaped = true;
			else if (ch === '"') inString = false;
			continue;
		}
		if (ch === '"') inString = true;
		else if (ch === open) depth++;
		else if (ch === close) {
			depth--;
			if (depth === 0) {
				try {
					return JSON.parse(text.slice(start, i + 1));
				} catch {
					return null;
				}
			}
		}
	}
	return null;
}

async function runCli(args, opts, { label, allowFailure = false } = {}) {
	const command = { ...CLI, args: [...args, "--url", opts.url, "--json"] };
	if (opts.token) command.args.push("--token", opts.token);
	if (opts.dryRun) {
		cmd(formatCommand(command));
		return null;
	}
	const result = await run(command);
	if (result.code !== 0) {
		if (allowFailure) return { failed: true, ...result };
		const detail = `${result.stderr}${result.stdout}`.trim().split("\n").slice(-6).join("\n  ");
		die(`${label} failed (exit ${result.code}).\n  ${detail}`);
	}
	const json = extractJson(result.stdout) ?? extractJson(result.stderr);
	if (json === null) {
		die(`${label} produced no parsable JSON.\n  stdout: ${result.stdout.trim().slice(0, 400)}`);
	}
	return json;
}

// ---------------------------------------------------------------------------
// Auth
// ---------------------------------------------------------------------------

const isLocalUrl = (url) => /localhost|127\.0\.0\.1|\[::1\]/.test(url);

function ensureAuth(opts) {
	if (opts.token) return "token (--token / $EMDASH_TOKEN)";
	if (isLocalUrl(opts.url)) return "dev bypass (localhost)";
	die(
		`No API token for ${opts.url}.\n` +
			"  Create one in the admin UI (/_emdash/admin → API tokens), then either\n" +
			"    $env:EMDASH_TOKEN = \"<token>\"   (PowerShell)\n" +
			"    export EMDASH_TOKEN=<token>    (bash)\n" +
			"  or pass --token <token>. `npx emdash login --url <instance>` also works.",
	);
}

const authHeaders = (opts) => (opts.token ? { Authorization: `Bearer ${opts.token}` } : {});

async function apiFetch(opts, method, apiPath, body, { label } = {}) {
	const url = `${opts.url}${apiPath}`;
	if (opts.dryRun) {
		const preview = body ? ` ${JSON.stringify(body)}` : "";
		cmd(`fetch ${method} ${url}${preview}`);
		return null;
	}
	let response;
	try {
		response = await fetch(url, {
			method,
			headers: {
				Accept: "application/json",
				...authHeaders(opts),
				...(body ? { "Content-Type": "application/json" } : {}),
			},
			body: body ? JSON.stringify(body) : undefined,
		});
	} catch (error) {
		die(`${label ?? `${method} ${apiPath}`} could not reach ${url}: ${error.message}`);
	}
	const text = await response.text();
	if (!response.ok) {
		die(
			`${label ?? `${method} ${apiPath}`} failed: HTTP ${response.status} ${response.statusText}\n` +
				`  ${text.trim().slice(0, 400)}`,
		);
	}
	if (!text.trim()) return null;
	try {
		return JSON.parse(text);
	} catch {
		die(`${label ?? `${method} ${apiPath}`} returned non-JSON: ${text.trim().slice(0, 200)}`);
	}
}

// ---------------------------------------------------------------------------
// Images
// ---------------------------------------------------------------------------

const asRepoPath = (maybeRelativeToCwd) =>
	path.isAbsolute(maybeRelativeToCwd)
		? maybeRelativeToCwd
		: path.resolve(process.cwd(), maybeRelativeToCwd);

/**
 * Resolve a frontmatter/markdown image reference to a file on disk.
 * Documented form is relative to `content/` (e.g. `images/my-slug/hero.png`);
 * paths relative to the markdown file and to the repo root also work.
 */
function resolveImagePath(reference, contentDir, markdownDir) {
	const candidates = [];
	if (path.isAbsolute(reference)) {
		candidates.push(reference);
	} else {
		candidates.push(path.resolve(contentDir, reference));
		candidates.push(path.resolve(markdownDir, reference));
		candidates.push(path.resolve(REPO_ROOT, reference));
	}
	for (const candidate of candidates) {
		if (existsSync(candidate) && statSync(candidate).isFile()) return candidate;
	}
	die(
		`Image not found: "${reference}".\n  Looked in:\n${candidates.map((c) => `    ${c}`).join("\n")}`,
	);
}

/** Strip HTML comments so commented-out examples are not treated as real images. */
const stripHtmlComments = (markdown) => markdown.replace(/<!--[\s\S]*?-->/g, "");

function collectBodyImages(markdown) {
	const images = [];
	const pattern = /!\[([^\]]*)\]\(([^)\s]+)(?:\s+"[^"]*")?\)/g;
	let match;
	while ((match = pattern.exec(stripHtmlComments(markdown))) !== null) {
		images.push({ alt: match[1] || "", target: match[2], raw: match[0] });
	}
	return images;
}

const rewriteBodyImage = (markdown, target, url) => {
	const escaped = target.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
	return markdown.replace(new RegExp(`\\]\\(${escaped}(\\s+"[^"]*")?\\)`, "g"), `](${url}$1)`);
};

const isLocalImageTarget = (target) => !/^(https?:)?\/\//i.test(target) && !target.startsWith("data:");

async function uploadImage(filePath, alt, opts) {
	const args = [
		"media",
		"upload",
		path.relative(REPO_ROOT, filePath) || filePath,
		"--alt",
		alt || path.basename(filePath),
	];
	const item = await runCli(args, opts, { label: `media upload ${path.basename(filePath)}` });
	if (item) {
		if (!item.storageKey || !item.id) {
			die(`media upload returned an unexpected payload (no id/storageKey).`);
		}
		return { id: item.id, storageKey: item.storageKey, url: item.url };
	}
	// Dry run: show the shape that would be used.
	return { id: "<media-id>", storageKey: "<storage-key>", url: `${MEDIA_PREFIX}<storage-key>` };
}

// ---------------------------------------------------------------------------
// Taxonomies
// ---------------------------------------------------------------------------

const TERMS_BY_TAXONOMY = { category: "category", tag: "tag" };

async function fetchTerms(taxonomy, opts) {
	if (opts.dryRun) {
		cmd(formatCommand({ ...CLI, args: ["taxonomy", "terms", taxonomy, "--url", opts.url, "--json"] }));
		return new Map();
	}
	const response = await runCli(["taxonomy", "terms", taxonomy], opts, {
		label: `taxonomy terms ${taxonomy}`,
	});
	if (!response) return new Map();
	const list = Array.isArray(response) ? response : response.items ?? response.terms ?? [];
	const map = new Map();
	for (const term of list) {
		if (!term || typeof term.slug !== "string") continue;
		// Term list rows also expose `children`; index those too.
		map.set(term.slug, term);
		for (const child of term.children ?? []) {
			if (child && typeof child.slug === "string") map.set(child.slug, child);
		}
	}
	return map;
}

async function createTerm(taxonomy, slug, opts) {
	const label = slug
		.split("-")
		.map((part) => (part ? part[0].toUpperCase() + part.slice(1) : part))
		.join(" ");
	const term = await runCli(
		["taxonomy", "add-term", taxonomy, "--name", label, "--slug", slug],
		opts,
		{ label: `create term ${taxonomy}:${slug}` },
	);
	return term ?? { id: "<term-id>", slug, label, name: taxonomy };
}

async function resolveTermIds(taxonomy, slugs, opts) {
	if (slugs.length === 0) return [];
	const terms = await fetchTerms(taxonomy, opts);
	const ids = [];
	for (const slug of slugs) {
		const existing = terms.get(slug);
		if (existing && typeof existing.id === "string") {
			ids.push(existing.id);
			continue;
		}
		if (opts.dryRun) {
			info(`${taxonomy} term "${slug}" resolves at publish time${opts.createTerms ? " (created if missing)" : ""}`);
			ids.push("<term-id>");
			continue;
		}
		if (!opts.createTerms) {
			const available = [...terms.keys()];
			die(
				`${taxonomy} term "${slug}" does not exist.\n` +
					`  Existing ${taxonomy} terms: ${available.length ? available.join(", ") : "(none)"}\n` +
					`  Re-run with --create-terms to create it, or set it up in the admin UI ` +
					`(/_emdash/admin → Taxonomies → ${taxonomy}).`,
			);
		}
		const created = await createTerm(taxonomy, slug, opts);
		if (typeof created.id !== "string") die(`Could not create ${taxonomy} term "${slug}".`);
		ids.push(created.id);
	}
	return ids;
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main() {
	const opts = parseArgs(process.argv.slice(2));
	if (opts.help) {
		log(USAGE);
		return 0;
	}
	if (!opts.file) {
		log(USAGE);
		die("No markdown file given.");
	}

	const filePath = asRepoPath(opts.file);
	if (!existsSync(filePath)) die(`File not found: ${filePath}`);
	if (!statSync(filePath).isFile()) die(`Not a file: ${filePath}`);

	const auth = ensureAuth(opts);
	const contentDir = path.join(REPO_ROOT, "content");
	const markdownDir = path.dirname(filePath);

	step(`${opts.dryRun ? "Dry run — planning" : "Publishing"} ${path.relative(REPO_ROOT, filePath)}`);
	info(`instance: ${opts.url}`);
	info(`auth:     ${auth}`);
	if (opts.dryRun) {
		info(`cli:      ${formatCommand({ ...CLI, args: [] })}`);
	}

	const source = readFileSync(filePath, "utf8");
	const fields = resolveFields(parseFrontmatter(source, path.relative(REPO_ROOT, filePath)), filePath, opts);

	if (fields.body.trim().length === 0) {
		die(
			`${path.relative(REPO_ROOT, filePath)}: the body is empty — there is nothing to publish.` +
				`\n  If this is a template, copy it to content/posts/<slug>.md and write the article first.`,
		);
	}

	// --- guard: slug already exists -------------------------------------------------
	const existing = await findExistingPost(fields.slug, opts);
	if (existing && !opts.update) {
		die(
			`A post with slug "${fields.slug}" already exists on ${opts.url} ` +
				`(id ${existing.id}, status ${existing.status ?? "unknown"}).\n` +
				`  To update it in place:\n` +
				`    node tools/publish-post.mjs ${path.relative(REPO_ROOT, filePath)} --update\n` +
				`  To publish under a different URL, rename it: markdown "slug", content/images/<slug>/, ` +
				`and the filename should all agree.`,
		);
	}
	if (!existing && opts.update) {
		warn(`--update was given but no post with slug "${fields.slug}" exists; creating it instead.`);
	}

	// --- images ---------------------------------------------------------------------
	step("Images");
	const uploaded = new Map(); // absolute file path -> { id, storageKey, url }
	let bodyMarkdown = fields.body;
	let featuredValue = null;

	const bodyImages = collectBodyImages(fields.body).filter((image) => isLocalImageTarget(image.target));
	const uploadTargets = [];
	if (fields.featuredImage) {
		const absolute = resolveImagePath(fields.featuredImage.relPath, contentDir, markdownDir);
		uploadTargets.push({ absolute, alt: fields.featuredImage.alt, role: "featured_image" });
	}
	for (const image of bodyImages) {
		const absolute = resolveImagePath(image.target, contentDir, markdownDir);
		if (!uploadTargets.some((target) => target.absolute === absolute)) {
			uploadTargets.push({ absolute, alt: image.alt, role: "body" });
		}
	}

	if (uploadTargets.length === 0) {
		info("no local images to upload");
	}
	for (const target of uploadTargets) {
		const relative = path.relative(REPO_ROOT, target.absolute);
		const ext = path.extname(target.absolute).toLowerCase();
		const sizeKb = Math.round(statSync(target.absolute).size / 1024);
		info(`${relative} (${sizeKb} kB, ${ext.replace(".", "") || "?"})`);
		if (!IMAGE_EXTENSIONS.has(ext)) {
			die(
				`Unsupported image type "${ext || "(none)"}" for ${relative}.\n` +
					`  Allowed: ${[...IMAGE_EXTENSIONS].map((e) => e.slice(1)).join(", ")}`,
			);
		}
		if (target.role === "body" && !target.alt) {
			warn(`body image ${relative} has empty alt text — add ![alt](...) for accessibility`);
		}
		const result = await uploadImage(target.absolute, target.alt, opts);
		uploaded.set(target.absolute, result);
	}

	if (fields.featuredImage) {
		const absolute = resolveImagePath(fields.featuredImage.relPath, contentDir, markdownDir);
		const media = uploaded.get(absolute);
		featuredValue = {
			provider: "local",
			id: media.id,
			meta: { storageKey: media.storageKey },
		};
	}

	for (const image of bodyImages) {
		const absolute = resolveImagePath(image.target, contentDir, markdownDir);
		const media = uploaded.get(absolute);
		bodyMarkdown = rewriteBodyImage(bodyMarkdown, image.target, media.url);
		if (media.url !== image.target) {
			info(`body: ${image.target} → ${media.url}`);
		}
	}

	// The post template (src/pages/posts/[slug].astro) already renders `featured_image`
	// as a hero above the body, so the hero is NOT inserted into the body by default —
	// doing so would render the same picture twice. Pass --body-hero for the rare
	// template that does not render `featured_image`.
	if (opts.bodyHero && fields.featuredImage && featuredValue) {
		const absolute = resolveImagePath(fields.featuredImage.relPath, contentDir, markdownDir);
		const media = uploaded.get(absolute);
		const inlined = fields.body.includes(fields.featuredImage.relPath) || fields.body.includes(media.url);
		if (!inlined) {
			bodyMarkdown = `![${fields.featuredImage.alt}](${media.url})\n\n${bodyMarkdown}`;
			info("body: hero image prepended (--body-hero)");
		}
	}

	if (bodyMarkdown.trim().length === 0) {
		die(`${path.relative(REPO_ROOT, filePath)}: body is empty after image handling.`);
	}

	// --- content payload ------------------------------------------------------------
	const data = { title: fields.title, content: bodyMarkdown };
	if (fields.excerpt) data.excerpt = fields.excerpt;
	if (featuredValue) data.featured_image = featuredValue;

	step(opts.update && existing ? "Update post" : "Create post");
	info(`title:    ${fields.title}`);
	info(`slug:     ${fields.slug}`);
	info(`status:   ${fields.status}`);
	info(`excerpt:  ${fields.excerpt ? `${fields.excerpt.slice(0, 72)}${fields.excerpt.length > 72 ? "…" : ""}` : "(none)"}`);

	const tempFile = writePayloadTempFile(fields.slug, data);
	let item;
	try {
		if (existing) {
			const current = await runCli(["content", "get", COLLECTION, fields.slug], opts, {
				label: `content get ${fields.slug}`,
			});
			const rev = current?._rev ?? current?.item?._rev;
			if (!opts.dryRun && !rev) {
				die(
					`Could not read a --rev token for "${fields.slug}". ` +
						`Re-run: npx emdash content get ${COLLECTION} ${fields.slug} --json`,
				);
			}
			const args = [
				"content",
				"update",
				COLLECTION,
				fields.slug,
				"--rev",
				rev ?? "<rev-from-content-get>",
				"--file",
				tempFile,
			];
			if (fields.status === "draft") args.push("--draft");
			item = await runCli(args, opts, { label: "content update" });
		} else {
			const args = ["content", "create", COLLECTION, "--file", tempFile, "--slug", fields.slug];
			if (fields.status === "draft") args.push("--draft");
			item = await runCli(args, opts, { label: "content create" });
		}
	} finally {
		rmSync(tempFile, { force: true });
	}

	const entryId = item?.id ?? "<entry-id>";

	// --- taxonomy -------------------------------------------------------------------
	step("Taxonomy");
	info(`category: ${fields.category}`);
	info(`tags:     ${fields.tags.length ? fields.tags.join(", ") : "(none)"}`);
	const categoryIds = await resolveTermIds(TERMS_BY_TAXONOMY.category, [fields.category], opts);
	const tagIds = await resolveTermIds(TERMS_BY_TAXONOMY.tag, fields.tags, opts);
	await apiFetch(
		opts,
		"POST",
		`/_emdash/api/content/${COLLECTION}/${encodeURIComponent(entryId)}/terms/category`,
		{ termIds: categoryIds },
		{ label: "assign category" },
	);
	if (fields.tags.length > 0) {
		await apiFetch(
			opts,
			"POST",
			`/_emdash/api/content/${COLLECTION}/${encodeURIComponent(entryId)}/terms/tag`,
			{ termIds: tagIds },
			{ label: "assign tags" },
		);
	}

	// --- SEO (CLI has no --seo flag; the REST API does) ------------------------------
	if (fields.seoTitle || fields.seoDescription) {
		step("SEO overrides");
		const seo = {};
		if (fields.seoTitle) seo.title = fields.seoTitle;
		if (fields.seoDescription) seo.description = fields.seoDescription;
		await apiFetch(
			opts,
			"PUT",
			`/_emdash/api/content/${COLLECTION}/${encodeURIComponent(entryId)}`,
			{ seo },
			{ label: "set SEO metadata" },
		);
	}

	// --- result ---------------------------------------------------------------------
	const liveUrl = `${opts.url}/posts/${fields.slug}`;
	log("");
	if (opts.dryRun) {
		ok("Dry run complete — nothing was written.");
		info(`would publish: ${liveUrl}`);
		return 0;
	}
	ok(`${fields.status === "draft" ? "Draft saved" : "Published"}: ${fields.title}`);
	info(`entry id: ${entryId}`);
	info(`url:      ${liveUrl}`);
	if (fields.status === "draft") {
		info(`publish:  npx emdash content publish ${COLLECTION} ${entryId} --url ${opts.url}`);
	}
	return 0;
}

async function findExistingPost(slug, opts) {
	if (opts.dryRun) {
		info(`would check for an existing post with slug "${slug}"`);
		return null;
	}
	const list = await runCli(["content", "list", COLLECTION, "--limit", "100"], opts, {
		label: `content list ${COLLECTION}`,
	});
	const items = Array.isArray(list) ? list : list?.items ?? [];
	return items.find((entry) => entry?.slug === slug) ?? null;
}

function writePayloadTempFile(slug, data) {
	const name = `emdash-publish-${slug}-${process.pid}.json`;
	const payload = JSON.stringify(data);
	const primary = path.join(tmpdir(), name);
	try {
		writeFileSync(primary, payload, "utf8");
		return primary;
	} catch {
		// Keep the fallback outside the repo so a failed run never dirties the
		// working tree.
		const fallbackDir = path.join(tmpdir(), "emdash-publish");
		mkdirSync(fallbackDir, { recursive: true });
		const fallback = path.join(fallbackDir, name);
		writeFileSync(fallback, payload, "utf8");
		return fallback;
	}
}

main()
	.then((code) => {
		process.exitCode = code ?? 0;
	})
	.catch((error) => {
		if (error instanceof Fail) {
			log("");
			log(`${paint(31, "✗")} ${error.message}`);
			process.exitCode = 1;
			return;
		}
		log("");
		log(`${paint(31, "✗")} unexpected error`);
		log(error?.stack ?? String(error));
		process.exitCode = 1;
	});

export { parseFrontmatter, resolveFields, collectBodyImages, extractJson };
