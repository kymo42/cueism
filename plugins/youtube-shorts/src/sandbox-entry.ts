import { definePlugin } from "emdash";
import type { PluginContext } from "emdash";
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

function parseIsoDuration(iso: string): number {
	const match = /^PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?$/.exec(iso);
	if (!match) return 0;
	const [, h, m, s] = match;
	return (Number(h) || 0) * 3600 + (Number(m) || 0) * 60 + (Number(s) || 0);
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
		const channelRes = await ctx.http!.fetch(channelUrl);
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

		const playlistRes = await ctx.http!.fetch(playlistUrl.toString());
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

			const detailsRes = await ctx.http!.fetch(detailsUrl.toString());
			if (!detailsRes.ok) {
				throw new Error(`YouTube videos.list failed: ${detailsRes.status}`);
			}
			const detailsData = (await detailsRes.json()) as any;

			for (const video of detailsData.items ?? []) {
				const durationSeconds = parseIsoDuration(video.contentDetails?.duration ?? "PT0S");
				if (durationSeconds > MAX_SHORT_DURATION_SECONDS) continue;

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

export default definePlugin({
	admin: {
		settingsSchema: {
			apiKey: {
				type: "secret",
				label: "YouTube Data API Key",
				description: "Google Cloud API key with YouTube Data API v3 enabled",
			},
			channelHandle: {
				type: "string",
				label: "Channel Handle",
				description: "Without the @ symbol -- e.g. cueism",
				default: "cueism",
			},
		},
	},

	hooks: {
		"plugin:install": {
			handler: async (_event: any, ctx: PluginContext) => {
				await ctx.kv.set("settings:channelHandle", "cueism");
				await ctx.cron!.schedule(CRON_NAME, { schedule: "0 * * * *" });
			},
		},
		"plugin:activate": {
			handler: async (_event: any, ctx: PluginContext) => {
				await ctx.cron!.schedule(CRON_NAME, { schedule: "0 * * * *" });
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
			input: z.object({
				q: z.string().optional(),
				limit: z.coerce.number().min(1).max(300).default(300),
			}),
			handler: async (routeCtx: any) => {
				const { q, limit } = routeCtx.input;
				const result = await routeCtx.storage.shorts!.query({
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
			handler: async (routeCtx: any) => {
				return await syncShorts(routeCtx);
			},
		},
	},
});
