import type { APIRoute } from "astro";
import { getEmDashCollection } from "emdash";
import {
	getBasePrice,
	getBaseStock,
	getBaseWeightGrams,
	getCuratedProductGallery,
	getPriceRange,
	getProductCustomizationSummary,
	getProductVariants,
} from "../utils/products";
import { stripToPlainText } from "../utils/structured-data";
import { LOGO_SURCHARGE_BY_VARIANT } from "../utils/surcharges";

export const GET: APIRoute = async ({ url }) => {
	const origin = url.origin.replace(/\/$/, "");

	const { entries = [] } = await getEmDashCollection("products", {
		orderBy: { published_at: "desc" },
	}).catch(() => ({ entries: [] }));

	const products = [];

	for (const entry of entries as any[]) {
		if (!entry) continue;
		const data = entry.data || {};
		if (
			entry.status === "draft" ||
			data.product_status === "draft" ||
			data.product_status === "discontinued"
		) {
			continue;
		}

		let slug = entry.slug || entry.id || "product";
		if (slug === "knuckles" || slug === "cheatstick" || slug === "chetastick") {
			slug = "amoeba";
		}

		const gallery = getCuratedProductGallery(slug, data).map((img) => ({
			url: img.src.startsWith("http") ? img.src : `${origin}${img.src}`,
			alt: img.alt,
			color: img.color,
			personalization: img.personalization,
		}));

		const variants = getProductVariants(data);
		const priceRange = getPriceRange(data);
		const basePrice = getBasePrice(data);
		const baseStock = getBaseStock(data);
		const customization = getProductCustomizationSummary(slug, data);
		const inStock =
			!customization.trackStock ||
			(variants.length > 0 ? variants.some((v) => v.stock > 0) : baseStock > 0);

		products.push({
			id: entry.id || slug,
			slug,
			title: data.title || slug,
			url: `${origin}/products/${slug}`,
			description: stripToPlainText(data.excerpt || data.description, 1000),
			currency: "AUD",
			basePrice,
			priceRange,
			inStock,
			trackStock: customization.trackStock,
			stock: customization.trackStock ? baseStock : null,
			weightGrams: getBaseWeightGrams(data),
			images: gallery,
			variants: variants.map((v) => ({
				id: v.id,
				label: v.label,
				optionGroup: v.optionGroup,
				optionValue: v.optionValue,
				price: v.price,
				stock: customization.trackStock ? v.stock : null,
				inStock: !customization.trackStock || v.stock > 0,
				sku: v.sku || `${slug}:${v.id}`,
			})),
			options: {
				requireVariant: customization.requireVariant,
				showColor: customization.showColor,
				colors: customization.colors,
				allowColourRequest: customization.allowColourRequest,
				nogennColours: customization.nogennColours,
				allowLogoUpload: customization.allowLogoUpload,
				logoSurchargeByVariantAud: LOGO_SURCHARGE_BY_VARIANT[slug] || null,
				embeddedNfcOnly: customization.embeddedNfcOnly,
				personalizations: customization.personalizations,
			},
		});
	}

	const payload = {
		brand: {
			name: "Cueism",
			url: origin,
			email: "0@cueism.com",
			country: "AU",
			currency: "AUD",
			description:
				"Australian-made, 3D-printed billiards and pool accessories printed to order from recycled and biodegradable materials.",
		},
		shipping: {
			currency: "AUD",
			domestic: {
				country: "AU",
				service: "AusPost Domestic (Australia)",
				basePriceAud: 10.0,
				extraItemAud: 2.0,
				estimatedBusinessDays: { min: 2, max: 5 },
			},
			international: {
				countries: "Worldwide (Stripe supported shipping destinations)",
				service: "AusPost International Standard (Worldwide)",
				basePriceAud: 26.0,
				extraItemAud: 4.0,
				estimatedBusinessDays: { min: 6, max: 15 },
			},
		},
		returnsPolicy: {
			windowDays: 30,
			url: `${origin}/refund_returns`,
		},
		checkoutApi: {
			endpoint: `${origin}/api/checkout`,
			method: "POST",
			description:
				"Creates a Stripe Checkout Session and returns `{ url }` where the shopper or agent completes payment.",
		},
		products,
	};

	return new Response(JSON.stringify(payload, null, 2), {
		status: 200,
		headers: {
			"Content-Type": "application/json; charset=utf-8",
			"Access-Control-Allow-Origin": "*",
			"Cache-Control": "public, max-age=600",
		},
	});
};
