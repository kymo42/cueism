---
# ============================================================================
# TEMPLATE — not an article. Copy this file to content/posts/<your-slug>.md
# and edit it. Do NOT run tools/publish-post.mjs against this file.
# Contract reference: content/posts/README.md
# ============================================================================
title: "The headline as it will appear on the site"
slug: example-post-template
excerpt: "One or two sentence summary used for cards, meta description and social."
status: draft                 # published | draft
category: news               # one `category` term slug
tags: [pool, championship]   # `tag` term slugs
featured_image: images/example-post-template/hero.svg
featured_image_alt: "Describe the image for screen readers"
# seo_title: "Optional SEO title"
# seo_description: "Optional SEO description"
---

<!--
  Body markdown below. The page renders `title` as the <h1>, so start at `##`.
  Images use: ![alt text](images/<your-slug>/chart.png)
  Keep a blank line between blocks. Full guidance: content/posts/README.md
-->

## First section

Opening paragraph. Standard markdown works: **bold**, _italic_, `code`,
~~strikethrough~~ and [links](https://example.com).

### A subsection

- A bullet
- Another bullet

1. A numbered step
2. Another step

> A pull quote.

```js
// Fenced code blocks carry their language.
const cue = "chalk";
```

<!-- Add body images like this (the file must exist or the publish fails):
![A diagram](images/example-post-template/chart.png)
-->

## Closing section

Final paragraph.
