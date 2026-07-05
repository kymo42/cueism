export interface ShortVideo {
	videoId: string;
	title: string;
	thumbnailUrl: string;
	publishedAt: string;
	durationSeconds: number;
}

/**
 * Fetch the synced YouTube Shorts list from the youtube-shorts plugin.
 *
 * Calls the plugin's public `list` route through the EmDash runtime rather
 * than an HTTP fetch to our own origin: a Worker fetching its own zone is an
 * unreliable loopback on Cloudflare. handlePublicPluginApiRoute dispatches
 * in-process and returns { success, data } where data is the route's payload.
 *
 * Returns [] when the plugin isn't configured or the YouTube sync hasn't run.
 */
export async function getShorts(locals: unknown): Promise<ShortVideo[]> {
	try {
		const handler = (locals as { emdash?: { handlePublicPluginApiRoute?: unknown } })?.emdash
			?.handlePublicPluginApiRoute;
		if (typeof handler !== "function") return [];
		const result = await handler(
			"youtube-shorts",
			"GET",
			"/list",
			new Request("https://internal/list"),
		);
		if (!result?.success) return [];
		return (result.data as { items?: ShortVideo[] })?.items ?? [];
	} catch {
		return [];
	}
}
