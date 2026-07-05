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
	num: number; // 1-8 solids, 9+ stripes, 0 = cue
	m: number;
	cue: boolean;
	age: number;
	p: Patch; // number-patch position on the sphere
	q: Patch; // stripe polar axis (white caps on 9+), kept perpendicular to p
}

const BALL_COUNT = 10; // 1-8 solids + 9-10 stripes
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

/** Stripes reuse the solid colour wheel: 9 shares 1 (yellow), 10 shares 2 (blue)... */
function ballColor(num: number): string {
	return COLORS[((num - 1) % 8) + 1];
}

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
// Cue-ball break cadence: first break lands sooner so new visitors see one,
// steady-state is 7-16 s, and resuming from a pause waits a beat so a stale
// (already-due) break doesn't fire the instant the hero scrolls back in.
const FIRST_BREAK_DELAY_MS = 5000;
const FIRST_BREAK_JITTER_MS = 6000;
const BREAK_DELAY_MS = 7000;
const BREAK_JITTER_MS = 9000;
const RESUME_BREAK_DELAY_MS = 3000;
const RESUME_BREAK_JITTER_MS = 5000;
// Surface markings are discs on the sphere with angular radius asin(SIN);
// COS places the disc's centre at the right depth (SIN^2 + COS^2 = 1).
const PATCH_SIN = 0.4; // number patch
const PATCH_COS = 0.92;
const CAP_SIN = 0.66; // white polar caps on striped balls
const CAP_COS = 0.75;

export function initPoolHero(canvas: HTMLCanvasElement): PoolHeroHandle | null {
	try {
		const ctx = canvas.getContext("2d");
		if (!ctx) return null;

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
		let nextBreak = performance.now() + FIRST_BREAK_DELAY_MS + Math.random() * FIRST_BREAK_JITTER_MS;
		let gx = 0;
		let gy = 0;
		let lastShake = 0;

		function resize(): void {
			const dpr = Math.min(2, window.devicePixelRatio || 1);
			// CSS owns the canvas geometry (see PoolHero.astro); simulate over
			// whatever box it gives us so backing store and display never desync.
			const rect = canvas.getBoundingClientRect();
			W = Math.round(rect.width);
			H = Math.round(rect.height);
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

		/** Random unit vector perpendicular to v — puts the number patch on the stripe equator. */
		function randPerp(v: Patch): Patch {
			const w = randPatch();
			const dot = w.x * v.x + w.y * v.y + w.z * v.z;
			const px = w.x - v.x * dot;
			const py = w.y - v.y * dot;
			const pz = w.z - v.z * dot;
			const len = Math.sqrt(px * px + py * py + pz * pz) || 1;
			return { x: px / len, y: py / len, z: pz / len };
		}

		function baseRadius(): number {
			return Math.min(54, Math.max(28, W * 0.07));
		}

		function makeBalls(): void {
			balls = [];
			const base = baseRadius();
			for (let n = 1; n <= BALL_COUNT; n++) {
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
				const p = randPatch();
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
					p,
					q: randPerp(p),
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
				q: randPatch(),
			});
		}

		/** Rodrigues rotation of v about the in-screen axis (ax, ay, 0). */
		function rotateOnSphere(v: Patch, ax: number, ay: number, c: number, sn: number): Patch {
			const dot = ax * v.x + ay * v.y;
			return {
				x: v.x * c + ay * v.z * sn + ax * dot * (1 - c),
				y: v.y * c - ax * v.z * sn + ay * dot * (1 - c),
				z: v.z * c + (ax * v.y - ay * v.x) * sn,
			};
		}

		/** Roll the ball's surface orientation about the axis perpendicular to velocity. */
		function rollPatch(b: Ball, dist: number): void {
			const s = Math.sqrt(b.vx * b.vx + b.vy * b.vy);
			if (s < 0.02) return;
			const ax = -b.vy / s;
			const ay = b.vx / s;
			const th = dist / b.r;
			const c = Math.cos(th);
			const sn = Math.sin(th);
			b.p = rotateOnSphere(b.p, ax, ay, c, sn);
			b.q = rotateOnSphere(b.q, ax, ay, c, sn);
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

		/**
		 * Draw a disc marking (number patch or stripe cap) that lies ON the
		 * sphere: projected orthographically it is an ellipse squashed along
		 * the radial screen direction by the disc normal's z, so markings stay
		 * "painted on" as the ball rolls and collapse smoothly to a sliver at
		 * the terminator instead of popping in and out.
		 */
		function drawSurfaceDisc(
			b: Ball,
			v: Patch,
			sin: number,
			cos: number,
			fill: string,
			label?: string,
		): void {
			if (v.z <= 0.02) return;
			const major = b.r * sin;
			const minor = major * v.z;
			if (minor < 0.5) return;
			const theta = Math.atan2(v.y, v.x);
			ctx!.save();
			ctx!.translate(v.x * b.r * cos, v.y * b.r * cos);
			// Squash along the radial direction while keeping the drawing frame
			// upright: R(theta) * S(z, 1) * R(-theta).
			ctx!.rotate(theta);
			ctx!.scale(v.z, 1);
			ctx!.rotate(-theta);
			ctx!.beginPath();
			ctx!.arc(0, 0, major, 0, Math.PI * 2);
			ctx!.fillStyle = fill;
			ctx!.fill();
			if (label && major > 7 && minor > 4) {
				ctx!.fillStyle = "#1c1c1e";
				const fontScale = label.length > 1 ? 0.92 : 1.15;
				ctx!.font = `500 ${Math.round(major * fontScale)}px Inter, sans-serif`;
				ctx!.textAlign = "center";
				ctx!.textBaseline = "middle";
				ctx!.fillText(label, 0, major * 0.06);
			}
			ctx!.restore();
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
			ctx!.fillStyle = b.cue ? "#eceff1" : ballColor(b.num);
			ctx!.fillRect(-b.r, -b.r, b.r * 2, b.r * 2);
			if (!b.cue && b.num > 8) {
				// Stripe: white polar caps at +/-q; the coloured band between them
				// tumbles with the ball's rolling orientation.
				drawSurfaceDisc(b, b.q, CAP_SIN, CAP_COS, "#f4f4f2");
				drawSurfaceDisc(b, { x: -b.q.x, y: -b.q.y, z: -b.q.z }, CAP_SIN, CAP_COS, "#f4f4f2");
			}
			if (!b.cue) {
				const label = String(b.num);
				drawSurfaceDisc(b, b.p, PATCH_SIN, PATCH_COS, "#f8f8f6", label);
				drawSurfaceDisc(b, { x: -b.p.x, y: -b.p.y, z: -b.p.z }, PATCH_SIN, PATCH_COS, "#f8f8f6", label);
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
				nextBreak = now + BREAK_DELAY_MS + Math.random() * BREAK_JITTER_MS;
			}
			drawFrame();
		}

		function start(): void {
			if (running || destroyed || reduced) return;
			running = true;
			lastTime = performance.now();
			acc = 0;
			if (nextBreak < lastTime)
				nextBreak = lastTime + RESUME_BREAK_DELAY_MS + Math.random() * RESUME_BREAK_JITTER_MS;
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
		ro.observe(canvas);
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
