import Stripe from 'stripe';
import type { APIRoute } from 'astro';
import { getEmDashCollection } from 'emdash';

const stripe = new Stripe(import.meta.env.STRIPE_SECRET_KEY || 'sk_test_placeholder', {
	apiVersion: '2025-02-24.acacia',
});

// Flat rate shipping setup (AusPost Base)
// 10.00 AUD base + 2.00 AUD per extra item as an example of "thought to multiple products"
const BASE_SHIPPING_CENTS = 1000; 
const PER_EXTRA_ITEM_CENTS = 200;

export const POST: APIRoute = async ({ request, url }) => {
	try {
		const body = await request.json();
		const items = body.items as { id: string; quantity: number }[];

		if (!items || items.length === 0) {
			return new Response(JSON.stringify({ error: 'Cart is empty' }), { status: 400 });
		}

		// Query EmDash to validate prices securely
		const { entries: databaseProducts } = await getEmDashCollection('products');
		
		const line_items: Stripe.Checkout.SessionCreateParams.LineItem[] = [];
		let totalItems = 0;

		for (const item of items) {
			const dbProduct = databaseProducts.find(p => p.id === item.id);
			if (!dbProduct) throw new Error(`Product ${item.id} not found.`);
			if (!dbProduct.data.price) throw new Error(`Product ${item.id} has no price.`);

			line_items.push({
				price_data: {
					currency: 'aud',
					unit_amount: dbProduct.data.price,
					product_data: {
						name: dbProduct.data.title,
						description: dbProduct.data.excerpt || '',
						// Optional: link images if hosted public
					},
				},
				quantity: item.quantity,
			});
			totalItems += item.quantity;
		}

		// Calculate flat rate
		const shippingCost = BASE_SHIPPING_CENTS + (Math.max(0, totalItems - 1) * PER_EXTRA_ITEM_CENTS);

		const session = await stripe.checkout.sessions.create({
			payment_method_types: ['card'],
			line_items,
			mode: 'payment',
			success_url: `${url.origin}/shop?success=true`,
			cancel_url: `${url.origin}/shop?canceled=true`,
			shipping_address_collection: {
				allowed_countries: ['AU', 'US', 'GB', 'NZ'], // Adjust based on targeted sales regions
			},
			shipping_options: [
				{
					shipping_rate_data: {
						type: 'fixed_amount',
						fixed_amount: {
							amount: shippingCost,
							currency: 'aud',
						},
						display_name: 'AusPost Standard Delivery',
						delivery_estimate: {
							minimum: { unit: 'business_day', value: 3 },
							maximum: { unit: 'business_day', value: 7 },
						},
					},
				},
			],
		});

		return new Response(JSON.stringify({ url: session.url }), {
			status: 200,
			headers: { 'Content-Type': 'application/json' },
		});
	} catch (error: any) {
		console.error('Stripe Checkout Error:', error);
		return new Response(JSON.stringify({ error: error.message }), { status: 500 });
	}
};
