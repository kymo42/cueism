import type { APIRoute } from 'astro';
import { getEmDashCollection } from 'emdash';
import { getBasePrice, getBaseStock, getTrackStock, getVariantById } from '../../utils/products';

const BASE_SHIPPING_CENTS = 1000;
const PER_EXTRA_ITEM_CENTS = 200;

export const POST: APIRoute = async ({ request, url, locals }) => {
	try {
		const runtimeEnv = (locals as any)?.runtime?.env;
		const stripeKey =
			import.meta.env.STRIPE_SECRET_KEY ||
			runtimeEnv?.STRIPE_SECRET_KEY ||
			runtimeEnv?.STRIPE_SECRET;
		if (!stripeKey) {
			return new Response(
				JSON.stringify({
					error: 'Stripe key not configured. Set STRIPE_SECRET_KEY in Cloudflare environment variables.',
				}),
				{ status: 500 },
			);
		}

		const body = await request.json();
		const items = body.items as {
			id: string;
			productId?: string;
			variantId?: string;
			quantity: number;
		}[];
		const checkoutMeta = body.checkoutMeta as {
			chalkType?: string;
			giftOptIn?: boolean;
		} | undefined;

		if (!items || items.length === 0) {
			return new Response(JSON.stringify({ error: 'Cart is empty' }), { status: 400 });
		}

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
		const chalkType = (checkoutMeta?.chalkType || '').trim();
		const giftOptIn = checkoutMeta?.giftOptIn === true;
		
		if (!chalkType) {
			return new Response(JSON.stringify({ error: 'Please select your chalk type' }), { status: 400 });
		}

		items.forEach((item, index) => {
			const productId = item.productId || item.id;
			const dbProduct: any = databaseProducts.find((product: any) => product.id === productId);
			if (!dbProduct) throw new Error(`Product ${productId} not found.`);
			if (!Number.isFinite(item.quantity) || item.quantity <= 0) {
				throw new Error(`Invalid quantity for product ${productId}.`);
			}

			const variant = getVariantById(dbProduct.data, item.variantId);
			const unitPriceDollars = variant?.price ?? getBasePrice(dbProduct.data);
			if (!Number.isFinite(unitPriceDollars) || unitPriceDollars <= 0) {
				throw new Error(`Product ${productId} has invalid price.`);
			}

			const trackStock = getTrackStock(dbProduct.data);
			if (trackStock) {
				const stock = variant?.stock ?? getBaseStock(dbProduct.data);
				if (stock < item.quantity) {
					throw new Error(`Insufficient stock for ${dbProduct.data.title}.`);
				}
			}

			const unitAmountCents = Math.round(unitPriceDollars * 100);
			data.append(`line_items[${index}][price_data][currency]`, 'aud');
			data.append(`line_items[${index}][price_data][unit_amount]`, unitAmountCents.toString());
			data.append(
				`line_items[${index}][price_data][product_data][name]`,
				variant ? `${dbProduct.data.title} - ${variant.label}` : dbProduct.data.title,
			);
			data.append(`line_items[${index}][quantity]`, item.quantity.toString());

			totalItems += item.quantity;
		});

		const shippingCost = BASE_SHIPPING_CENTS + Math.max(0, totalItems - 1) * PER_EXTRA_ITEM_CENTS;

		data.append('metadata[chalk_type]', chalkType);
		data.append('metadata[gift_opt_in]', giftOptIn ? 'yes' : 'no');

		data.append('shipping_options[0][shipping_rate_data][type]', 'fixed_amount');
		data.append('shipping_options[0][shipping_rate_data][fixed_amount][amount]', shippingCost.toString());
		data.append('shipping_options[0][shipping_rate_data][fixed_amount][currency]', 'aud');
		data.append('shipping_options[0][shipping_rate_data][display_name]', 'AusPost Standard Delivery');

		const stripeRes = await fetch('https://api.stripe.com/v1/checkout/sessions', {
			method: 'POST',
			headers: {
				Authorization: `Bearer ${stripeKey}`,
				'Content-Type': 'application/x-www-form-urlencoded',
			},
			body: data.toString(),
		});

		const sessionData = await stripeRes.json();

		if (!stripeRes.ok) {
			return new Response(JSON.stringify({ error: sessionData.error?.message || 'Stripe error' }), { status: 500 });
		}

		return new Response(JSON.stringify({ url: sessionData.url }), {
			status: 200,
			headers: { 'Content-Type': 'application/json' },
		});
	} catch (error: any) {
		return new Response(JSON.stringify({ error: error.message }), { status: 500 });
	}
};
