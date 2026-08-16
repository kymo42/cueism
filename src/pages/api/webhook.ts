import type { APIRoute } from 'astro';
import type { D1Database } from '@cloudflare/workers-types';
import { env } from 'cloudflare:workers';

// Tolerance (in seconds) for the timestamp in the Stripe-Signature header.
const SIGNATURE_TOLERANCE_SECONDS = 300;

/**
 * Verify a Stripe webhook signature using Web Crypto (Workers-compatible).
 *
 * Stripe signs `${timestamp}.${payload}` with HMAC-SHA256 using the webhook
 * signing secret, and sends the result in the `Stripe-Signature` header as
 * `t=<timestamp>,v1=<signature>`. We recompute the HMAC and compare in
 * constant time, and reject timestamps outside the tolerance window.
 */
async function verifyStripeSignature(
	payload: string,
	header: string,
	secret: string,
): Promise<boolean> {
	const parts = header.split(',').reduce<Record<string, string>>((acc, part) => {
		const [key, value] = part.split('=');
		if (key && value) acc[key.trim()] = value.trim();
		return acc;
	}, {});

	const timestamp = parts.t;
	const expected = parts.v1;
	if (!timestamp || !expected) return false;

	// Reject stale/future timestamps to prevent replay attacks.
	const ts = Number(timestamp);
	if (!Number.isFinite(ts)) return false;
	const now = Math.floor(Date.now() / 1000);
	if (Math.abs(now - ts) > SIGNATURE_TOLERANCE_SECONDS) return false;

	const encoder = new TextEncoder();
	const key = await crypto.subtle.importKey(
		'raw',
		encoder.encode(secret),
		{ name: 'HMAC', hash: 'SHA-256' },
		false,
		['sign'],
	);
	const signatureBuffer = await crypto.subtle.sign(
		'HMAC',
		key,
		encoder.encode(`${timestamp}.${payload}`),
	);
	const computed = [...new Uint8Array(signatureBuffer)]
		.map((b) => b.toString(16).padStart(2, '0'))
		.join('');

	return timingSafeEqual(computed, expected);
}

/** Constant-time string comparison to avoid timing leaks. */
function timingSafeEqual(a: string, b: string): boolean {
	if (a.length !== b.length) return false;
	let mismatch = 0;
	for (let i = 0; i < a.length; i++) {
		mismatch |= a.charCodeAt(i) ^ b.charCodeAt(i);
	}
	return mismatch === 0;
}

async function sendTelegramOrderNotification(
	botToken: string,
	chatId: string,
	session: any,
) {
	try {
		const amountFormatted = session.amount_total
			? `$${(session.amount_total / 100).toFixed(2)} ${(session.currency || 'aud').toUpperCase()}`
			: 'N/A';

		const customerName = session.customer_details?.name || session.shipping_details?.name || 'Unknown';
		const customerEmail = session.customer_details?.email || 'N/A';
		const customerPhone = session.customer_details?.phone || '';

		const addr = session.shipping_details?.address || session.customer_details?.address;
		const addressLines = [
			addr?.line1,
			addr?.line2,
			[addr?.city, addr?.state, addr?.postal_code].filter(Boolean).join(' '),
			addr?.country,
		]
			.filter(Boolean)
			.join('\n');

		const metadata = session.metadata || {};
		const metadataEntries: string[] = [];

		if (metadata.chalk_type) {
			metadataEntries.push(`• <b>Chalk Type:</b> ${escapeHtml(metadata.chalk_type)}`);
		}
		if (metadata.gift_opt_in) {
			metadataEntries.push(`• <b>Gift Opt-In:</b> ${escapeHtml(metadata.gift_opt_in)}`);
		}

		// Collect personalizations and images from metadata
		Object.keys(metadata).forEach((key) => {
			if (key.startsWith('personalization_')) {
				metadataEntries.push(`• <b>Personalization:</b> ${escapeHtml(metadata[key])}`);
			}
			if (key.startsWith('face_')) {
				metadataEntries.push(`🖼 <b>Face Photo:</b> <a href="${metadata[key]}">Download / View Image</a>`);
			}
			if (key.startsWith('logo_')) {
				metadataEntries.push(`🎨 <b>Custom Logo:</b> <a href="${metadata[key]}">Download / View Logo</a>`);
			}
		});

		let message = `🎉 <b>New Order Received!</b>\n\n`;
		message += `💰 <b>Total Paid:</b> ${amountFormatted}\n`;
		message += `👤 <b>Customer:</b> ${escapeHtml(customerName)} (${escapeHtml(customerEmail)})\n`;
		if (customerPhone) message += `📞 <b>Phone:</b> ${escapeHtml(customerPhone)}\n`;

		if (addressLines) {
			message += `\n📍 <b>Shipping Address:</b>\n${escapeHtml(addressLines)}\n`;
		}

		if (metadataEntries.length > 0) {
			message += `\n📦 <b>Order Options:</b>\n${metadataEntries.join('\n')}\n`;
		}

		message += `\n🆔 <b>Session ID:</b> <code>${session.id}</code>`;

		await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({
				chat_id: chatId,
				text: message,
				parse_mode: 'HTML',
				disable_web_page_preview: false,
			}),
		});
	} catch (err) {
		console.error('Failed to send Telegram notification:', err);
	}
}

function escapeHtml(str: string): string {
	return str
		.replace(/&/g, '&amp;')
		.replace(/</g, '&lt;')
		.replace(/>/g, '&gt;');
}

export const POST: APIRoute = async ({ request }) => {
	const workerEnv = env as {
		STRIPE_WEBHOOK_SECRET?: string;
		DB?: D1Database;
		TELEGRAM_BOT_TOKEN?: string;
		TELEGRAM_CHAT_ID?: string;
	};
	const webhookSecret = workerEnv.STRIPE_WEBHOOK_SECRET;

	if (!webhookSecret) {
		return new Response('Missing Stripe configuration', { status: 500 });
	}

	const signature = request.headers.get('stripe-signature');
	if (!signature) {
		return new Response('Missing signature', { status: 400 });
	}

	const body = await request.text();

	const valid = await verifyStripeSignature(body, signature, webhookSecret);
	if (!valid) {
		return new Response('Invalid signature', { status: 400 });
	}

	const db = workerEnv.DB;
	if (!db) {
		return new Response('Database binding not available', { status: 500 });
	}

	try {
		const payload = JSON.parse(body);
		const eventType = payload.type;
		const session = payload.data?.object;

		switch (eventType) {
			case 'checkout.session.completed': {
				if (session?.payment_status === 'paid') {
					const customerEmail = session.customer_details?.email || '';
					const customerName = session.customer_details?.name || '';
					const amountTotal = session.amount_total || 0;
					const stripeSessionId = session.id || '';

					await db
						.prepare(`
							INSERT INTO orders (stripe_session_id, customer_email, customer_name, amount_total, status, created_at)
							VALUES (?, ?, ?, ?, 'paid', datetime('now'))
						`)
						.bind(stripeSessionId, customerEmail, customerName, amountTotal)
						.run();

					// Send Telegram notification if credentials are configured
					if (workerEnv.TELEGRAM_BOT_TOKEN && workerEnv.TELEGRAM_CHAT_ID) {
						await sendTelegramOrderNotification(
							workerEnv.TELEGRAM_BOT_TOKEN,
							workerEnv.TELEGRAM_CHAT_ID,
							session,
						);
					}
				}
				break;
			}
		}

		return new Response(JSON.stringify({ received: true }), {
			status: 200,
			headers: { 'Content-Type': 'application/json' },
		});
	} catch (err: any) {
		return new Response(JSON.stringify({ error: err.message }), { status: 400 });
	}
};
