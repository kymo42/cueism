# Authoring contract — `content/posts/`

Source of truth for blog articles. One markdown file per post, named after its slug
(`content/posts/my-post-slug.md`), with images under `content/images/<slug>/`.

Publishing is done by `tools/publish-post.mjs`, which reads this frontmatter and
creates the post in EmDash. See [docs/CONTENT-PIPELINE.md](../../docs/CONTENT-PIPELINE.md)
for auth setup, verification and rollback.

## Frontmatter contract

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

| Field | Required | Notes |
| --- | --- | --- |
| `title` | yes | Shown as `<h1>` and used for `<title>`/OG unless `seo_title` is set. |
| `slug` | yes | Lowercase, digits and single hyphens. Must match the filename. Becomes `/posts/<slug>`. |
| `excerpt` | recommended | Cards, meta description and social. Two sentences max. |
| `status` | no | `published` (default) or `draft`. `--draft` / `--publish` override it. |
| `category` | yes | Exactly one term slug from the `category` taxonomy. |
| `tags` | no | Inline list of `tag` taxonomy slugs. |
| `featured_image` | no | Path relative to `content/`. Uploaded and used as the post hero. |
| `featured_image_alt` | with image | Falls back to `title` if omitted. |
| `seo_title` | no | Overrides the `<title>` / OG title. |
| `seo_description` | no | Overrides the meta description. |

Unknown frontmatter keys are ignored with a warning, so typos fail loudly rather
than silently.

## Taxonomies

Terms live in the CMS; the pipeline resolves slugs to term IDs at publish time and
refuses to invent terms unless `--create-terms` is passed.

`category` (hierarchical, pick one):

`news` · `monthly-roundup` · `weekly-spotlight` · `product-updates`

`tag` (pick any):

`wpa` · `wpbsa` · `snooker` · `pool` · `heyball` · `championship`

The slugs above are the ones seeded in `seed/seed.json`. Check the live
instance before using a slug that is not in this list:

```powershell
npx emdash taxonomy terms category --url https://cueism.com --json
npx emdash taxonomy terms tag --url https://cueism.com --json
```

## Images

- Live in `content/images/<slug>/` and are committed to git (the originals).
- Reference them **relative to `content/`**: `images/<slug>/hero.png`.
- `featured_image` becomes the hero. The post page renders it as a separate
  `div.post-featured-image` above the body, so the pipeline does **not** insert it into
  the body — it would appear twice. Do not inline the hero in the body either. Only pass
  `--body-hero` if a template does not render `featured_image` itself.
- Body images use ordinary markdown: `![alt text](images/<slug>/chart.png)`.
  HTML-commented examples (`<!-- ![...](...) -->`) are ignored.
- Supported: `png`, `jpg`, `jpeg`, `webp`, `gif`, `avif`, `svg`. Use `webp` for
  photos and `png` for screenshots/diagrams. Keep files under ~1 MB.
- EmDash deduplicates uploads by content hash, so re-publishing the same bytes
  reuses the existing media item instead of creating a duplicate.

## Body markdown

Converted to Portable Text by the EmDash CLI on write. Supported: `#`–`######`
headings, paragraphs, `>` quotes, `-`/`*` and `1.` lists (2-space nesting), fenced
code blocks with a language, `![alt](url)` images, and `**bold**`, `_italic_`,
`` `code` ``, `~~strike~~`, `[link](url)` inline marks.

Notes:

- The body must supply its own top-level structure; `title` is rendered separately
  as the page `<h1>`, so start at `##` for sections.
- Blank line between blocks, as usual for markdown.
- HTML is not supported by the converter — use markdown.

## Publish

```powershell
# 1. Check the plan (no writes, no uploads)
node tools/publish-post.mjs content/posts/my-post-slug.md --dry-run

# 2. Create it (published by default)
node tools/publish-post.mjs content/posts/my-post-slug.md --url https://cueism.com

# 3. Or create it as a draft
node tools/publish-post.mjs content/posts/my-post-slug.md --draft --url https://cueism.com

# 4. Change an already-published post (re-reads --rev for you)
node tools/publish-post.mjs content/posts/my-post-slug.md --update --url https://cueism.com
```

`_example.md` in this folder is a template, not an article — it is never published. It
points at `content/images/example-post-template/hero.svg`, a placeholder that exists so
`--dry-run` on the template completes cleanly as a smoke test.

See [docs/CONTENT-PIPELINE.md](../../docs/CONTENT-PIPELINE.md) for the full process.
