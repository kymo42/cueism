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
	if (typeof image === "string") return normalizeImageUrl(image);
	if (typeof image?.src === "string") return normalizeImageUrl(image.src);
	if (typeof image?.url === "string") return normalizeImageUrl(image.url);

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
