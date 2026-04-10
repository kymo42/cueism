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

export function getPostImageSrc(post: PostLike): string | undefined {
	const data = post?.data || {};
	const image = data.featured_image ?? data.featuredImage ?? data.image;
	if (typeof image === "string") return normalizeImageUrl(image);
	if (typeof image?.src === "string") return normalizeImageUrl(image.src);
	if (typeof image?.url === "string") return normalizeImageUrl(image.url);

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
			if (!Array.isArray(block?.children)) continue;
			const text = block.children.map((child: any) => child?.text || "").join(" ").trim();
			if (text.length > 0) return text.length > maxLength ? `${text.slice(0, maxLength)}...` : text;
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
	const value = post?.data?.content;
	if (typeof value === "string" && value.trim().length > 0) return value;
	return undefined;
}

export function hasPortableTextContent(post: PostLike): boolean {
	return Array.isArray(post?.data?.content);
}
