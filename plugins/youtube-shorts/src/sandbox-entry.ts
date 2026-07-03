import type { PluginContext } from "emdash";
import type { SandboxedPlugin } from "emdash/plugin";
import { z } from "astro/zod";

interface ShortVideo {
	videoId: string;
	title: string;
	thumbnailUrl: string;
	publishedAt: string;
	durationSeconds: number;
}

// The YouTube Data API has no "is this a Short" flag -- Shorts are uploaded through
// the same uploads playlist as regular videos. We treat anything at or under YouTube's
// own Shorts length ceiling (3 minutes) as a Short and skip longer uploads.
const MAX_SHORT_DURATION_SECONDS = 180;
const CRON_NAME = "sync-shorts";

// The YouTube Data API key is HTTP-referrer-restricted to cueism.com in Google
// Cloud Console, so every server-side call must present a matching Referer or
// Google returns 403 API_KEY_HTTP_REFERRER_BLOCKED. Setting it here lets the
// Worker use the same locked-down key a browser would.
const YT_FETCH_INIT: RequestInit = { headers: { Referer: "https://cueism.com/" } };

function parseIsoDuration(iso: string): number {
	const match = /^PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?$/.exec(iso);
	if (!match) return 0;
	const [, h, m, s] = match;
	return (Number(h) || 0) * 3600 + (Number(m) || 0) * 60 + (Number(s) || 0);
}

// A short duration alone doesn't make a video a Short -- the channel also has
// landscape clips on the main tab that are under 3 minutes. The reliable signal
// is the canonical /shorts/ URL: real Shorts return 200, everything else
// 303-redirects to /watch. We use a raw manual-redirect fetch (not ctx.http,
// which auto-follows redirects and would mask the 303). Trusted in-process
// plugin, so globalThis.fetch is available. On any error we return false so a
// non-Short can never slip in; a genuine Short missed by a transient failure is
// re-evaluated on the next hourly sync.
async function isYouTubeShort(videoId: string): Promise<boolean> {
	try {
		const res = await fetch(`https://www.youtube.com/shorts/${videoId}`, {
			method: "HEAD",
			redirect: "manual",
			headers: { "User-Agent": "Mozilla/5.0" },
		});
		return res.status === 200;
	} catch {
		return false;
	}
}

async function syncShorts(ctx: PluginContext): Promise<{ added: number; checked: number }> {
	const apiKey = await ctx.kv.get<string>("settings:apiKey");
	const channelHandle = (await ctx.kv.get<string>("settings:channelHandle")) || "cueism";

	if (!apiKey) {
		ctx.log.warn("youtube-shorts: no API key configured in plugin settings, skipping sync");
		return { added: 0, checked: 0 };
	}

	let uploadsPlaylistId = await ctx.kv.get<string>("state:uploadsPlaylistId");
	if (!uploadsPlaylistId) {
		const channelUrl = `https://www.googleapis.com/youtube/v3/channels?part=contentDetails&forHandle=${encodeURIComponent(channelHandle)}&key=${apiKey}`;
		const channelRes = await ctx.http!.fetch(channelUrl, YT_FETCH_INIT);
		if (!channelRes.ok) {
			throw new Error(`YouTube channels.list failed: ${channelRes.status} ${await channelRes.text()}`);
		}
		const channelData = (await channelRes.json()) as any;
		uploadsPlaylistId = channelData.items?.[0]?.contentDetails?.relatedPlaylists?.uploads;
		if (!uploadsPlaylistId) {
			throw new Error(`Could not resolve uploads playlist for channel handle "${channelHandle}"`);
		}
		await ctx.kv.set("state:uploadsPlaylistId", uploadsPlaylistId);
	}

	let added = 0;
	let checked = 0;
	let pageToken: string | undefined;
	let reachedKnownVideos = false;

	while (!reachedKnownVideos) {
		const playlistUrl = new URL("https://www.googleapis.com/youtube/v3/playlistItems");
		playlistUrl.searchParams.set("part", "snippet");
		playlistUrl.searchParams.set("playlistId", uploadsPlaylistId);
		playlistUrl.searchParams.set("maxResults", "50");
		playlistUrl.searchParams.set("key", apiKey);
		if (pageToken) playlistUrl.searchParams.set("pageToken", pageToken);

		const playlistRes = await ctx.http!.fetch(playlistUrl.toString(), YT_FETCH_INIT);
		if (!playlistRes.ok) {
			throw new Error(`YouTube playlistItems.list failed: ${playlistRes.status}`);
		}
		const playlistData = (await playlistRes.json()) as any;
		const pageItems: any[] = playlistData.items ?? [];
		checked += pageItems.length;

		const newVideoIds: string[] = [];
		for (const item of pageItems) {
			const videoId = item.snippet?.resourceId?.videoId;
			if (!videoId) continue;
			if (await ctx.storage.shorts!.exists(videoId)) {
				reachedKnownVideos = true;
			} else {
				newVideoIds.push(videoId);
			}
		}

		if (newVideoIds.length > 0) {
			const detailsUrl = new URL("https://www.googleapis.com/youtube/v3/videos");
			detailsUrl.searchParams.set("part", "snippet,contentDetails");
			detailsUrl.searchParams.set("id", newVideoIds.join(","));
			detailsUrl.searchParams.set("key", apiKey);

			const detailsRes = await ctx.http!.fetch(detailsUrl.toString(), YT_FETCH_INIT);
			if (!detailsRes.ok) {
				throw new Error(`YouTube videos.list failed: ${detailsRes.status}`);
			}
			const detailsData = (await detailsRes.json()) as any;

			for (const video of detailsData.items ?? []) {
				const durationSeconds = parseIsoDuration(video.contentDetails?.duration ?? "PT0S");
				// Cheap pre-filter first (skips the network check for obvious long uploads),
				// then confirm it's an actual Short via the /shorts/ URL.
				if (durationSeconds > MAX_SHORT_DURATION_SECONDS) continue;
				if (!(await isYouTubeShort(video.id))) continue;

				const short: ShortVideo = {
					videoId: video.id,
					title: video.snippet?.title ?? "",
					thumbnailUrl:
						video.snippet?.thumbnails?.maxres?.url ??
						video.snippet?.thumbnails?.high?.url ??
						video.snippet?.thumbnails?.medium?.url ??
						"",
					publishedAt: video.snippet?.publishedAt ?? new Date().toISOString(),
					durationSeconds,
				};
				await ctx.storage.shorts!.put(short.videoId, short);
				added++;
			}
		}

		pageToken = playlistData.nextPageToken;
		if (!pageToken) break;
	}

	await ctx.kv.set("state:lastSyncAt", new Date().toISOString());
	return { added, checked };
}

export default {
	hooks: {
		"plugin:install": {
			handler: async (_event: any, ctx: PluginContext) => {
				await ctx.kv.set("settings:channelHandle", "cueism");
				// ctx.cron is undefined on serverless (Cloudflare) — the cron task is
				// seeded directly in _emdash_cron_tasks and driven by the Worker's
				// scheduled() handler. Only self-schedule where cron is wired (Node/dev),
				// and never let its absence throw and roll back the kv.set above.
				await ctx.cron?.schedule(CRON_NAME, { schedule: "0 * * * *" });
			},
		},
		"plugin:activate": {
			handler: async (_event: any, ctx: PluginContext) => {
				await ctx.cron?.schedule(CRON_NAME, { schedule: "0 * * * *" });
			},
		},
		cron: {
			handler: async (event: any, ctx: PluginContext) => {
				if (event.name !== CRON_NAME) return;
				try {
					const result = await syncShorts(ctx);
					ctx.log.info("youtube-shorts: sync complete", result);
				} catch (err) {
					ctx.log.error("youtube-shorts: sync failed", { error: String(err) });
				}
			},
		},
	},

	routes: {
		// Public: read-only, consumed server-side by the /shorts gallery page.
		list: {
			public: true,
			// GET requests never carry query params into ctx.input for trusted plugins --
			// emdash only reads a JSON body (request.json()), which is undefined on GET.
			// Default the whole schema so the public GET call this route actually receives
			// (from the /shorts page) still validates; q/limit remain usable via POST.
			input: z
				.object({
					q: z.string().optional(),
					limit: z.coerce.number().min(1).max(300).default(300),
				})
				.default({}),
			handler: async (routeCtx: any, ctx: PluginContext) => {
				const { q, limit } = routeCtx.input;
				const result = await ctx.storage.shorts!.query({
					orderBy: { publishedAt: "desc" },
					limit,
				});

				const needle: string | undefined = q?.trim().toLowerCase();
				const items = result.items
					.map((item: any) => item.data as ShortVideo)
					.filter((short: ShortVideo) => !needle || short.title.toLowerCase().includes(needle));

				return { items };
			},
		},

		// Admin-only (not public): manual trigger, useful right after configuring settings
		// instead of waiting for the next hourly cron tick.
		sync: {
			handler: async (_routeCtx: any, ctx: PluginContext) => {
				return await syncShorts(ctx);
			},
		},
	},
} satisfies SandboxedPlugin;
