import type { APIRoute } from 'astro';
import type { D1Database } from '@cloudflare/workers-types';

export const POST: APIRoute = async ({ request, locals }) => {
	const stripeKey = import.meta.env.STRIPE_SECRET_KEY;
	const webhookSecret = import.meta.env.STRIPE_WEBHOOK_SECRET;

	if (!stripeKey || !webhookSecret) {
		return new Response('Missing Stripe configuration', { status: 500 });
	}

	const signature = request.headers.get('stripe-signature');
	if (!signature) {
		return new Response('Missing signature', { status: 400 });
	}

	const body = await request.text();
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
