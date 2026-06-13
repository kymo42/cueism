import type { APIRoute } from 'astro';
import type { D1Database } from '@cloudflare/workers-types';

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

export const POST: APIRoute = async ({ request, locals }) => {
	const webhookSecret = import.meta.env.STRIPE_WEBHOOK_SECRET;

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

	const env = locals as { runtime?: { env?: { DB?: D1Database } } };
	const db = env.runtime?.env?.DB;
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
