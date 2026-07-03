import type { PluginDescriptor } from "emdash";

export function youtubeShortsPlugin(): PluginDescriptor {
	return {
		id: "youtube-shorts",
		version: "0.1.0",
		format: "standard",
		entrypoint: "@cueism/plugin-youtube-shorts/sandbox",
		capabilities: ["network:fetch"],
		// googleapis for the Data API; www.youtube.com for the /shorts/ URL check
		// that distinguishes real Shorts from short landscape uploads.
		allowedHosts: ["www.googleapis.com", "www.youtube.com"],
		storage: {
			shorts: {
				indexes: ["publishedAt"],
			},
		},
	};
}
