import type { APIRoute } from 'astro';
import { getEmDashCollection } from 'emdash';
import { getBasePrice, getBaseStock, getTrackStock, getVariantById } from '../../utils/products';
import {
	type PersonalizationType,
	getLogoSurcharge,
	getPersonalizationSurcharge,
} from '../../utils/surcharges';
import { STRIPE_ALLOWED_SHIPPING_COUNTRIES } from '../../utils/countries';

const BASE_SHIPPING_CENTS = 1000;
const PER_EXTRA_ITEM_CENTS = 200;
const INT_BASE_SHIPPING_CENTS = 2600; // $26.00 AUD for international standard
const INT_PER_EXTRA_ITEM_CENTS = 400; // $4.00 AUD per extra item international

export const POST: APIRoute = async ({ request, url }) => {
	try {
		const runtimeEnv = (globalThis as any)?.process?.env || {};
		const stripeKey =
			import.meta.env.STRIPE_SECRET_KEY ||
			runtimeEnv.STRIPE_SECRET_KEY ||
			runtimeEnv.STRIPE_SECRET;
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
			slug?: string;
			variantId?: string;
			color?: string;
			nogennColor?: string;
			logoUrl?: string;
			faceUrl?: string;
			personalizationType?: PersonalizationType;
			personalization?: string;
			quantity: number;
		}[];
		const checkoutMeta = body.checkoutMeta as {
			chalkType?: string;
			cueMaker?: string;
			giftOptIn?: boolean;
			shippingDestination?: 'domestic' | 'international';
		} | undefined;

		if (!items || items.length === 0) {
			return new Response(JSON.stringify({ error: 'Cart is empty' }), { status: 400 });
		}

		const { entries: databaseProducts } = await getEmDashCollection('products', {
			orderBy: { published_at: 'desc' },
		}).catch(() => ({ entries: [] }));
		const productMap = new Map<string, any>();
		databaseProducts.forEach((product: any) => {
			productMap.set(product.id, product);
		});

		const data = new URLSearchParams();
		data.append('payment_method_types[0]', 'card');
		data.append('mode', 'payment');
		data.append('success_url', `${url.origin}/products?success=true`);
		data.append('cancel_url', `${url.origin}/products?canceled=true`);
		STRIPE_ALLOWED_SHIPPING_COUNTRIES.forEach((countryCode, index) => {
			data.append(`shipping_address_collection[allowed_countries][${index}]`, countryCode);
		});

		let totalItems = 0;
		const chalkType = (checkoutMeta?.chalkType || '').trim();
		const cueMaker = (checkoutMeta?.cueMaker || '').trim();
		const giftOptIn = checkoutMeta?.giftOptIn === true;
		
		if (!chalkType) {
			return new Response(JSON.stringify({ error: 'Please select your chalk type' }), { status: 400 });
		}
		if (!cueMaker || !['Mezz', 'Predator'].includes(cueMaker)) {
			return new Response(JSON.stringify({ error: 'Please choose either Mezz or Predator' }), { status: 400 });
		}

		items.forEach((item, index) => {
			const productId = item.productId || item.id;
			const dbProduct: any = productMap.get(productId);
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

			// Recompute personalization / logo surcharges server-side from the shared
			// source of truth. Never trust the client-sent price — only the chosen
			// personalization type, which can only select among allowed surcharges.
			const productSlug = item.slug || dbProduct.slug || dbProduct.id || productId;
			const personalizationType: PersonalizationType = item.personalizationType ?? 'none';
			const personalizationSurcharge = getPersonalizationSurcharge(personalizationType, productSlug);
			const logoSurcharge = item.logoUrl ? getLogoSurcharge(productSlug, item.variantId) : 0;
			const unitAmountCents = Math.round((unitPriceDollars + personalizationSurcharge + logoSurcharge) * 100);
			data.append(`line_items[${index}][price_data][currency]`, 'aud');
			data.append(`line_items[${index}][price_data][unit_amount]`, unitAmountCents.toString());
			const lineNameBase = variant ? `${dbProduct.data.title} - ${variant.label}` : dbProduct.data.title;
			const colourSuffix = [item.color, item.nogennColor ? `Nogenn ${item.nogennColor}` : null]
				.filter(Boolean)
				.join(', ');
			const lineName = colourSuffix ? `${lineNameBase} - ${colourSuffix}` : lineNameBase;
			data.append(`line_items[${index}][price_data][product_data][name]`, lineName);
			data.append(`line_items[${index}][quantity]`, item.quantity.toString());

			if (item.logoUrl) {
				const absoluteLogo = item.logoUrl.startsWith('http') ? item.logoUrl : `${url.origin}${item.logoUrl}`;
				data.append(`metadata[logo_${index}]`, absoluteLogo);
			}

			if (item.faceUrl) {
				const absoluteFace = item.faceUrl.startsWith('http') ? item.faceUrl : `${url.origin}${item.faceUrl}`;
				data.append(`metadata[face_${index}]`, absoluteFace);
			}

			if (item.personalization) {
				data.append(`metadata[personalization_${index}]`, item.personalization);
			}

			totalItems += item.quantity;
		});

		const shippingDestination = checkoutMeta?.shippingDestination || 'domestic';
		const domesticShippingCost = BASE_SHIPPING_CENTS + Math.max(0, totalItems - 1) * PER_EXTRA_ITEM_CENTS;
		const intShippingCost = INT_BASE_SHIPPING_CENTS + Math.max(0, totalItems - 1) * INT_PER_EXTRA_ITEM_CENTS;

		data.append('metadata[chalk_type]', chalkType);
		data.append('metadata[cue_maker]', cueMaker);
		data.append('metadata[gift_opt_in]', giftOptIn ? 'yes' : 'no');
		data.append('metadata[shipping_destination]', shippingDestination);

		const domesticOption = {
			amount: domesticShippingCost,
			name: 'AusPost Domestic (Australia)',
			minDays: '2',
			maxDays: '5',
		};

		const intOption = {
			amount: intShippingCost,
			name: 'AusPost International Standard (Worldwide)',
			minDays: '6',
			maxDays: '15',
		};

		// If customer selected International in cart, prioritize international option first
		const orderedShippingOptions = shippingDestination === 'international'
			? [intOption, domesticOption]
			: [domesticOption, intOption];

		orderedShippingOptions.forEach((opt, idx) => {
			data.append(`shipping_options[${idx}][shipping_rate_data][type]`, 'fixed_amount');
			data.append(`shipping_options[${idx}][shipping_rate_data][fixed_amount][amount]`, opt.amount.toString());
			data.append(`shipping_options[${idx}][shipping_rate_data][fixed_amount][currency]`, 'aud');
			data.append(`shipping_options[${idx}][shipping_rate_data][display_name]`, opt.name);
			data.append(`shipping_options[${idx}][shipping_rate_data][delivery_estimate][minimum][unit]`, 'business_day');
			data.append(`shipping_options[${idx}][shipping_rate_data][delivery_estimate][minimum][value]`, opt.minDays);
			data.append(`shipping_options[${idx}][shipping_rate_data][delivery_estimate][maximum][unit]`, 'business_day');
			data.append(`shipping_options[${idx}][shipping_rate_data][delivery_estimate][maximum][value]`, opt.maxDays);
		});

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
