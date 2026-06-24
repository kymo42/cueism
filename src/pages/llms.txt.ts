import type { APIRoute } from "astro";
import { getEmDashCollection } from "emdash";

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
		"## Shop",
		"",
	];

	for (const product of products) {
		const slug = (product as any).slug || product.id;
		const title = (product as any).data?.title ?? slug;
		lines.push(`- [${title}](${origin}/products/${slug})`);
	}

	lines.push("", "## Journal", "");

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
		"",
	);

	return new Response(lines.join("\n"), {
		headers: {
			"Content-Type": "text/plain; charset=utf-8",
			"Cache-Control": "public, max-age=3600",
		},
	});
};
