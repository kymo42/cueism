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
		const data = product.data;
		const slug = product.slug || product.id;
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
		const formattedPrice = `${price.toFixed(2)} AUD`;

		const trackStock = getTrackStock(data);
		const variants = getProductVariants(data);
		const inStock = !trackStock || (variants.length > 0 ? variants.some((v) => v.stock > 0) : getBaseStock(data) > 0);
		const availability = inStock ? "in_stock" : "out_of_stock";

		const rawDescription = data.excerpt || data.description || `Buy ${data.title} online at Cueism.`;
		const cleanDescription = stripToPlainText(rawDescription, 1000);
		
		lines.push('    <item>');
		lines.push(`      <g:id>${product.id}</g:id>`);
		lines.push(`      <g:title>${escapeXml(data.title)}</g:title>`);
		lines.push(`      <g:description>${escapeXml(cleanDescription)}</g:description>`);
		lines.push(`      <g:link>${link}</g:link>`);
		if (imageLink) {
			lines.push(`      <g:image_link>${imageLink}</g:image_link>`);
		}
		lines.push(`      <g:price>${formattedPrice}</g:price>`);
		lines.push(`      <g:availability>${availability}</g:availability>`);
		lines.push('      <g:condition>new</g:condition>');
		lines.push(`      <g:brand>${BRAND_NAME}</g:brand>`);
		lines.push('    </item>');
	}

	lines.push('  </channel>');
	lines.push('</rss>');

	return new Response(lines.join("\n"), {
		headers: {
			"Content-Type": "application/xml",
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
