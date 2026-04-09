import type { APIRoute } from 'astro';
import type { D1Database } from '@cloudflare/workers-types';

export const POST: APIRoute = async ({ request }) => {
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
	const env = Astro.locals as { DB: D1Database } & Env;

	try {
		const fetchStripeEvent = await fetch('https://api.stripe.com/v1/webhook_endpoints', {
			method: 'GET',
			headers: { Authorization: `Bearer ${stripeKey}` },
		});

		const payload = JSON.parse(body);
		const eventType = payload.type;
		const session = payload.data?.object;

		console.log(`Received webhook: ${eventType}`);

		switch (eventType) {
			case 'checkout.session.completed': {
				if (session?.payment_status === 'paid') {
					const customerEmail = session.customer_details?.email || '';
					const customerName = session.customer_details?.name || '';
					const amountTotal = session.amount_total || 0;
					const stripeSessionId = session.id || '';

					await env.DB.prepare(`
						INSERT INTO orders (stripe_session_id, customer_email, customer_name, amount_total, status, created_at)
						VALUES (?, ?, ?, ?, 'paid', datetime('now'))
					`).bind(stripeSessionId, customerEmail, customerName, amountTotal).run();

					console.log(`Order saved: ${stripeSessionId}`);
				}
				break;
			}

			case 'payment_intent.payment_failed': {
				console.log(`Payment failed: ${session?.id}`);
				break;
			}
		}

		return new Response(JSON.stringify({ received: true }), {
			status: 200,
			headers: { 'Content-Type': 'application/json' },
		});
	} catch (err: any) {
		console.error('Webhook error:', err);
		return new Response(JSON.stringify({ error: err.message }), { status: 400 });
	}
};
