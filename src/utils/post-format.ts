export type PostLike = {
	id: string;
	slug?: string | null;
	data?: Record<string, any>;
};

const stripHtml = (value: string) => value.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();

const normalizeImageUrl = (value?: string) => {
	if (!value) return undefined;
	if (value.startsWith("//")) return `https:${value}`;
	return value;
};

const looksLikeImageUrl = (value: string) => {
	return /\.(png|jpe?g|webp|gif|avif|svg)(\?.*)?$/i.test(value) || value.includes("/wp-content/uploads/");
};

const findImageUrlDeep = (input: any): string | undefined => {
	if (!input) return undefined;

	if (typeof input === "string") {
		const normalized = normalizeImageUrl(input);
		if (normalized && looksLikeImageUrl(normalized)) return normalized;
		return undefined;
	}

	if (Array.isArray(input)) {
		for (const item of input) {
			const found = findImageUrlDeep(item);
			if (found) return found;
		}
		return undefined;
	}

	if (typeof input === "object") {
		const directCandidates = [input.src, input.url, input.href, input.original, input.image_url];
		for (const candidate of directCandidates) {
			if (typeof candidate === "string") {
				const normalized = normalizeImageUrl(candidate);
				if (normalized && looksLikeImageUrl(normalized)) return normalized;
			}
		}

		for (const value of Object.values(input)) {
			const found = findImageUrlDeep(value);
			if (found) return found;
		}
	}

	return undefined;
};

export const OPTIMIZED_PRODUCT_MEDIA_URLS: Record<string, string> = {
	// Rac9safe
	"01KW6KRTSFK2KZK98NDJJPA4RR.jpg": "/products/racksafe9_0_featured.jpg",
	"01KVZ9J0T04S6TS8D0HGAD77CB.jpg": "/products/racksafe9_1.jpg",
	"01KVZ9JXEWHTY45XM07S4530M7.jpg": "/products/racksafe9_2.jpg",
	"01KW6MYF3K8E2K1JPAEDNREFPP.jpg": "/products/racksafe9_3.jpg",
	"01KVZ9M7MK8A3VTPV3D2YHSKSS.jpg": "/products/racksafe9_4.jpg",
	"01KW6M5D97FSSCDEP8442AFVGQ.jpg": "/products/racksafe9_5.jpg",
	"/R1.jpg": "/products/racksafe9_0_featured.jpg",
	"/r2.jpg": "/products/racksafe9_3.jpg",
	"/IMG_20260628_174712842.jpg": "/products/racksafe9_5.jpg",
	"/generated/racksafe9_colors.jpg": "/products/racksafe9_colors.jpg",
	// Chalkable
	"01KNS10S5B4S82DDY68KTE8PH7.jpg": "/products/chalkable_0_featured.jpg",
	"01KW76DE7Z8WA72H5T1XFFQDMB.jpg": "/products/chalkable_1.jpg",
	"01KW76DE80N60S05F1B8AJDFPA.jpg": "/products/chalkable_2.jpg",
	"01KW76DE81H0DPRB3Q3M1VP307.jpg": "/products/chalkable_3.jpg",
	// Safe9
	"01KW79TA99V2HAAS8JMJ91ZKFA.jpg": "/products/safe9_0_featured.jpg",
	"01KW78VX7HC9DKW49Z04BSM0PB.jpg": "/products/safe9_1_pink.jpg",
	"01KW78VX7JQME1FC86RRKJ9AAS.jpg": "/products/safe9_2_blue.jpg",
	"01KW78VX7KCKDERD9BA32JCQTG.jpg": "/products/safe9_3_grey.jpg",
	"01KW78VX7M1XEB0NP4HRT4GEG8.jpg": "/products/safe9_4_yellow.jpg",
	"01KW78VX7NW4RF3WA44N8X11CW.jpg": "/products/safe9_5_green.jpg",
	"01KW78VX7PCJ74G6ZBAB01894S.jpg": "/products/safe9_6_blackwhite.jpg",
	// Amoeba
	"/k2.jpg": "/products/k2.jpg",
	"/k3.jpg": "/products/k3.jpg",
	"/k4.jpg": "/products/k4.jpg",
	"/k7.jpg": "/products/k7.jpg",
};

/**
 * Resolve an EmDash image field value to a URL.
 * Handles plain strings, `{ src }` / `{ url }` shapes, and managed media
 * (`provider: "local"` with `meta.storageKey`, served from the media endpoint).
 */
export function resolveMediaUrl(image: any): string | undefined {
	if (!image) return undefined;
	if (typeof image === "string") {
		const normalized = normalizeImageUrl(image);
		if (!normalized) return undefined;
		if (OPTIMIZED_PRODUCT_MEDIA_URLS[normalized]) return OPTIMIZED_PRODUCT_MEDIA_URLS[normalized];
		const keyFromPath = normalized.startsWith("/_emdash/api/media/file/")
			? normalized.slice("/_emdash/api/media/file/".length)
			: undefined;
		if (keyFromPath && OPTIMIZED_PRODUCT_MEDIA_URLS[keyFromPath]) {
			return OPTIMIZED_PRODUCT_MEDIA_URLS[keyFromPath];
		}
		return normalized;
	}
	if (image.meta?.storageKey && OPTIMIZED_PRODUCT_MEDIA_URLS[image.meta.storageKey]) {
		return OPTIMIZED_PRODUCT_MEDIA_URLS[image.meta.storageKey];
	}
	if (image.provider === "local" && image.meta?.storageKey) {
		return `/_emdash/api/media/file/${image.meta.storageKey}`;
	}
	if (typeof image.src === "string") {
		const normalized = normalizeImageUrl(image.src);
		if (normalized && OPTIMIZED_PRODUCT_MEDIA_URLS[normalized]) {
			return OPTIMIZED_PRODUCT_MEDIA_URLS[normalized];
		}
		return normalized;
	}
	if (typeof image.url === "string") return normalizeImageUrl(image.url);
	return undefined;
}

export function getPostImageValue(post: PostLike): any {
	const data = post?.data || {};
	const preferred = data.featured_image ?? data.featuredImage ?? data.image;
	if (preferred) return preferred;

	const keys = [
		"thumbnail",
		"thumbnailUrl",
		"thumbnail_url",
		"featuredMedia",
		"featured_media",
		"featuredImg",
		"featured_img",
		"hero_image",
		"heroImage",
		"acf",
		"meta",
		"custom_fields",
		"customFields",
	];

	for (const key of keys) {
		const value = data[key as keyof typeof data];
		if (value) return value;
	}

	// Check ACF fields if they exist
	if (data.acf) {
		const acfKeys = ["featured_image", "image", "thumbnail", "hero_image"];
		for (const key of acfKeys) {
			const value = data.acf[key];
			if (value) return value;
		}
	}

	return undefined;
}

export function getPostImageSrc(post: PostLike): string | undefined {
	const data = post?.data || {};
	const image = getPostImageValue(post);
	const resolved = resolveMediaUrl(image);
	if (resolved) return resolved;

	// Check Portable Text blocks for images
	if (Array.isArray(data.content)) {
		for (const block of data.content) {
			const candidate = block?.image ?? block?.asset ?? block?.media;
			const candidateUrl = findImageUrlDeep(candidate);
			if (candidateUrl) return candidateUrl;
		}
	}

	// Check HTML content for img tags
	if (typeof data.content === "string") {
		const match = data.content.match(/<img[^>]+src=["']([^"']+)["']/i);
		if (match?.[1]) return normalizeImageUrl(match[1]);
	}

	// Check Portable Text blocks for HTML content
	if (Array.isArray(data.content)) {
		for (const block of data.content) {
			// Check various HTML block types
			const htmlContent = block.html || block.content || block.value;
			if (typeof htmlContent === "string") {
				const match = htmlContent.match(/<img[^>]+src=["']([^"']+)["']/i);
				if (match?.[1]) return normalizeImageUrl(match[1]);
			}
		}
	}

	if (typeof data.content === "string") {
		const match = data.content.match(/<img[^>]+src=["']([^"']+)["']/i);
		if (match?.[1]) return normalizeImageUrl(match[1]);
	}

	return undefined;
}

export function getPostIntro(post: PostLike, maxLength = 160): string {
	const data = post?.data || {};
	const candidates = [data.excerpt, data.summary, data.description];
	for (const value of candidates) {
		if (typeof value === "string" && value.trim().length > 0) {
			const clean = stripHtml(value);
			return clean.length > maxLength ? `${clean.slice(0, maxLength)}...` : clean;
		}
	}

	if (typeof data.content === "string" && data.content.trim().length > 0) {
		const clean = stripHtml(data.content);
		return clean.length > maxLength ? `${clean.slice(0, maxLength)}...` : clean;
	}

	if (Array.isArray(data.content)) {
		for (const block of data.content) {
			// Handle Portable Text children format
			if (Array.isArray(block?.children)) {
				const text = block.children.map((child: any) => child?.text || "").join(" ").trim();
				if (text.length > 0) return text.length > maxLength ? `${text.slice(0, maxLength)}...` : text;
			}
			// Handle Gutenberg HTML blocks
			if (block?.html || block?.content || block?.value) {
				const htmlBlock = block.html || block.content || block.value;
				if (typeof htmlBlock === "string") {
					const clean = stripHtml(htmlBlock).trim();
					if (clean.length > 0) return clean.length > maxLength ? `${clean.slice(0, maxLength)}...` : clean;
				}
			}
		}
	}

	return "";
}

export function getPostDate(post: PostLike): Date | undefined {
	const value = post?.data?.publishedAt ?? post?.data?.published_at ?? post?.data?.date;
	if (!value) return undefined;
	if (value instanceof Date) return value;
	if (typeof value === "string") {
		const parsed = new Date(value);
		return Number.isNaN(parsed.getTime()) ? undefined : parsed;
	}
	return undefined;
}

export function getPostHtmlContent(post: PostLike): string | undefined {
	const data = post?.data || {};

	// Check direct content field
	const value = data.content;
	if (typeof value === "string" && value.trim().length > 0) return value;

	// Check if content is array of blocks with HTML
	if (Array.isArray(value)) {
		const htmlBlocks = value.filter(block => block._type === "html" && typeof block.html === "string");
		if (htmlBlocks.length > 0) {
			return htmlBlocks.map(block => block.html).join("\n");
		}
	}

	return undefined;
}

export function hasPortableTextContent(post: PostLike): boolean {
	return Array.isArray(post?.data?.content);
}
