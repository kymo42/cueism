import type { APIRoute } from "astro";

export const GET: APIRoute = async ({ url }) => {
	const origin = url.origin.replace(/\/$/, "");

	const manifest = {
		schema_version: "1.0",
		name: "Cueism",
		description:
			"Australian-made, 3D-printed billiards and pool accessories (rack cases, magnetic chalk holders, bridge heads). Printed to order from recycled rPET and biodegradable PLA+.",
		url: origin,
		contact_email: "0@cueism.com",
		currency: "AUD",
		capabilities: {
			catalog_browsing: true,
			structured_data_json_ld: true,
			google_merchant_feed: true,
			direct_checkout_session_creation: true,
			webmcp_browser_tools: true,
		},
		endpoints: {
			catalog_json: {
				url: `${origin}/products.json`,
				method: "GET",
				content_type: "application/json",
				description:
					"Complete product catalog with variants, stock, colours, Nogenn grip colours, and personalization surcharges.",
			},
			merchant_feed_xml: {
				url: `${origin}/products-feed.xml`,
				method: "GET",
				content_type: "application/xml",
				description: "Google Merchant Center RSS 2.0 XML product feed.",
			},
			llms_txt: {
				url: `${origin}/llms.txt`,
				method: "GET",
				content_type: "text/plain",
				description: "Markdown summary of products, pricing, shipping, and posts for LLMs.",
			},
			checkout_session: {
				url: `${origin}/api/checkout`,
				methods: ["GET", "POST"],
				content_type: "application/json",
				description:
					"GET returns the request schema; POST creates a Stripe Checkout Session and returns `{ url }`.",
			},
		},
	};

	return new Response(JSON.stringify(manifest, null, 2), {
		status: 200,
		headers: {
			"Content-Type": "application/json; charset=utf-8",
			"Access-Control-Allow-Origin": "*",
			"Cache-Control": "public, max-age=3600",
		},
	});
};
