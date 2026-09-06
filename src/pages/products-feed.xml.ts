import type { APIRoute } from "astro";
import { getEmDashCollection } from "emdash";
import { getBasePrice, getBaseStock, getProductVariants, getTrackStock } from "../utils/products";
import { resolveMediaUrl } from "../utils/post-format";
import { stripToPlainText } from "../utils/structured-data";

const BRAND_NAME = "Cueism";

export const GET: APIRoute = async ({ url }) => {
	const origin = url.origin.replace(/\/$/, "");

	const { entries = [] } = await getEmDashCollection("products", {
		orderBy: { published_at: "desc" },
	}).catch(() => ({ entries: [] }));

	const lines = [
		'<?xml version="1.0" encoding="UTF-8"?>',
		'<rss version="2.0" xmlns:g="http://base.google.com/ns/1.0">',
		'  <channel>',
		'    <title>Cueism Products Feed</title>',
		`    <link>${origin}</link>`,
		'    <description>Cueism product feed for Google Merchant Center</description>',
	];

	for (const product of entries as any[]) {
		try {
			if (!product) continue;
			const data = product.data || {};
			// Skip drafts or discontinued items
			if (product.status === "draft" || data.product_status === "draft" || data.product_status === "discontinued") {
				continue;
			}

			let slug = product.slug || product.id || "product";
			if (slug === "knuckles" || slug === "cheatstick" || slug === "chetastick") {
				slug = "amoeba";
			}
			const link = `${origin}/products/${slug}`;
			
			const featuredImage = data.featured_image 
				? resolveMediaUrl(data.featured_image) 
				: Array.isArray(data.gallery_images) && data.gallery_images[0]
					? resolveMediaUrl(data.gallery_images[0]?.image)
					: undefined;
			const imageLink = featuredImage 
				? (featuredImage.startsWith("http") ? featuredImage : `${origin}${featuredImage}`)
				: "";

			const price = getBasePrice(data);
			const formattedPrice = `${(typeof price === "number" ? price : 0).toFixed(2)} AUD`;

			const trackStock = getTrackStock(data);
			const variants = getProductVariants(data);
			const inStock = !trackStock || (variants.length > 0 ? variants.some((v) => v.stock > 0) : getBaseStock(data) > 0);
			const availability = inStock ? "in_stock" : "out_of_stock";

			const rawDescription = data.excerpt || data.description || `Buy ${data.title || "product"} online at Cueism.`;
			const cleanDescription = stripToPlainText(rawDescription, 1000);
			const weight = data.weight_grams ? `${data.weight_grams} g` : undefined;
			
			lines.push('    <item>');
			lines.push(`      <g:id>${product.id || slug}</g:id>`);
			lines.push(`      <g:title>${escapeXml(data.title || slug)}</g:title>`);
			lines.push(`      <g:description>${escapeXml(cleanDescription)}</g:description>`);
			lines.push(`      <g:link>${link}</g:link>`);
			if (imageLink) {
				lines.push(`      <g:image_link>${imageLink}</g:image_link>`);
			}
			lines.push(`      <g:price>${formattedPrice}</g:price>`);
			lines.push(`      <g:availability>${availability}</g:availability>`);
			lines.push('      <g:condition>new</g:condition>');
			lines.push(`      <g:brand>${BRAND_NAME}</g:brand>`);
			lines.push('      <g:identifier_exists>no</g:identifier_exists>');
			if (weight) {
				lines.push(`      <g:shipping_weight>${weight}</g:shipping_weight>`);
			}
			// Primary Australia shipping
			lines.push('      <g:shipping>');
			lines.push('        <g:country>AU</g:country>');
			lines.push('        <g:service>Standard Shipping</g:service>');
			lines.push('        <g:price>10.00 AUD</g:price>');
			lines.push('      </g:shipping>');
			// International shipping destinations
			lines.push('      <g:shipping>');
			lines.push('        <g:country>US</g:country>');
			lines.push('        <g:service>Standard International</g:service>');
			lines.push('        <g:price>10.00 AUD</g:price>');
			lines.push('      </g:shipping>');
			lines.push('      <g:shipping>');
			lines.push('        <g:country>GB</g:country>');
			lines.push('        <g:service>Standard International</g:service>');
			lines.push('        <g:price>10.00 AUD</g:price>');
			lines.push('      </g:shipping>');
			lines.push('      <g:shipping>');
			lines.push('        <g:country>NZ</g:country>');
			lines.push('        <g:service>Standard International</g:service>');
			lines.push('        <g:price>10.00 AUD</g:price>');
			lines.push('      </g:shipping>');
			lines.push('    </item>');
		} catch (e) {
			console.error(`Error processing product ${product?.id}:`, e);
		}
	}

	lines.push('  </channel>');
	lines.push('</rss>');

	return new Response(lines.join("\n"), {
		headers: {
			"Content-Type": "application/xml; charset=utf-8",
			"Cache-Control": "public, max-age=3600",
		},
	});
};

function escapeXml(value: string | undefined | null): string {
	if (!value) return "";
	return value
		.replace(/&/g, "&amp;")
		.replace(/</g, "&lt;")
		.replace(/>/g, "&gt;")
		.replace(/"/g, "&quot;")
		.replace(/'/g, "&apos;");
}
