# Pool-Ball Hero Background Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ambient pool-ball physics animation on a canvas behind the hero sections of cueism.com's home, posts, shorts, and products pages, per the approved spec `docs/superpowers/specs/2026-07-05-pool-hero-background-design.md`.

**Architecture:** One zero-dependency TypeScript engine (`src/scripts/pool-hero.ts`) doing fixed-timestep 2D circle physics with pseudo-3D rolling number patches, plus one Astro wrapper component (`src/components/PoolHero.astro`) that renders a full-bleed canvas behind a slot with a bottom fade mask. Pages wrap their existing hero markup in the component; markup inside stays identical.

**Tech Stack:** Astro 6 (with `ClientRouter` view transitions), TypeScript, Canvas 2D, Cloudflare Workers deploy via wrangler.

**Verification note:** This repo has no JS test framework, and the deliverable is a visual canvas animation. Verification per task = `npm run typecheck` (astro check) + explicit browser checks against `npm run dev`. Do not add a test framework.

**Repo conventions:** Work directly on `main`, commit + push after every task (user's standing instruction). Deploy is `npm run deploy` (`astro build && wrangler deploy` — never bare `wrangler deploy`, it does not rebuild).

---

### Task 1: Physics/rendering engine

**Files:**
- Create: `src/scripts/pool-hero.ts`

- [ ] **Step 1: Create `src/scripts/pool-hero.ts` with exactly this content**

```ts
/**
 * Ambient pool-ball animation behind hero sections.
 * Zero dependencies. Progressive enhancement only: any failure = silent no-op.
 * Spec: docs/superpowers/specs/2026-07-05-pool-hero-background-design.md
 */

export interface PoolHeroHandle {
	destroy(): void;
}

interface Patch {
	x: number;
	y: number;
	z: number;
}

interface Ball {
	x: number;
	y: number;
	vx: number;
	vy: number;
	r: number;
	num: number; // 1-8 object balls, 0 = cue
	m: number;
	cue: boolean;
	age: number;
	p: Patch;
}

const COLORS: Record<number, string> = {
	1: "#FDD835",
	2: "#1565C0",
	3: "#D32F2F",
	4: "#7B1FA2",
	5: "#F57C00",
	6: "#2E7D32",
	7: "#6D3B2A",
	8: "#1c1c1e",
};

const ALPHA = 0.24;
const CUE_ALPHA = Math.min(1, ALPHA * 2.4);
const RESTITUTION = 0.96;
const FRICTION = 0.998; // per 60 Hz step
const TARGET_SPEED = 1.1; // px per 60 Hz step
const MAX_SPEED = 11;
const MARGIN = 180; // soft return field beyond viewport
const GONE = 300; // cue despawn distance
const STEP_MS = 1000 / 60;
const MAX_DELTA_MS = 100;

export function initPoolHero(canvas: HTMLCanvasElement): PoolHeroHandle | null {
	try {
		const wrapper = canvas.parentElement;
		const ctx = canvas.getContext("2d");
		if (!wrapper || !ctx) return null;

		const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

		let W = 0;
		let H = 0;
		let balls: Ball[] = [];
		let raf = 0;
		let running = false;
		let inView = true;
		let destroyed = false;
		let lastTime = 0;
		let acc = 0;
		let nextBreak = performance.now() + 5000 + Math.random() * 6000;
		let gx = 0;
		let gy = 0;
		let lastShake = 0;

		function resize(): void {
			const dpr = Math.min(2, window.devicePixelRatio || 1);
			W = wrapper!.clientWidth;
			H = Math.round(wrapper!.clientHeight * 1.5);
			canvas.width = Math.max(1, Math.round(W * dpr));
			canvas.height = Math.max(1, Math.round(H * dpr));
			ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);
			if (reduced) drawFrame();
		}

		function randPatch(): Patch {
			const t = Math.random() * Math.PI * 2;
			const z = Math.random() * 2 - 1;
			const s = Math.sqrt(1 - z * z);
			return { x: Math.cos(t) * s, y: Math.sin(t) * s, z };
		}

		function baseRadius(): number {
			return Math.min(54, Math.max(28, W * 0.07));
		}

		function makeBalls(): void {
			balls = [];
			const base = baseRadius();
			for (let n = 1; n <= 8; n++) {
				const r = base * (0.92 + Math.random() * 0.16);
				let x = 0;
				let y = 0;
				let ok = false;
				for (let tries = 0; tries < 80 && !ok; tries++) {
					ok = true;
					x = -40 + Math.random() * (W + 80);
					y = -40 + Math.random() * (H + 80);
					for (const b of balls) {
						const dx = b.x - x;
						const dy = b.y - y;
						const min = b.r + r + 6;
						if (dx * dx + dy * dy < min * min) {
							ok = false;
							break;
						}
					}
				}
				const a = Math.random() * Math.PI * 2;
				balls.push({
					x,
					y,
					r,
					num: n,
					m: 1,
					cue: false,
					age: 0,
					vx: Math.cos(a) * TARGET_SPEED,
					vy: Math.sin(a) * TARGET_SPEED,
					p: randPatch(),
				});
			}
		}

		function spawnCue(): void {
			const r = baseRadius();
			const side = Math.floor(Math.random() * 4);
			let x: number;
			let y: number;
			if (side === 0) {
				x = -r - 60;
				y = Math.random() * H;
			} else if (side === 1) {
				x = W + r + 60;
				y = Math.random() * H;
			} else if (side === 2) {
				x = Math.random() * W;
				y = -r - 60;
			} else {
				x = Math.random() * W;
				y = H + r + 60;
			}
			const target = balls[Math.floor(Math.random() * balls.length)] ?? {
				x: W / 2,
				y: H / 2,
			};
			const dx = target.x - x;
			const dy = target.y - y;
			const d = Math.sqrt(dx * dx + dy * dy) || 1;
			const sp = 15 + Math.random() * 7;
			balls.push({
				x,
				y,
				r,
				num: 0,
				m: 2.2,
				cue: true,
				age: 0,
				vx: (dx / d) * sp,
				vy: (dy / d) * sp,
				p: randPatch(),
			});
		}

		/** Rodrigues rotation of the number patch about the axis perpendicular to velocity. */
		function rollPatch(b: Ball, dist: number): void {
			const s = Math.sqrt(b.vx * b.vx + b.vy * b.vy);
			if (s < 0.02) return;
			const ax = -b.vy / s;
			const ay = b.vx / s;
			const th = dist / b.r;
			const c = Math.cos(th);
			const sn = Math.sin(th);
			const p = b.p;
			const dot = ax * p.x + ay * p.y;
			b.p = {
				x: p.x * c + ay * p.z * sn + ax * dot * (1 - c),
				y: p.y * c - ax * p.z * sn + ay * dot * (1 - c),
				z: p.z * c + (ax * p.y - ay * p.x) * sn,
			};
		}

		function stepOnce(): void {
			for (let i = balls.length - 1; i >= 0; i--) {
				const b = balls[i];
				b.age++;
				b.vx += gx;
				b.vy += gy;
				b.vx *= FRICTION;
				b.vy *= FRICTION;
				let s = Math.sqrt(b.vx * b.vx + b.vy * b.vy);
				if (!b.cue) {
					if (s < TARGET_SPEED * 0.5) {
						if (s < 0.01) {
							const a = Math.random() * Math.PI * 2;
							b.vx = Math.cos(a) * 0.05;
							b.vy = Math.sin(a) * 0.05;
							s = 0.05;
						}
						b.vx *= 1.02;
						b.vy *= 1.02;
					}
					if (s > MAX_SPEED) {
						b.vx *= MAX_SPEED / s;
						b.vy *= MAX_SPEED / s;
					}
					if (b.x < -MARGIN) b.vx += 0.03;
					if (b.x > W + MARGIN) b.vx -= 0.03;
					if (b.y < -MARGIN) b.vy += 0.03;
					if (b.y > H + MARGIN) b.vy -= 0.03;
				} else if (
					b.age > 40 &&
					(b.x < -GONE || b.x > W + GONE || b.y < -GONE || b.y > H + GONE)
				) {
					balls.splice(i, 1);
					continue;
				}
				const dist = Math.sqrt(b.vx * b.vx + b.vy * b.vy);
				b.x += b.vx;
				b.y += b.vy;
				rollPatch(b, dist);
			}
			for (let i = 0; i < balls.length; i++) {
				for (let j = i + 1; j < balls.length; j++) {
					const A = balls[i];
					const B = balls[j];
					const dx = B.x - A.x;
					const dy = B.y - A.y;
					const d = Math.sqrt(dx * dx + dy * dy) || 0.001;
					const min = A.r + B.r;
					if (d >= min) continue;
					const nx = dx / d;
					const ny = dy / d;
					const invA = 1 / A.m;
					const invB = 1 / B.m;
					const invSum = invA + invB;
					const ov = (min - d) / invSum;
					A.x -= nx * ov * invA;
					A.y -= ny * ov * invA;
					B.x += nx * ov * invB;
					B.y += ny * ov * invB;
					const rv = (B.vx - A.vx) * nx + (B.vy - A.vy) * ny;
					if (rv < 0) {
						const imp = (-(1 + RESTITUTION) * rv) / invSum;
						A.vx -= nx * imp * invA;
						A.vy -= ny * imp * invA;
						B.vx += nx * imp * invB;
						B.vy += ny * imp * invB;
					}
				}
			}
		}

		function drawBall(b: Ball): void {
			if (
				b.x < -b.r - 20 ||
				b.x > W + b.r + 20 ||
				b.y < -b.r - 20 ||
				b.y > H + b.r + 20
			)
				return;
			ctx!.save();
			ctx!.globalAlpha = b.cue ? CUE_ALPHA : ALPHA;
			ctx!.translate(b.x, b.y);
			ctx!.beginPath();
			ctx!.arc(0, 0, b.r, 0, Math.PI * 2);
			ctx!.clip();
			ctx!.fillStyle = b.cue ? "#eceff1" : COLORS[b.num];
			ctx!.fillRect(-b.r, -b.r, b.r * 2, b.r * 2);
			if (!b.cue) {
				const patches: Patch[] = [b.p, { x: -b.p.x, y: -b.p.y, z: -b.p.z }];
				for (const q of patches) {
					if (q.z <= 0.12) continue;
					const pr = b.r * 0.42 * q.z;
					const px = q.x * b.r * 0.8;
					const py = q.y * b.r * 0.8;
					ctx!.beginPath();
					ctx!.arc(px, py, pr, 0, Math.PI * 2);
					ctx!.fillStyle = "#f8f8f6";
					ctx!.fill();
					if (pr > 7) {
						ctx!.fillStyle = "#1c1c1e";
						ctx!.font = `500 ${Math.round(pr * 1.15)}px Inter, sans-serif`;
						ctx!.textAlign = "center";
						ctx!.textBaseline = "middle";
						ctx!.fillText(String(b.num), px, py + pr * 0.06);
					}
				}
			}
			const g = ctx!.createRadialGradient(
				-b.r * 0.32,
				-b.r * 0.32,
				b.r * 0.15,
				0,
				0,
				b.r * 1.05,
			);
			g.addColorStop(0, "rgba(255,255,255,0.42)");
			g.addColorStop(0.45, "rgba(255,255,255,0)");
			g.addColorStop(1, "rgba(0,0,0,0.18)");
			ctx!.fillStyle = g;
			ctx!.fillRect(-b.r, -b.r, b.r * 2, b.r * 2);
			ctx!.strokeStyle = "rgba(32,33,36,0.14)";
			ctx!.lineWidth = 1;
			ctx!.beginPath();
			ctx!.arc(0, 0, b.r - 0.5, 0, Math.PI * 2);
			ctx!.stroke();
			ctx!.restore();
		}

		function drawFrame(): void {
			ctx!.clearRect(0, 0, W, H);
			for (const b of balls) drawBall(b);
		}

		function frame(now: number): void {
			if (!running) return;
			raf = requestAnimationFrame(frame);
			let delta = now - lastTime;
			lastTime = now;
			if (delta > MAX_DELTA_MS) delta = MAX_DELTA_MS;
			acc += delta;
			while (acc >= STEP_MS) {
				stepOnce();
				acc -= STEP_MS;
			}
			if (now >= nextBreak) {
				spawnCue();
				nextBreak = now + 7000 + Math.random() * 9000;
			}
			drawFrame();
		}

		function start(): void {
			if (running || destroyed || reduced) return;
			running = true;
			lastTime = performance.now();
			acc = 0;
			if (nextBreak < lastTime) nextBreak = lastTime + 3000 + Math.random() * 5000;
			raf = requestAnimationFrame(frame);
		}

		function stop(): void {
			running = false;
			cancelAnimationFrame(raf);
		}

		function updateRunning(): void {
			if (inView && !document.hidden) start();
			else stop();
		}

		// Motion: only where no permission prompt is required (spec: "silent where allowed").
		const dme = (window as unknown as { DeviceMotionEvent?: { requestPermission?: unknown } })
			.DeviceMotionEvent;
		const motionAllowed =
			typeof dme !== "undefined" && typeof dme.requestPermission !== "function";

		function onMotion(e: DeviceMotionEvent): void {
			const g = e.accelerationIncludingGravity;
			if (g && g.x != null && g.y != null) {
				gx = Math.max(-0.08, Math.min(0.08, (-g.x / 9.81) * 0.06));
				gy = Math.max(-0.08, Math.min(0.08, (g.y / 9.81) * 0.06));
			}
			const a = e.acceleration;
			if (a && a.x != null) {
				const mag = Math.hypot(a.x ?? 0, a.y ?? 0, a.z ?? 0);
				const now = performance.now();
				if (mag > 18 && now - lastShake > 1200) {
					lastShake = now;
					for (const b of balls) {
						b.vx += (Math.random() - 0.5) * 14;
						b.vy += (Math.random() - 0.5) * 14;
					}
				}
			}
		}

		const ro = new ResizeObserver(resize);
		ro.observe(wrapper);
		const io = new IntersectionObserver((entries) => {
			inView = entries[0]?.isIntersecting ?? true;
			updateRunning();
		});
		io.observe(canvas);
		const onVis = (): void => updateRunning();
		document.addEventListener("visibilitychange", onVis);
		if (motionAllowed && !reduced) window.addEventListener("devicemotion", onMotion);

		resize();
		makeBalls();
		if (reduced) drawFrame();
		else updateRunning();

		return {
			destroy(): void {
				destroyed = true;
				stop();
				ro.disconnect();
				io.disconnect();
				document.removeEventListener("visibilitychange", onVis);
				window.removeEventListener("devicemotion", onMotion);
			},
		};
	} catch {
		return null;
	}
}
```

- [ ] **Step 2: Typecheck**

Run: `npm run typecheck` (in `D:\GDRIVE\ANTIGRAVITY\cueism`)
Expected: 0 errors, 0 warnings for `src/scripts/pool-hero.ts` (pre-existing warnings elsewhere are out of scope).

- [ ] **Step 3: Commit**

```bash
git add src/scripts/pool-hero.ts
git commit -m "feat: pool-ball hero animation engine (canvas physics, 360-degree rolling, cue breaks)"
git push origin main
```

---

### Task 2: PoolHero wrapper component + overflow guard

**Files:**
- Create: `src/components/PoolHero.astro`
- Modify: `src/styles/global.css` (body rule, around line 54)

- [ ] **Step 1: Create `src/components/PoolHero.astro` with exactly this content**

```astro
---
/**
 * Full-bleed canvas pool-ball animation behind slotted hero content.
 * Canvas extends 1.5x the content height and fades out at the bottom,
 * so balls drift under the following content with no visible boundary.
 */
---

<div class="pool-hero">
	<canvas class="pool-hero-canvas" aria-hidden="true"></canvas>
	<div class="pool-hero-content"><slot /></div>
</div>

<style>
	.pool-hero {
		position: relative;
		width: 100vw;
		margin-left: calc(50% - 50vw);
	}

	.pool-hero-canvas {
		position: absolute;
		top: 0;
		left: 0;
		width: 100%;
		height: 150%;
		z-index: -1;
		pointer-events: none;
		-webkit-mask-image: linear-gradient(to bottom, black 75%, transparent 100%);
		mask-image: linear-gradient(to bottom, black 75%, transparent 100%);
	}

	.pool-hero-content {
		max-width: 1200px;
		margin: 0 auto;
		padding: 0 var(--spacing-md);
	}
</style>

<script>
	import { initPoolHero, type PoolHeroHandle } from "../scripts/pool-hero";

	let handle: PoolHeroHandle | null = null;

	function setup() {
		handle?.destroy();
		handle = null;
		const canvas = document.querySelector<HTMLCanvasElement>("canvas.pool-hero-canvas");
		if (canvas) handle = initPoolHero(canvas);
	}

	document.addEventListener("astro:page-load", setup);
	document.addEventListener("astro:before-swap", () => {
		handle?.destroy();
		handle = null;
	});
</script>
```

Notes for the implementer:
- `z-index: -1` on the canvas plus NO z-index on `.pool-hero` is deliberate: the wrapper must not create a stacking context, so the canvas paints below all in-flow page content (hero text, cards) but above the body background. Balls that roll under white cards disappear behind them — that is the desired "under any content" effect.
- The `astro:page-load` listener fires on initial load too when `ClientRouter` is active (same pattern as `src/pages/shorts.astro:289`). Do not also call `setup()` at module top level — it would double-init.
- Astro dedupes this `<script>` bundle; there is exactly one PoolHero per page, so `querySelector` is sufficient.

- [ ] **Step 2: Add horizontal overflow guard to `src/styles/global.css`**

The `width: 100vw` breakout can exceed body width by the scrollbar width on Windows. In `src/styles/global.css`, find the `body { ... }` rule (starts line ~54) and add one line:

```css
body {
	background-color: var(--color-bg-base);
	color: var(--color-text-primary);
	font-family: var(--font-primary);
	font-size: 14px;
	line-height: 1.5;
	-webkit-font-smoothing: antialiased;
	-moz-osx-font-smoothing: grayscale;
	min-height: 100vh;
	display: flex;
	flex-direction: column;
	overflow-x: clip;
}
```

(The only change is adding `overflow-x: clip;`.)

- [ ] **Step 3: Typecheck**

Run: `npm run typecheck`
Expected: 0 new errors.

- [ ] **Step 4: Commit**

```bash
git add src/components/PoolHero.astro src/styles/global.css
git commit -m "feat: PoolHero full-bleed canvas wrapper with fade-out zone"
git push origin main
```

---

### Task 3: Wrap heroes on home, posts index, and shorts

**Files:**
- Modify: `src/pages/index.astro:21-25`
- Modify: `src/pages/posts/index.astro:26-30`
- Modify: `src/pages/shorts.astro:40-44`

- [ ] **Step 1: `src/pages/index.astro` — import and wrap**

Add to frontmatter imports (after the `SavingsTicker` import on line 5):

```ts
import PoolHero from "../components/PoolHero.astro";
```

Replace:

```astro
	<section class="hero">
		<h1>Every Player of any species</h1>
		<p>Australian-made billiard accessories designed by and for the Pool player.</p>
		<a href="/products" class="btn btn-primary" data-astro-prefetch>Shop the Collection</a>
	</section>
```

With:

```astro
	<PoolHero>
		<section class="hero">
			<h1>Every Player of any species</h1>
			<p>Australian-made billiard accessories designed by and for the Pool player.</p>
			<a href="/products" class="btn btn-primary" data-astro-prefetch>Shop the Collection</a>
		</section>
	</PoolHero>
```

- [ ] **Step 2: `src/pages/posts/index.astro` — import and wrap**

Add to frontmatter imports (after the `post-format` import on line 5):

```ts
import PoolHero from "../../components/PoolHero.astro";
```

Replace:

```astro
	<section class="hero">
		<h1>Journaling</h1>
		<p>News and stuff from the World.</p>
		<a href="/products" class="btn btn-orange" data-astro-prefetch>Shop the Collection</a>
	</section>
```

With:

```astro
	<PoolHero>
		<section class="hero">
			<h1>Journaling</h1>
			<p>News and stuff from the World.</p>
			<a href="/products" class="btn btn-orange" data-astro-prefetch>Shop the Collection</a>
		</section>
	</PoolHero>
```

- [ ] **Step 3: `src/pages/shorts.astro` — import and wrap**

Add to frontmatter imports (alongside the existing imports at the top):

```ts
import PoolHero from "../components/PoolHero.astro";
```

Replace:

```astro
	<section class="hero">
		<h1>Shorty</h1>
		<p>Our YouTube Shorts, all in one place.</p>
		<a href="/products" class="btn btn-yellow" data-astro-prefetch>Shop the Collection</a>
	</section>
```

With:

```astro
	<PoolHero>
		<section class="hero">
			<h1>Shorty</h1>
			<p>Our YouTube Shorts, all in one place.</p>
			<a href="/products" class="btn btn-yellow" data-astro-prefetch>Shop the Collection</a>
		</section>
	</PoolHero>
```

- [ ] **Step 4: Typecheck**

Run: `npm run typecheck`
Expected: 0 new errors.

- [ ] **Step 5: Commit**

```bash
git add src/pages/index.astro src/pages/posts/index.astro src/pages/shorts.astro
git commit -m "feat: pool-ball animation behind home, journaling, and shorts heroes"
git push origin main
```

---

### Task 4: Products page

**Files:**
- Modify: `src/pages/products/index.astro:21-23`

- [ ] **Step 1: Import and wrap the Shop heading**

Add to frontmatter imports (after the `products` util import on line 5):

```ts
import PoolHero from "../../components/PoolHero.astro";
```

The products page has no `.hero` section — the heading sits inside `.shop-grid`. Pull the heading out into its own wrapped block so balls roll behind it and fade into the grid below. Replace:

```astro
	<section class="shop-grid">
		<h1 style="font-size: 2rem; font-weight: 400; margin-bottom: var(--spacing-md);">Shop</h1>
		<div class="grid grid-auto">
```

With:

```astro
	<PoolHero>
		<section style="padding: var(--spacing-lg) 0; margin-bottom: 0;">
			<h1 style="font-size: 2rem; font-weight: 400; margin-bottom: 0;">Shop</h1>
		</section>
	</PoolHero>
	<section class="shop-grid">
		<div class="grid grid-auto">
```

(The closing `</div></section>` at the end of the grid is unchanged — the section element count stays balanced: one new section opens and closes inside PoolHero, and the `shop-grid` section keeps its original close tag.)

- [ ] **Step 2: Typecheck**

Run: `npm run typecheck`
Expected: 0 new errors.

- [ ] **Step 3: Commit**

```bash
git add src/pages/products/index.astro
git commit -m "feat: pool-ball animation behind Shop heading on products index"
git push origin main
```

---

### Task 5: Browser verification (dev server)

**Files:** none (verification only; fix-forward any issues found, committing fixes with `fix:` messages)

- [ ] **Step 1: Start dev server**

Run: `npm run dev` in `D:\GDRIVE\ANTIGRAVITY\cueism`
Expected: serves on http://localhost:4321

- [ ] **Step 2: Per-page checks** — visit `/`, `/posts`, `/shorts`, `/products`

On each page confirm:
- Large faint balls (1–8, correct colours) drifting behind the hero text; text and CTA fully readable.
- Balls slide off the left/right/top edges without bouncing off a visible wall, and fade out as they drift below the hero into the content zone.
- Within ~16 s a white cue ball smashes through and scatters the pack, then leaves.
- Number patches orbit the ball face in the direction of travel (roll a while and watch a number wrap around the back and reappear).
- Browser console: zero errors.
- No horizontal scrollbar at any window width (test narrow too).

- [ ] **Step 3: Navigation check (view transitions)**

Click between the four pages using site nav links. After each navigation the animation runs on the new page. In DevTools Performance panel (or via a quick `let n=0` counter breakpoint), confirm only ONE rAF loop is active after several navigations — no acceleration of ball motion (double-stepping is the visible symptom of a leaked loop).

- [ ] **Step 4: Reduced motion**

DevTools → Rendering → "Emulate CSS media feature prefers-reduced-motion: reduce", reload `/`.
Expected: static scattered balls, no movement, no cue breaks.

- [ ] **Step 5: Off-screen pause**

Scroll the hero fully out of view; in the Performance monitor confirm CPU drops to idle (no canvas work). Scroll back up: animation resumes at normal speed with no catch-up jump.

- [ ] **Step 6: Mobile emulation**

DevTools device toolbar (e.g. Pixel): layout correct, balls proportionally smaller (~7% of viewport width). Sensors panel → custom orientation: tilting changes drift direction. (Sign/feel verified on a real phone after deploy in Task 6.)

- [ ] **Step 7: Commit any fixes**

```bash
git add -A
git commit -m "fix: <specific issue found during browser verification>"
git push origin main
```

(Skip if nothing needed fixing.)

---

### Task 6: Deploy and live verification

**Files:** none

- [ ] **Step 1: Deploy**

Run: `npm run deploy`
(This is `astro build && wrangler deploy`. NEVER run bare `wrangler deploy` — it does not rebuild and has caused a prod outage before. Wrangler auth comes from the environment token.)
Expected: build succeeds, worker uploads, deployment URL printed.

- [ ] **Step 2: Live spot-check**

Visit https://cueism.com, /posts, /shorts, /products in a normal browser:
- Animation present and subtle on all four; console clean; Lighthouse-eyeball check that page feels as fast as before (script is a few KB, deferred).

- [ ] **Step 3: Real phone check (user assist)**

Ask the user to open cueism.com on their phone:
- Android: tilting the phone makes balls drift accordingly (if the direction feels inverted, flip the sign of `gx`/`gy` in `onMotion` in `src/scripts/pool-hero.ts`, redeploy);
- shake triggers a scatter burst;
- iPhone: animation runs, NO permission popup appears.

- [ ] **Step 4: Final commit/push if any live fixes were made**

```bash
git add -A
git commit -m "fix: <live issue>"
git push origin main
```

---

## Self-review (completed at plan time)

- **Spec coverage:** pages ✓ (Tasks 3–4), engine visuals/physics/rolling ✓ (Task 1), fade zone + full bleed + stacking ✓ (Task 2), motion silent-where-allowed ✓ (Task 1 `motionAllowed`), perf rails (IO/visibility/reduced-motion/dt-normalized) ✓ (Task 1), ClientRouter init/teardown ✓ (Task 2 script), error handling try/catch + null guards ✓ (Task 1), testing ✓ (Tasks 5–6), deploy convention ✓ (Task 6).
- **Placeholders:** none — all code complete.
- **Type consistency:** `initPoolHero(canvas): PoolHeroHandle | null` matches the component's usage; `PoolHeroHandle.destroy()` matches teardown calls.
