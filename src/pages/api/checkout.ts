import type { APIRoute } from 'astro';
import { getEmDashCollection } from 'emdash';

const BASE_SHIPPING_CENTS = 1000; 
const PER_EXTRA_ITEM_CENTS = 200;

export const POST: APIRoute = async ({ request, url }) => {
	try {
		const stripeKey = import.meta.env.STRIPE_SECRET_KEY || 'sk_test_placeholder';
		const body = await request.json();
		const items = body.items as { id: string; quantity: number }[];

		if (!items || items.length === 0) {
			return new Response(JSON.stringify({ error: 'Cart is empty' }), { status: 400 });
		}

		// Query EmDash to validate prices securely
		const { entries: databaseProducts } = await getEmDashCollection('products').catch(() => ({ entries: [] }));
		
		const data = new URLSearchParams();
		data.append('payment_method_types[0]', 'card');
		data.append('mode', 'payment');
		data.append('success_url', `${url.origin}/shop?success=true`);
		data.append('cancel_url', `${url.origin}/shop?canceled=true`);
		data.append('shipping_address_collection[allowed_countries][0]', 'AU');
		data.append('shipping_address_collection[allowed_countries][1]', 'US');
		data.append('shipping_address_collection[allowed_countries][2]', 'GB');
		data.append('shipping_address_collection[allowed_countries][3]', 'NZ');

		let totalItems = 0;

		items.forEach((item, index) => {
			const dbProduct: any = databaseProducts.find((p: any) => p.id === item.id);
			if (!dbProduct) throw new Error(`Product ${item.id} not found.`);
			if (!dbProduct.data.price) throw new Error(`Product ${item.id} has no price.`);

			data.append(`line_items[${index}][price_data][currency]`, 'aud');
			data.append(`line_items[${index}][price_data][unit_amount]`, dbProduct.data.price.toString());
			data.append(`line_items[${index}][price_data][product_data][name]`, dbProduct.data.title);
			data.append(`line_items[${index}][quantity]`, item.quantity.toString());
			
			totalItems += item.quantity;
		});

		// Calculate flat rate
		const shippingCost = BASE_SHIPPING_CENTS + (Math.max(0, totalItems - 1) * PER_EXTRA_ITEM_CENTS);
		
		data.append('shipping_options[0][shipping_rate_data][type]', 'fixed_amount');
		data.append('shipping_options[0][shipping_rate_data][fixed_amount][amount]', shippingCost.toString());
		data.append('shipping_options[0][shipping_rate_data][fixed_amount][currency]', 'aud');
		data.append('shipping_options[0][shipping_rate_data][display_name]', 'AusPost Standard Delivery');

		const stripeRes = await fetch('https://api.stripe.com/v1/checkout/sessions', {
			method: 'POST',
			headers: {
				'Authorization': `Bearer ${stripeKey}`,
				'Content-Type': 'application/x-www-form-urlencoded',
			},
			body: data.toString(),
		});

		const sessionData = await stripeRes.json();

		if (!stripeRes.ok) {
			console.error('Stripe native fetch error:', sessionData);
			return new Response(JSON.stringify({ error: sessionData.error?.message || 'Stripe error' }), { status: 500 });
		}

		return new Response(JSON.stringify({ url: sessionData.url }), {
			status: 200,
			headers: { 'Content-Type': 'application/json' },
		});
	} catch (error: any) {
		console.error('Checkout Error:', error);
		return new Response(JSON.stringify({ error: error.message }), { status: 500 });
	}
};
