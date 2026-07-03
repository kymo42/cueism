import type { PluginDescriptor } from "emdash";

export function youtubeShortsPlugin(): PluginDescriptor {
	return {
		id: "youtube-shorts",
		version: "0.1.0",
		format: "standard",
		entrypoint: "@cueism/plugin-youtube-shorts/sandbox",
		capabilities: ["network:fetch"],
		allowedHosts: ["www.googleapis.com"],
		storage: {
			shorts: {
				indexes: ["publishedAt"],
			},
		},
	};
}
