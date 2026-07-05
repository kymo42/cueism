# Pool-ball hero background — design spec

Date: 2026-07-05
Status: approved design, pending implementation plan

## Summary

An ambient, always-on pool-ball physics animation rendered on a `<canvas>` behind the
hero text/CTA on four pages of cueism.com. Hand-rolled vanilla physics (no libraries),
~4–5 KB gzipped, shared across pages via Astro bundling. Validated interactively with
the user via a live demo; all visual parameters below were chosen against that demo.

## Pages in scope

| Page | File | Treatment |
|---|---|---|
| Home | `src/pages/index.astro` | Wrap existing `<section class="hero">` content |
| Posts index | `src/pages/posts/index.astro` | Wrap existing `<section class="hero">` content |
| Shorts | `src/pages/shorts.astro` | Wrap existing `<section class="hero">` content |
| Products index | `src/pages/products/index.astro` | Wrap the "Shop" heading section; balls fade into the product grid |

Hero markup inside the wrapper stays byte-identical. No other pages change.

## New files

### `src/components/PoolHero.astro`

- Full-viewport-width breakout container (`width: 100vw; margin-left: calc(50% - 50vw)`)
  since `main` is capped at 1200px.
- Renders `<canvas>` absolutely positioned behind a default `<slot />`.
- Canvas height = 1.5 × the slotted hero content height ("hero + fade-out zone"):
  it extends below the hero under the start of the following content.
- CSS `mask-image: linear-gradient(...)` fades the bottom 25% of the canvas to
  transparent so balls dissolve under content — no visible boundary.
- Canvas is `aria-hidden="true"`, `pointer-events: none`, behind content in stacking
  order. Content and everything after it renders exactly as today.
- Imports and initializes `src/scripts/pool-hero.ts`.

### `src/scripts/pool-hero.ts`

The engine. Plain TypeScript, zero dependencies.

## Visual parameters (user-approved against live demo)

- Balls: fixed set, numbers 1–8, regulation colours:
  1 yellow `#FDD835`, 2 blue `#1565C0`, 3 red `#D32F2F`, 4 purple `#7B1FA2`,
  5 orange `#F57C00`, 6 green `#2E7D32`, 7 maroon `#6D3B2A`, 8 black `#1c1c1e`.
- Radius: large ("3×" scale from demo v2) — ~44–54 px on desktop; on narrower
  viewports scale with width (~7% of viewport width), clamped to 28–54 px.
- Opacity: 24% (`globalAlpha 0.24`). Cue ball drawn at ~2.4× that (still capped at 1)
  so breaks read against the white background.
- Shading: offset radial gradient (white highlight top-left → darker rim) + faint rim
  stroke, per ball, drawn inside a circular clip.
- Number patches: each ball tracks a unit vector on a 3D sphere plus its antipode.
  Every frame the vector is rotated (Rodrigues formula) about the axis perpendicular
  to the velocity by `distance / radius`, giving true 360° rolling in any direction.
  Patch draws as a white circle whose radius scales with the patch's z (foreshortening),
  with the ball number when large enough; hidden when it rolls to the back hemisphere.

## Physics

- Elastic circle–circle collisions, restitution 0.96, positional correction split by
  inverse mass. Object balls mass 1; cue ball mass 2.2.
- Mild friction (×0.998/step) + a speed floor that gently re-accelerates slow balls,
  so motion never dies; speed cap on object balls.
- No walls. Balls leave the frame freely. A soft return field beyond a ~180 px margin
  outside the viewport steers strays back so the scene never empties.
- Cue-ball break: every 7–16 s (randomized), a white cue ball spawns off a random
  edge, aimed at a random object ball at high speed, scatters the pack, exits, and
  despawns once well outside the field. Breaks only fire while the animation is
  visible and running.
- Time-normalized stepping: physics advances by wall-clock delta (clamped), so
  60 Hz and 120 Hz displays run at identical apparent speed. (The demo was
  frame-based; this is a required improvement.)

## Mobile motion ("silent where allowed")

- Where `devicemotion` delivers data without a permission prompt (Android, older iOS):
  - Tilt: `accelerationIncludingGravity` maps to a small gravity vector on the balls.
  - Shake: high-pass acceleration magnitude over a threshold triggers an entropy
    burst (random impulses), like the demo's Shake button.
- Newer iOS (where `DeviceMotionEvent.requestPermission` exists): skip motion
  entirely — no permission dialog, ever. Full animation + breaks still run.
- Desktop: no pointer-tilt. The animation is ambient only (demo's mouse-tilt was a
  stand-in for the phone gyro, not a shipping feature).

## Performance & safety rails

- rAF loop pauses when the canvas is off-screen (IntersectionObserver) and when the
  tab is hidden (`visibilitychange`). Resume re-seeds the clock so there is no
  catch-up jump.
- DPR-aware canvas sizing; resize handling.
- `prefers-reduced-motion: reduce`: draw one static scattered frame; no animation,
  no breaks, no motion listeners.
- Entire init wrapped in try/catch: any failure (no canvas support, etc.) leaves the
  hero rendering exactly as today. The animation is purely progressive enhancement.
- Astro `ClientRouter` (view transitions) is in use: initialize on `astro:page-load`,
  tear down (cancel rAF, disconnect observers, remove listeners) on
  `astro:before-swap`. Navigating between the four pages must not leak loops or
  double-init.

## Error handling

- No canvas / getContext failure → silent no-op.
- `devicemotion` absent or throwing → motion features off, animation unaffected.
- Zero-size layout race (e.g., fonts still loading) → re-measure on resize; engine
  tolerates W/H of 0 without NaNs (guard divisions).

## Testing

1. `npm run dev` (or project's dev command): verify all four pages render the
   animation behind their heroes; console clean.
2. Navigate between the four pages via links (view transitions): animation restarts
   cleanly, no duplicate loops (check via frame counters / profiler).
3. DevTools: emulate `prefers-reduced-motion` → static frame. Emulate mobile +
   sensor tilt → gravity response. Throttled CPU → animation degrades gracefully.
4. Scroll hero off-screen → loop pauses (verify via performance panel).
5. Build + deploy (commit/push to main per repo convention; `npm run build` before
   `wrangler deploy` — deploy does NOT rebuild). Spot-check live on cueism.com,
   including a real phone for tilt/shake feel.

## Out of scope

- Stripes/balls 9–15, pocket/table imagery, sound.
- iOS motion-permission opt-in UI (explicitly declined).
- Any physics library dependency.
