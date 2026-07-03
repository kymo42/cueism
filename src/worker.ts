// EmDash's Cloudflare Worker entry: wraps the Astro fetch handler with a
// scheduled() handler so a Cron Trigger drives plugin cron (e.g. the
// youtube-shorts hourly sync), scheduled content publishing, and system
// cleanup. Re-exports PluginBridge for the sandbox binding. Previously this
// re-exported only the raw Astro handler, so scheduled() never ran and no
// plugin cron / scheduled publishing ever fired.
export { default, PluginBridge } from "@emdash-cms/cloudflare/worker";
