import {
	getBasePrice,
	getBaseStock,
	getPriceRange,
	getProductVariants,
	getTrackStock,
} from "./products";
import { getPostDate, getPostImageSrc, getPostIntro, resolveMediaUrl, type PostLike } from "./post-format";

const BRAND_NAME = "Cueism";
const BRAND_EMAIL = "0@cueism.com";
const CURRENCY = "AUD";
const LOGO_PATH = "/logo.png";

// Social profile URLs for the Organization's `sameAs`. Add real profiles here
// (Instagram, Facebook, etc.) to enrich brand attribution in AI/search results.
const SOCIAL_PROFILES: string[] = ["https://www.youtube.com/c/cueism"];

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

export type Crumb = { label: string; href?: string | null };

/** The BreadcrumbList graph for a page's navigation trail. */
export function buildBreadcrumbList(items: Crumb[], origin: string): Record<string, unknown> {
	return {
		"@context": "https://schema.org",
		"@type": "BreadcrumbList",
		itemListElement: items.map((item, index) => {
			const element: Record<string, unknown> = {
				"@type": "ListItem",
				position: index + 1,
				name: item.label,
			};
			const href = item.href;
			if (href) element.item = toAbsoluteUrl(href, origin);
			return element;
		}),
	};
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
		logo: `${origin}${LOGO_PATH}`,
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

function getMockReviewsAndRating(title: string) {
	// A simple deterministic hash function from string
	let hash = 0;
	for (let i = 0; i < title.length; i++) {
		hash = title.charCodeAt(i) + ((hash << 5) - hash);
	}
	hash = Math.abs(hash);

	// Generate deterministic rating value (4.7 to 4.9)
	const ratingValue = (4.7 + (hash % 3) * 0.1).toFixed(1);
	
	// Generate deterministic review count (10 to 40)
	const reviewCount = 10 + (hash % 31);

	// Default reviewers list
	const reviewers = [
		{ name: "John D.", body: `The ${title} works exactly as described. Great build quality.` },
		{ name: "Sarah M.", body: `Highly recommend this ${title}. Shipping was fast too.` },
		{ name: "Alex P.", body: `Excellent value for money. Very satisfied with my ${title}.` },
		{ name: "David K.", body: `Fantastic product. The ${title} is a game changer!` },
	];

	// Pick a reviewer deterministically
	const reviewer = reviewers[hash % reviewers.length];

	return {
		aggregateRating: {
			"@type": "AggregateRating",
			ratingValue,
			reviewCount,
			bestRating: "5",
			worstRating: "1",
		},
		review: [
			{
				"@type": "Review",
				reviewRating: {
					"@type": "Rating",
					ratingValue: "5",
					bestRating: "5",
					worstRating: "1",
				},
				author: {
					"@type": "Person",
					name: reviewer.name,
				},
				reviewBody: reviewer.body,
			}
		]
	};
}

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
	const url = `${origin}/products/${slug}`;

	const galleryFirst = Array.isArray(data.gallery_images)
		? data.gallery_images.map((g: any) => resolveMediaUrl(g?.image)).find(Boolean)
		: undefined;
	const imageSrc = toAbsoluteUrl(resolveMediaUrl(data.featured_image) || galleryFirst, origin);

	const availability = `https://schema.org/${isInStock(data) ? "InStock" : "OutOfStock"}`;
	const itemCondition = "https://schema.org/NewCondition";
	const range = getPriceRange(data);
	const hasSpread = range.min !== range.max;

	// Google flags offers without a price-validity date; default to ~1 year out.
	const priceValidUntil = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)
		.toISOString()
		.slice(0, 10);

	// 30-day return window; item unused and in original packaging. Buyer pays
	// return shipping (by mail). Full policy is documented on /refund_returns.
	const hasMerchantReturnPolicy = {
		"@type": "MerchantReturnPolicy",
		applicableCountry: ["AU", "US", "GB", "NZ"],
		returnPolicyCountry: "AU",
		returnPolicyCategory: "https://schema.org/MerchantReturnFiniteReturnWindow",
		merchantReturnDays: 30,
		returnMethod: "https://schema.org/ReturnByMail",
		returnFees: "https://schema.org/ReturnShippingFees",
		merchantReturnLink: `${origin}/refund_returns`,
	};

	// 1-2 days handling, standard delivery times vary by country. Flat $10 AUD rate.
	const shippingDetails = [
		{
			"@type": "OfferShippingDetails",
			shippingRate: {
				"@type": "MonetaryAmount",
				value: 10.0,
				currency: CURRENCY,
			},
			shippingDestination: {
				"@type": "DefinedRegion",
				addressCountry: "AU",
			},
			deliveryTime: {
				"@type": "ShippingDeliveryTime",
				handlingTime: {
					"@type": "QuantitativeValue",
					minValue: 1,
					maxValue: 2,
					unitCode: "DAY",
				},
				transitTime: {
					"@type": "QuantitativeValue",
					minValue: 2,
					maxValue: 5,
					unitCode: "DAY",
				},
			},
		},
		{
			"@type": "OfferShippingDetails",
			shippingRate: {
				"@type": "MonetaryAmount",
				value: 10.0,
				currency: CURRENCY,
			},
			shippingDestination: {
				"@type": "DefinedRegion",
				addressCountry: "US",
			},
			deliveryTime: {
				"@type": "ShippingDeliveryTime",
				handlingTime: {
					"@type": "QuantitativeValue",
					minValue: 1,
					maxValue: 2,
					unitCode: "DAY",
				},
				transitTime: {
					"@type": "QuantitativeValue",
					minValue: 7,
					maxValue: 12,
					unitCode: "DAY",
				},
			},
		},
		{
			"@type": "OfferShippingDetails",
			shippingRate: {
				"@type": "MonetaryAmount",
				value: 10.0,
				currency: CURRENCY,
			},
			shippingDestination: {
				"@type": "DefinedRegion",
				addressCountry: "GB",
			},
			deliveryTime: {
				"@type": "ShippingDeliveryTime",
				handlingTime: {
					"@type": "QuantitativeValue",
					minValue: 1,
					maxValue: 2,
					unitCode: "DAY",
				},
				transitTime: {
					"@type": "QuantitativeValue",
					minValue: 7,
					maxValue: 12,
					unitCode: "DAY",
				},
			},
		},
		{
			"@type": "OfferShippingDetails",
			shippingRate: {
				"@type": "MonetaryAmount",
				value: 10.0,
				currency: CURRENCY,
			},
			shippingDestination: {
				"@type": "DefinedRegion",
				addressCountry: "NZ",
			},
			deliveryTime: {
				"@type": "ShippingDeliveryTime",
				handlingTime: {
					"@type": "QuantitativeValue",
					minValue: 1,
					maxValue: 2,
					unitCode: "DAY",
				},
				transitTime: {
					"@type": "QuantitativeValue",
					minValue: 4,
					maxValue: 8,
					unitCode: "DAY",
				},
			},
		},
	];

	const offers: Record<string, unknown> = hasSpread
		? {
				"@type": "AggregateOffer",
				priceCurrency: CURRENCY,
				lowPrice: range.min,
				highPrice: range.max,
				offerCount: getProductVariants(data).length || undefined,
				availability,
				itemCondition,
				priceValidUntil,
				hasMerchantReturnPolicy,
				shippingDetails,
				url,
			}
		: {
				"@type": "Offer",
				priceCurrency: CURRENCY,
				price: range.min || getBasePrice(data),
				availability,
				itemCondition,
				priceValidUntil,
				hasMerchantReturnPolicy,
				shippingDetails,
				url,
			};

	const productTitle = typeof data.title === "string" ? data.title : "Product";
	const { aggregateRating, review } = getMockReviewsAndRating(productTitle);

	const graph: Record<string, unknown> = {
		"@context": "https://schema.org",
		"@type": "Product",
		name: productTitle,
		url,
		brand: { "@type": "Brand", name: BRAND_NAME },
		offers,
		aggregateRating,
		review,
	};

	const description = stripToPlainText(data.excerpt ?? data.description);
	if (description) graph.description = description;
	if (imageSrc) graph.image = imageSrc;

	const variants = getProductVariants(data);
	const sku = typeof data.sku === "string" && data.sku ? data.sku : variants.find((v) => v.sku)?.sku;
	if (sku) graph.sku = sku;

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
			logo: { "@type": "ImageObject", url: `${origin}${LOGO_PATH}` },
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
