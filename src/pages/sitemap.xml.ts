import type { APIRoute } from "astro";
import { getEmDashCollection } from "emdash";

// Custom sitemap that overrides EmDash's built-in one. The built-in version
// only lists collection entries (/posts/*, /products/*); this also includes
// the homepage and the Shop / Journal / CMS-page landing routes.

type Entry = { id: string; slug?: string | null; data?: Record<string, any> };

type UrlNode = { loc: string; lastmod?: string; changefreq: string; priority: string };

const TRAILING_SLASH_RE = /\/$/;

function escapeXml(value: string): string {
	return value
		.replace(/&/g, "&amp;")
		.replace(/</g, "&lt;")
		.replace(/>/g, "&gt;")
		.replace(/"/g, "&quot;")
		.replace(/'/g, "&apos;");
}

/** Best-effort last-modified date for an entry, ISO string or undefined. */
function entryLastmod(entry: Entry): string | undefined {
	const candidate =
		(entry as any).updated_at ??
		entry.data?.updated_at ??
		entry.data?.updatedAt ??
		entry.data?.published_at ??
		entry.data?.publishedAt ??
		entry.data?.date;
	if (!candidate) return undefined;
	const parsed = new Date(candidate);
	return Number.isNaN(parsed.getTime()) ? undefined : parsed.toISOString();
}

async function fetchEntries(collection: string): Promise<Entry[]> {
	const { entries = [] } = await getEmDashCollection(collection, {
		orderBy: { published_at: "desc" },
	}).catch(() => ({ entries: [] as Entry[] }));
	return entries as Entry[];
}

export const GET: APIRoute = async ({ url }) => {
	const origin = url.origin.replace(TRAILING_SLASH_RE, "");

	const [products, posts, pages] = await Promise.all([
		fetchEntries("products"),
		fetchEntries("posts"),
		fetchEntries("pages"),
	]);

	const now = new Date().toISOString();

	const nodes: UrlNode[] = [
		{ loc: `${origin}/`, lastmod: now, changefreq: "daily", priority: "1.0" },
		{ loc: `${origin}/products`, lastmod: now, changefreq: "daily", priority: "0.9" },
		{ loc: `${origin}/posts`, lastmod: now, changefreq: "weekly", priority: "0.8" },
	];

	// CMS pages (About, etc.) are served at the root: /{slug}.
	for (const page of pages) {
		const slug = page.slug || page.id;
		nodes.push({
			loc: `${origin}/${encodeURIComponent(slug)}`,
			lastmod: entryLastmod(page),
			changefreq: "monthly",
			priority: "0.6",
		});
	}

	for (const product of products) {
		const slug = product.slug || product.id;
		nodes.push({
			loc: `${origin}/products/${encodeURIComponent(slug)}`,
			lastmod: entryLastmod(product),
			changefreq: "weekly",
			priority: "0.8",
		});
	}

	for (const post of posts) {
		const slug = post.slug || post.id;
		nodes.push({
			loc: `${origin}/posts/${encodeURIComponent(slug)}`,
			lastmod: entryLastmod(post),
			changefreq: "weekly",
			priority: "0.7",
		});
	}

	const lines = [
		'<?xml version="1.0" encoding="UTF-8"?>',
		'<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
	];
	for (const node of nodes) {
		lines.push("  <url>");
		lines.push(`    <loc>${escapeXml(node.loc)}</loc>`);
		if (node.lastmod) lines.push(`    <lastmod>${escapeXml(node.lastmod)}</lastmod>`);
		lines.push(`    <changefreq>${node.changefreq}</changefreq>`);
		lines.push(`    <priority>${node.priority}</priority>`);
		lines.push("  </url>");
	}
	lines.push("</urlset>");

	return new Response(lines.join("\n"), {
		status: 200,
		headers: {
			"Content-Type": "application/xml; charset=utf-8",
			"Cache-Control": "public, max-age=3600",
		},
	});
};
