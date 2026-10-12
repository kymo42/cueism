# Content pipeline — publishing blog posts

How an article goes from a markdown file in this repo to a live page on the site.

**What it is:** a git-tracked authoring pipeline for the `posts` collection.

1. The article lives in git as markdown with YAML frontmatter:
   `content/posts/<slug>.md`, with its images in `content/images/<slug>/`.
2. `tools/publish-post.mjs` reads it, uploads the images as EmDash media (deduplicated
   by content hash), rewrites the body image paths to the uploaded media URLs, and
   sends the body markdown through the EmDash CLI so it is converted to Portable Text.
3. The same script resolves `category`/`tags` slugs to term IDs and assigns them over
   the REST API (the CLI's `content create` has no taxonomy flag).
4. The page renders at `/posts/<slug>`.

Git is the source of truth for the *text*; the CMS is the source of truth for the
*published state* (status, revisions, taxonomy terms, media items). Nothing in this
pipeline touches production unless you point `--url` at it.

Authoring contract details: [content/posts/README.md](../content/posts/README.md).

---

## 1. One-time auth setup

Remote commands need a Bearer token. Pick one:

**API token (recommended for agents and CI)**

1. Open `https://cueism.com/_emdash/admin` → **API tokens** → create a token.
2. Store it in the environment for the session:

   ```powershell
   $env:EMDASH_TOKEN = "<token>"     # PowerShell
   ```

   ```bash
   export EMDASH_TOKEN=<token>      # bash
   ```

3. Verify it works:

   ```powershell
   npx emdash whoami --url https://cueism.com --json
   ```

**OAuth device flow (interactive, humans)**

```bash
npx emdash login --url https://cueism.com
```

> **Known bug — use the wrapper instead.** With `emdash@0.27.0`, `npx emdash login`
> aborts on its first poll with `Token exchange failed: [object Object]`: the CLI expects
> flat OAuth errors (`body.error === "authorization_pending"`) while the server returns
> EmDash's error envelope (`{"error":{"code":"TOKEN_EXCHANGE_ERROR"}}`), so it never
> reaches the approval step. Use the wrapper in this repo, which performs the same RFC 8628
> flow, tolerates both shapes, and writes to the same credential store:
>
> ```bash
> node tools/emdash-login.mjs --url https://cueism.com
> ```
>
> It prints a device code, waits for you to approve it at
> `https://cueism.com/_emdash/admin/device` (valid ~15 minutes), then saves the token to
> `~/.config/emdash/auth.json`. Add `--print-token` to get the raw token for `$EMDASH_TOKEN`.

Credentials are stored in `~/.config/emdash/auth.json` and reused automatically. Verify with
`npx emdash whoami --url https://cueism.com`.

**Required scopes / permissions.** The token's user must be able to:

| Capability | Used for |
| --- | --- |
| `media:upload` | uploading hero and body images |
| `content:edit_own` / `content:edit_any` | creating and updating posts, setting terms |
| `taxonomies:read` | resolving term slugs to IDs |
| `taxonomies:manage` | only with `--create-terms` |
| `content:publish_any` | only when backdating or publishing others' posts |

An admin or editor account covers all of the above. A contributor token will fail on
term assignment (`content:edit_own` against a post you do not own) and on
`--create-terms`.

**Local dev:** no token is needed. `http://localhost:4321` uses a dev auth bypass
(verified: a token-less run against localhost works). Passing `--token` on localhost
sends that token instead of bypassing, so a wrong token will 401 even locally.

---

## 2. The frontmatter contract

```yaml
---
title: "The headline as it will appear on the site"
slug: the-url-slug
excerpt: "One or two sentence summary used for cards, meta description and social."
status: published            # published | draft
category: analysis           # single taxonomy term slug in the `category` taxonomy
tags: [pool, psychology]     # term slugs in the `tag` taxonomy
featured_image: images/<slug>/hero.png   # path relative to content/
featured_image_alt: "Alt text"
seo_title: "Optional SEO title"
seo_description: "Optional SEO description"
---
Body markdown here. Body images use standard markdown: ![alt text](images/<slug>/chart.png)
```

> **`category` and `tags` must be terms that already exist in the CMS.** The slugs shown
> in the example above (`analysis`, `psychology`) are illustrative only — they are *not*
> in this instance's taxonomy. The terms that exist are the ones seeded in
> `seed/seed.json` (and listed in `content/posts/README.md`). A publish run fails with
> "term does not exist" rather than inventing a term; pass `--create-terms` only if you
> genuinely want a new term created.

Rules enforced by the script (it fails loudly rather than half-publishing):

- `title`, `slug` and `category` are required; `slug` must match `[a-z0-9]+(-[a-z0-9]+)*`
  and should match the filename and the image folder.
- `status` is `published` (default) or `draft`. `--draft` forces draft;
  `--publish` forces published; passing both is an error.
- `tags` must be an inline list. It may wrap across lines.
- `featured_image` must be a path, never a URL, and the file must exist.
- Unknown frontmatter keys are ignored with a warning (so a typo does not silently
  become a CMS field).
- The YAML parser is deliberately small: no nested maps, no block scalars, no
  multi-document files. `#` comments are supported on their own line or trailing a value.

`seo_title` / `seo_description` are not settable through the CLI, so the script writes
them with `PUT /_emdash/api/content/posts/<id>` with `{"seo":{...}}`. EmDash's SEO
upsert only overwrites the fields supplied, so the other SEO columns are left alone.

---

## 3. Image rules

| Rule | Value |
| --- | --- |
| Formats | `png`, `jpg`, `jpeg`, `webp`, `gif`, `avif`, `svg` (enforced before upload) |
| Hero dimensions | 1600×900 (16:9) or 1600×1200 (4:3); keep the subject centred |
| Body dimensions | max 1600 px on the long edge; avoid upscaling |
| File size | under ~500 kB for `webp`/`jpg`, under ~1 MB anything else; hard cap is the instance's `maxUploadSize` |
| Naming | lowercase, hyphenated, descriptive: `hero.png`, `chalk-comparison.webp` |
| Location | `content/images/<slug>/` — committed to git as the original |
| Reference | relative to `content/`: `images/<slug>/hero.png` |

How they reach the CMS:

- `tools/publish-post.mjs` runs `emdash media upload <file> --alt "..."` for the hero and
  for every local image referenced in the body.
- EmDash deduplicates uploads by SHA-256 content hash, so re-publishing unchanged image
  bytes reuses the existing media item. Changing the bytes creates a new item.
- Uploaded media is served from `/_emdash/api/media/file/<storageKey>`. The script rewrites
  body image paths to that URL before sending the content, so the markdown → Portable Text
  conversion stores the final URL in the image block's `asset.url`.
- **The hero image field must be this shape** (this is what `src/utils/post-format.ts`
  reads — it is the source of truth for whether the page renders a hero):

  ```json
  { "provider": "local", "id": "<media ULID>", "meta": { "storageKey": "<key>" } }
  ```

  A bare string, `{ url }` or `{ src }` also resolves, but EmDash normalises saved image
  fields to the `provider` + `id` + `meta.storageKey` form, and `resolveMediaUrl()` only
  builds the media-file URL from `meta.storageKey`. The script sends
  `{provider:"local", id, meta:{storageKey}}` directly rather than relying on
  normalisation.
- The hero is **not** inserted into the body: `src/pages/posts/[slug].astro` already renders
  `featured_image` above the body, so a body copy would show the same picture twice. Use
  `--body-hero` only for a template that does not render `featured_image` itself.
- **Original files live in git; uploads are copies in R2/D1.** Re-running never re-uploads
  identical bytes, but it also never deletes a media item, so an image removed from
  markdown stays in the media library.

---

## 4. Commands

Run from the repo root. `content/posts/<slug>.md` is the file you just wrote.

```powershell
# --- dry run: prints every command it would run, writes nothing ---------------
node tools/publish-post.mjs content/posts/<slug>.md --dry-run

# --- create as a draft (safe default while reviewing) ------------------------
node tools/publish-post.mjs content/posts/<slug>.md --draft --url https://cueism.com

# --- create and publish ------------------------------------------------------
node tools/publish-post.mjs content/posts/<slug>.md --url https://cueism.com

# --- update an existing post (re-reads --rev for you) ------------------------
node tools/publish-post.mjs content/posts/<slug>.md --update --url https://cueism.com

# --- other flags -------------------------------------------------------------
--create-terms     create a missing category/tag term instead of failing
--publish          force published status (overrides `status: draft`)
--url <instance>   target instance (default http://localhost:4321)
--token <token>    API token (default $EMDASH_TOKEN)
```

**Behaviour to rely on**

- `--dry-run` exits 0, uploads nothing, writes nothing, and prints the plan including
  resolved file paths.
- Creating a post whose slug already exists **fails** with a message telling you to
  re-run with `--update`. That is the idempotency guard.
- `--update` reads the current item (including `_rev`) immediately before writing, which
  is the read-before-write contract from
  [`.agents/skills/emdash-cli/EDITING-FLOW.md`](../.agents/skills/emdash-cli/EDITING-FLOW.md).
  A stale `_rev` produces a 409, which means someone edited the post in between: re-run.
- The script prints the entry id and the live URL on success and exits non-zero on any
  failure. Nothing is ever force-pushed or blind-overwritten.

**Manual equivalents** (if you need to do it by hand):

```bash
npx emdash media upload content/images/<slug>/hero.png --alt "Alt text" --url https://cueism.com
npx emdash content create posts --file payload.json --slug <slug> --url https://cueism.com
curl -X POST "https://cueism.com/_emdash/api/content/posts/<id>/terms/category" \
  -H "Authorization: Bearer $EMDASH_TOKEN" -H "Content-Type: application/json" \
  -d '{"termIds":["<term-id>"]}'
```

---

## 5. Verifying a published post

```powershell
# 1. Is it in the CMS?
npx emdash content list posts --limit 20 --url https://cueism.com --json

# 2. Fetch the public page and check the four things that actually matter
$html = (Invoke-WebRequest "https://cueism.com/posts/<slug>").Content
$html -match "<title>(.*?)</title>"                                # title / SEO title
$html -match 'post-featured-image'                                  # hero <img> rendered
$html -match 'post-category'                                        # category link
$html -match '<h2'                                                  # body converted, not raw markdown
```

What to check, and what each failure means:

| Check | Looks like | If it fails |
| --- | --- | --- |
| HTTP 200, not a redirect to `/404` | page renders | post is still `draft`, or the slug differs from the frontmatter |
| `<h1>` | the `title` value | `title` missing/empty |
| Hero `<img>` inside `div.post-featured-image` | `/_emdash/api/media/file/<key>` | `featured_image` is not in the `{provider:"local", meta:{storageKey}}` shape |
| Body HTML, not literal `##` markers | `<h2>`, `<p>`, `<img>` | content was sent as a raw string instead of through the CLI |
| Category link | `/category/<term-slug>` | terms were not assigned (the REST call is a separate step) |
| `<title>` / meta description | your `seo_title` / `seo_description` | SEO PUT failed, or the collection lacks SEO support |

The page is server-rendered and cached with `Astro.cache.set(cacheHint)`, so if you
updated an existing post and still see the old copy, allow a moment (or check whether you
are looking at a cached/edge copy) before assuming the write failed.

---

## 6. Unpublish / roll back

```powershell
# Take it off the site without deleting it (reversible)
npx emdash content unpublish posts <id> --url https://cueism.com

# Put it back
npx emdash content publish posts <id> --url https://cueism.com

# Revert to a previous revision (list ids first)
npx emdash content get posts <id> --url https://cueism.com
npx emdash content delete posts <id> --url https://cueism.com    # soft delete → trash
npx emdash content restore posts <id> --url https://cueism.com
```

`<id>` is the entry id printed by the publish script (a ULID), not the slug.

Rollback order of preference:

1. Wrong body/taxonomy → fix the markdown and re-run with `--update`.
2. Should not be visible yet → `content unpublish`.
3. Published by mistake, keep the record → unpublished + fix the markdown later.
4. Remove entirely → `content delete` (soft), then `content restore` if needed.

Because the markdown in git is the source of truth, the recovery procedure is always
"fix the file, re-run `--update`" — never "hand-edit in the admin UI", or the repo and
the CMS will disagree.

---

## 7. Git conventions

This repo uses **Conventional Commits** with a lowercase type, a scope where it helps,
and an imperative subject under ~72 characters. Recent history:

```
style: redesign pool quiz layout with spacious padding, two-tier header, circular lifeline pill, and enhanced scenario box
fix: randomize option order across A, B, C, and D dynamically
feat: expand pool quiz with 33+ questions, 50/50 lifelines, streaks, and continuous rack mode
feat(shop): rename knuckles to amoeba, update SEO, descriptions and redirects
chore(seed): update knuckles description to accurate bridge product copy
fix(security): remove secrets from wrangler.jsonc
```

For an article, use `feat(posts)` (or `content(posts)` if you prefer to keep prose
separate from code), name the slug in the subject, and describe the article in the body:

```
feat(posts): add "World Pool Championship 2026 preview"

Adds content/posts/world-pool-championship-2026-preview.md plus its
hero and chart image, published under the news category.
```

Commit the markdown **and** the images together so the post is always reproducible from
the repo. Publishing to the CMS is a separate, non-git step — do not commit generated
media URLs back into the markdown. A future agent committing for you should not run
`git commit` unless asked.

---

## 8. Troubleshooting

| Symptom | Cause | Fix |
| --- | --- | --- |
| `401` / `UNAUTHORIZED` | missing, expired or wrong token | set `$env:EMDASH_TOKEN`, or run `node tools/emdash-login.mjs --url <instance>`; verify with `npx emdash whoami --url <instance>` |
| `409 CONFLICT` on update | someone (or you) changed the post since the `_rev` was read | re-run with `--update`; it re-reads the revision automatically |
| `SLUG_CONFLICT` / "already exists" | a post with that slug is already in the collection | re-run with `--update`, or change `slug` (and the filename and image folder) |
| "category term X does not exist" | term slug is not in the taxonomy — e.g. `analysis` or `psychology`, which are not seeded terms | use a seeded slug (`news`, `monthly-roundup`, `weekly-spotlight`, `product-updates`; tags `wpa`, `wpbsa`, `snooker`, `pool`, `heyball`, `championship`), or pass `--create-terms`, or create it in the admin UI |
| `INVALID_TYPE` / "File type not allowed" | image extension not in the allowlist | export as `png`, `jpg`, `webp`, `gif`, `avif` or `svg` |
| `PAYLOAD_TOO_LARGE` / 413 | image exceeds the instance's `maxUploadSize` | compress or resize (target < 500 kB) |
| "Image not found" | `featured_image`/`![...]` path does not resolve | paths are relative to `content/`; also accepts markdown-relative or repo-root-relative paths |
| `400` / `VALIDATION_ERROR` | a required field is missing | `title`, `slug`, `category` are required; check the frontmatter block |
| Page 404s after a successful publish | it is a draft, or the slug differs | `npx emdash content publish posts <id>`; check `slug` vs the URL you opened |
| Hero missing but the body is fine | `featured_image` is not the `{provider, meta.storageKey}` shape | re-run the script (it sends the right shape); do not hand-edit the field to a bare string |
| The same image appears twice at the top | `--body-hero` was passed, or the hero was inlined in the body, *and* the template renders `featured_image` | remove the body copy of the hero, or drop `--body-hero` |
| Local run hangs/fails to reach the instance | dev server not running | `npx emdash dev` (Astro on `http://localhost:4321`) |

### Known limitation in restricted sandboxes

`tools/publish-post.mjs` shells out to the EmDash CLI. In a sandbox that denies creating
child-process pipes (a Windows sandbox bounded by named-pipe restrictions, for example),
the script automatically falls back to redirecting the CLI's stdio to temp files, so it
still works — you do not need to do anything.

The same restriction makes `npx emdash dev` (Astro's dev server) unable to boot, because
esbuild's service worker requires an IPC pipe. If `npx emdash dev` fails with
`spawn EPERM`, that is the sandbox, not the repo: run the dev server outside it, or test
against a remote instance.
