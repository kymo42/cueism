import type { APIRoute } from "astro";
import { getEmDashCollection } from "emdash";
import {
	getBaseStock,
	getPriceRange,
	getProductCustomizationSummary,
	getProductVariants,
} from "../utils/products";
import { stripToPlainText } from "../utils/structured-data";

export const GET: APIRoute = async ({ url }) => {
	const origin = url.origin;

	const { entries: products = [] } = await getEmDashCollection("products", {
		orderBy: { published_at: "desc" },
	}).catch(() => ({ entries: [] }));

	const { entries: posts = [] } = await getEmDashCollection("posts", {
		orderBy: { published_at: "desc" },
	}).catch(() => ({ entries: [] }));

	const lines: string[] = [
		"# Cueism",
		"",
		"> Australian-made, 3D-printed billiards and pool accessories. Products are printed to order using recycled and biodegradable materials — not mass-produced.",
		"",
		"## Shop Products (Prices in AUD)",
		"",
	];

	for (const product of products) {
		const data = (product as any).data || {};
		if (
			(product as any).status === "draft" ||
			data.product_status === "draft" ||
			data.product_status === "discontinued"
		) {
			continue;
		}
		const slug = (product as any).slug || product.id;
		const title = data.title ?? slug;
		const range = getPriceRange(data);
		const priceStr =
			range.min === range.max
				? `$${range.min.toFixed(2)} AUD`
				: `$${range.min.toFixed(2)}–$${range.max.toFixed(2)} AUD`;
		const variants = getProductVariants(data);
		const customization = getProductCustomizationSummary(slug, data);
		const inStock =
			!customization.trackStock ||
			(variants.length > 0 ? variants.some((v) => v.stock > 0) : getBaseStock(data) > 0);
		const summary = stripToPlainText(data.excerpt || data.description, 220);

		lines.push(
			`- [${title}](${origin}/products/${slug}) — **${priceStr}** (${inStock ? "In Stock" : "Out of Stock"})${summary ? `: ${summary}` : ""}`,
		);
		if (variants.length > 0) {
			lines.push(
				`  - Variants: ${variants.map((v) => `${v.label} ($${v.price.toFixed(2)} AUD${customization.trackStock ? `, ${v.stock} in stock` : ""})`).join(", ")}`,
			);
		}
		if (customization.colors.length > 0) {
			lines.push(`  - Body colours: ${customization.colors.join(", ")}`);
		}
		if (customization.nogennColours.length > 0) {
			lines.push(`  - Nogenn grip colours: ${customization.nogennColours.join(", ")}`);
		}
		if (customization.personalizations.length > 0) {
			lines.push(
				`  - Personalization: ${customization.personalizations.map((p) => (p.surchargeAud > 0 ? `${p.label} (+$${p.surchargeAud} AUD)` : p.label)).join(", ")}`,
			);
		}
	}

	lines.push(
		"",
		"## Shipping & Returns",
		"",
		"- **Australia (AusPost Domestic):** $10.00 AUD base (+$2.00 AUD per additional item), 2–5 business days.",
		"- **International (AusPost Standard Worldwide):** $26.00 AUD base (+$4.00 AUD per additional item), 6–15 business days.",
		"- **Returns:** 30-day return window for unused items in original packaging ([Returns & Refunds](" +
			`${origin}/refund_returns)).`,
		"",
		"## Shopping Agents & Machine-Readable Endpoints",
		"",
		`- [Product Catalog JSON](${origin}/products.json): Full machine-readable product catalog, variants, options, and surcharges.`,
		`- [Agent Discovery Manifest](${origin}/.well-known/agent.json): Capabilities and API discovery for autonomous shopping agents.`,
		`- [Google Merchant XML Feed](${origin}/products-feed.xml): RSS 2.0 / Google Merchant Center product feed.`,
		`- [Direct Checkout Session API](${origin}/api/checkout): \`GET\` for schema or \`POST\` JSON to create a Stripe Checkout Session URL.`,
		"",
		"## Journal",
		"",
	);

	for (const post of posts.slice(0, 20)) {
		const slug = (post as any).slug || post.id;
		const title = (post as any).data?.title ?? slug;
		lines.push(`- [${title}](${origin}/posts/${slug})`);
	}

	lines.push(
		"",
		"## Pages",
		"",
		`- [Shop](${origin}/products)`,
		`- [Journal](${origin}/posts)`,
		`- [About](${origin}/about)`,
		`- [FAQ](${origin}/faq)`,
		`- [Contact](${origin}/contact)`,
		`- [Returns & Refunds](${origin}/refund_returns)`,
		"",
	);

	return new Response(lines.join("\n"), {
		headers: {
			"Content-Type": "text/plain; charset=utf-8",
			"Cache-Control": "public, max-age=3600",
		},
	});
};
