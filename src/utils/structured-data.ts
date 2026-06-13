import {
	getBasePrice,
	getBaseStock,
	getPriceRange,
	getProductVariants,
	getTrackStock,
} from "./products";
import { getPostDate, getPostImageSrc, getPostIntro, type PostLike } from "./post-format";

const BRAND_NAME = "Cueism";
const BRAND_EMAIL = "0@cueism.com";
const CURRENCY = "AUD";

// Social profile URLs for the Organization's `sameAs`. Add real profiles here
// (Instagram, Facebook, etc.) to enrich brand attribution in AI/search results.
const SOCIAL_PROFILES: string[] = [];

/** Strip HTML tags, collapse whitespace, and truncate to a clean plain-text string. */
export function stripToPlainText(input: unknown, maxLen = 300): string {
	if (typeof input !== "string") return "";
	const clean = input
		.replace(/<[^>]*>/g, " ")
		.replace(/&nbsp;/g, " ")
		.replace(/&amp;/g, "&")
		.replace(/&lt;/g, "<")
		.replace(/&gt;/g, ">")
		.replace(/&quot;/g, '"')
		.replace(/&#39;/g, "'")
		.replace(/\s+/g, " ")
		.trim();
	return clean.length > maxLen ? `${clean.slice(0, maxLen - 1).trimEnd()}…` : clean;
}

/** Resolve a possibly-relative image/path to an absolute URL against the request origin. */
function toAbsoluteUrl(value: string | undefined, origin: string): string | undefined {
	if (!value) return undefined;
	if (/^https?:\/\//i.test(value)) return value;
	if (value.startsWith("//")) return `https:${value}`;
	return `${origin}${value.startsWith("/") ? "" : "/"}${value}`;
}

/** The WebSite graph — sitewide site identity. */
export function buildWebSite(origin: string): Record<string, unknown> {
	return {
		"@context": "https://schema.org",
		"@type": "WebSite",
		"@id": `${origin}/#website`,
		name: BRAND_NAME,
		url: origin,
		publisher: { "@id": `${origin}/#organization` },
	};
}

/** The Organization graph — sitewide brand identity. */
export function buildOrganization(origin: string): Record<string, unknown> {
	const org: Record<string, unknown> = {
		"@type": "Organization",
		"@id": `${origin}/#organization`,
		name: BRAND_NAME,
		url: origin,
		logo: `${origin}/favicon.ico`,
		email: BRAND_EMAIL,
		areaServed: "AU",
	};
	if (SOCIAL_PROFILES.length > 0) org.sameAs = SOCIAL_PROFILES;
	return {
		"@context": "https://schema.org",
		...org,
	};
}

type ProductEntry = {
	id: string;
	slug?: string | null;
	data: Record<string, any>;
};

function isInStock(data: Record<string, any>): boolean {
	if (!getTrackStock(data)) return true;
	const variants = getProductVariants(data);
	if (variants.length > 0) return variants.some((v) => v.stock > 0);
	return getBaseStock(data) > 0;
}

/** The Product graph (with Offer / AggregateOffer) for a single product page. */
export function buildProduct(product: ProductEntry, origin: string): Record<string, unknown> {
	const data = product.data;
	const slug = product.slug || product.id;
	const url = `${origin}/shop/${slug}`;

	const featured = data.featured_image as { src?: string; alt?: string } | undefined;
	const galleryFirst = Array.isArray(data.gallery_images)
		? data.gallery_images.map((g: any) => g?.image?.src).find(Boolean)
		: undefined;
	const imageSrc = toAbsoluteUrl(featured?.src || galleryFirst, origin);

	const availability = `https://schema.org/${isInStock(data) ? "InStock" : "OutOfStock"}`;
	const range = getPriceRange(data);
	const hasSpread = range.min !== range.max;

	const offers: Record<string, unknown> = hasSpread
		? {
				"@type": "AggregateOffer",
				priceCurrency: CURRENCY,
				lowPrice: range.min,
				highPrice: range.max,
				offerCount: getProductVariants(data).length || undefined,
				availability,
				url,
			}
		: {
				"@type": "Offer",
				priceCurrency: CURRENCY,
				price: range.min || getBasePrice(data),
				availability,
				url,
			};

	const graph: Record<string, unknown> = {
		"@context": "https://schema.org",
		"@type": "Product",
		name: typeof data.title === "string" ? data.title : "Product",
		url,
		brand: { "@type": "Brand", name: BRAND_NAME },
		offers,
	};

	const description = stripToPlainText(data.excerpt ?? data.description);
	if (description) graph.description = description;
	if (imageSrc) graph.image = imageSrc;
	if (typeof featured?.alt === "string" && featured.alt.trim()) {
		// nothing extra; alt already conveyed via image
	}

	return graph;
}

/** The BlogPosting graph for a single journal post. */
export function buildBlogPosting(post: PostLike, origin: string): Record<string, unknown> {
	const data = post.data || {};
	const slug = post.slug || post.id;
	const url = `${origin}/posts/${slug}`;

	const graph: Record<string, unknown> = {
		"@context": "https://schema.org",
		"@type": "BlogPosting",
		headline: typeof data.title === "string" ? data.title : "Post",
		url,
		mainEntityOfPage: url,
		publisher: {
			"@type": "Organization",
			name: BRAND_NAME,
			logo: { "@type": "ImageObject", url: `${origin}/favicon.ico` },
		},
	};

	const description = getPostIntro(post, 300);
	if (description) graph.description = description;

	const imageSrc = toAbsoluteUrl(getPostImageSrc(post), origin);
	if (imageSrc) graph.image = imageSrc;

	const published = getPostDate(post);
	if (published) graph.datePublished = published.toISOString();

	const author = typeof data.author === "string" ? data.author : undefined;
	if (author) graph.author = { "@type": "Person", name: author };

	return graph;
}
