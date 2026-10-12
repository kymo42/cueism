"""
Generates the editorial graphics for the Cueism article
"Learn to Lose First" (content/posts/learn-to-lose-first.md).

Run from this directory:
    python generate.py

All figures are original: they are computed from the published models and
simulations described in their captions, not traced from another source.
Requires: Pillow, numpy.

Layout grid
-----------
kicker  y=74      title y=122     dek y=196     rule y=258
panel header: title y=300, subtitle/detail lines y=336, y=370
plot area: PLOT_TOP=430 .. PLOT_BOTTOM=790
source line: H-62
"""

from __future__ import annotations

import math
import os

import numpy as np
from PIL import Image, ImageDraw, ImageFilter, ImageFont

HERE = os.path.dirname(os.path.abspath(__file__))
FONTS = r"C:\Windows\Fonts"

# ---------------------------------------------------------------- palette
INK = (32, 33, 36)
MUTED = (95, 99, 104)
FAINT = (154, 160, 166)
GRID = (232, 234, 237)
PAPER = (255, 255, 255)
ACCENT = (26, 115, 232)
ACCENT_SOFT = (210, 227, 252)
GREEN = (18, 133, 95)
GREEN_SOFT = (206, 234, 222)
ALERT = (217, 48, 37)
AMBER = (232, 113, 10)

W, H = 1600, 900
PLOT_TOP, PLOT_BOTTOM = 430, 790
HDR_TITLE_Y, HDR_LINE1_Y, HDR_LINE2_Y = 300, 336, 370


def font(name: str, size: int) -> ImageFont.FreeTypeFont:
    return ImageFont.truetype(os.path.join(FONTS, name), size)


def seg(size: int, bold: bool = False, light: bool = False) -> ImageFont.FreeTypeFont:
    if bold:
        return font("segoeuib.ttf", size)
    if light:
        return font("segoeuil.ttf", size)
    return font("segoeui.ttf", size)


# ---------------------------------------------------------------- helpers
def tracked_text(draw, xy, text, fnt, fill, tracking=0.0):
    x, y = xy
    for ch in text:
        draw.text((x, y), ch, font=fnt, fill=fill)
        x += draw.textlength(ch, font=fnt) + tracking


def dashed_line(draw, p0, p1, fill, width=3, dash=14, gap=10):
    x0, y0 = p0
    x1, y1 = p1
    length = math.hypot(x1 - x0, y1 - y0)
    if length == 0:
        return
    ux, uy = (x1 - x0) / length, (y1 - y0) / length
    pos = 0.0
    while pos < length:
        end = min(pos + dash, length)
        draw.line([(x0 + ux * pos, y0 + uy * pos), (x0 + ux * end, y0 + uy * end)],
                  fill=fill, width=width)
        pos = end + gap


def save(img: Image.Image, name: str):
    path = os.path.join(HERE, name)
    img.save(path, "PNG", optimize=True)
    print(f"wrote {path}  ({img.size[0]}x{img.size[1]}, {os.path.getsize(path) // 1024} KB)")


def chart_shell(title, subtitle, source):
    img = Image.new("RGB", (W, H), PAPER)
    d = ImageDraw.Draw(img)
    tracked_text(d, (90, 74), "CUEISM  ·  ANALYSIS", seg(20, bold=True), ACCENT, tracking=3.4)
    d.text((90, 122), title, font=font("georgiab.ttf", 54), fill=INK)
    d.text((90, 196), subtitle, font=seg(30), fill=MUTED)
    d.line([(90, 258), (W - 90, 258)], fill=GRID, width=2)
    d.text((90, H - 62), source, font=seg(20), fill=FAINT)
    tracked_text(d, (W - 205, H - 62), "CUEISM.COM", seg(20, bold=True), FAINT, tracking=2.4)
    return img, d


def panel_header(d, x, title, lines):
    d.text((x, HDR_TITLE_Y), title, font=seg(28, bold=True), fill=INK)
    for i, line in enumerate(lines):
        d.text((x, HDR_LINE1_Y + i * 34), line, font=seg(22), fill=MUTED)


# ================================================================ figure 1
def figure_streaks():
    n, p = 12, 0.5
    ks = np.arange(0, n + 1)
    pmf = np.array([math.comb(n, k) * p**k * (1 - p) ** (n - k) for k in ks])

    p_le1 = pmf[ks <= 1].sum()
    p_le2 = pmf[ks <= 2].sum()
    p_le3 = pmf[ks <= 3].sum()
    season = lambda q: 1 - (1 - q) ** 52
    print(f"[streaks] P(<=1)={p_le1:.5f}  P(<=2)={p_le2:.4f}  P(<=3)={p_le3:.4f}")
    print(f"[streaks] per season: <=2 wins {season(p_le2):.3f}, <=3 wins {season(p_le3):.3f}, "
          f"<=1 win {season(p_le1):.3f}")

    img, d = chart_shell(
        "A bad week is not a bad player",
        "The same 50% player, twelve matches a week — the arithmetic of noise",
        "Left: binomial distribution, p = 0.5, n = 12.  Right: one simulated 52-week season "
        "at 12 matches a week (seed 7).",
    )

    rng = np.random.default_rng(7)
    weeks = rng.binomial(n, p, size=52)
    worst = int(weeks.min())
    low_weeks = int((weeks <= 2).sum())

    # ---------------- panel A: one week
    ax0, ax1 = 110, 730
    panel_header(d, ax0, "One week", ["probability of winning k of 12 matches"])
    top = pmf.max() * 1.34
    for k, v in zip(ks, pmf):
        x = ax0 + (ax1 - ax0) * (k + 0.5) / (n + 1)
        half = (ax1 - ax0) / (n + 1) * 0.36
        y = PLOT_BOTTOM - (PLOT_BOTTOM - PLOT_TOP) * (v / top)
        hot = k <= 2
        d.rounded_rectangle([x - half, y, x + half, PLOT_BOTTOM], radius=5,
                            fill=ALERT if hot else ACCENT_SOFT)
    d.line([(ax0, PLOT_BOTTOM), (ax1, PLOT_BOTTOM)], fill=FAINT, width=2)
    for k in range(0, n + 1):
        x = ax0 + (ax1 - ax0) * (k + 0.5) / (n + 1)
        d.text((x - 7, PLOT_BOTTOM + 14), str(k), font=seg(20), fill=MUTED)

    xa = ax0 + (ax1 - ax0) * 1.5 / (n + 1)
    d.line([(xa, PLOT_TOP - 10), (xa, PLOT_BOTTOM)], fill=ALERT, width=2)
    d.text((xa + 18, PLOT_TOP - 26), f"{p_le2 * 100:.1f}% of weeks", font=seg(27, bold=True), fill=ALERT)
    d.text((xa + 18, PLOT_TOP + 12), "end with two wins or fewer.", font=seg(21), fill=MUTED)
    d.text((xa + 18, PLOT_TOP + 42), "A coin-flip player sees a week", font=seg(21), fill=MUTED)
    d.text((xa + 18, PLOT_TOP + 72), f"that bad in {season(p_le2) * 100:.0f}% of seasons.", font=seg(21), fill=MUTED)

    # ---------------- panel B: one season
    bx0, bx1 = 870, 1490
    panel_header(d, bx0, "One season", [
        "matches won each week, 52 weeks — skill never changes",
        f"worst week: {worst} wins. Weeks at 2 or fewer: {low_weeks} of 52.",
    ])
    bar = (bx1 - bx0) / 52 * 0.62
    for i, w in enumerate(weeks):
        x = bx0 + (bx1 - bx0) * (i + 0.5) / 52
        y = PLOT_BOTTOM - (PLOT_BOTTOM - PLOT_TOP) * (w / n)
        d.rounded_rectangle([x - bar / 2, y, x + bar / 2, PLOT_BOTTOM], radius=3,
                            fill=ALERT if w <= 2 else GREEN_SOFT)
    y6 = PLOT_BOTTOM - (PLOT_BOTTOM - PLOT_TOP) * (6 / n)
    dashed_line(d, (bx0, y6), (bx1, y6), FAINT, width=2, dash=10, gap=8)
    d.text((bx1 - 150, y6 + 8), "expected: 6", font=seg(21), fill=MUTED)
    d.line([(bx0, PLOT_BOTTOM), (bx1, PLOT_BOTTOM)], fill=FAINT, width=2)

    iw = int(np.argmin(weeks))
    xw = bx0 + (bx1 - bx0) * (iw + 0.5) / 52
    yw = PLOT_BOTTOM - (PLOT_BOTTOM - PLOT_TOP) * (worst / n)
    d.ellipse([xw - 16, yw - 16, xw + 16, yw + 16], outline=ALERT, width=3)
    d.line([(xw, PLOT_TOP - 8), (xw + 46, PLOT_TOP + 8)], fill=ALERT, width=2)
    d.text((xw + 54, PLOT_TOP - 18), f"a {worst}-win week", font=seg(21, bold=True), fill=ALERT)

    save(img, "streaks.png")


# ================================================================ figure 2
def figure_loss_aversion():
    img, d = chart_shell(
        "Why one loss weighs more than one win",
        "The value function of prospect theory, and the estimate that keeps shrinking",
        "Value function after Tversky & Kahneman (1992). Coefficients: T&K (1992); "
        "Walasek, Mullett & Stewart (2024), J. Economic Psychology.",
    )

    # ---------------- left panel: the value function
    ax0, ax1 = 150, 790
    panel_header(d, ax0, "The value function", ["how a result becomes a feeling"])
    cx = (ax0 + ax1) / 2
    cy = PLOT_TOP + (PLOT_BOTTOM - PLOT_TOP) * 0.52

    d.line([(ax0, cy), (ax1, cy)], fill=GRID, width=2)
    d.line([(cx, PLOT_TOP), (cx, PLOT_BOTTOM)], fill=GRID, width=2)
    d.text((ax1 - 76, cy - 32), "gain", font=seg(21), fill=MUTED)
    d.text((cx + 14, PLOT_TOP + 2), "value", font=seg(21), fill=MUTED)

    def curve(lmbda, color, width, dash=False):
        pos, neg = [], []
        for t in np.linspace(0, 1, 160):
            pos.append((cx + t * (ax1 - cx) * 0.92, cy - (t**0.88) * (cy - PLOT_TOP) * 0.86))
            neg.append((cx - t * (cx - ax0) * 0.92, cy + lmbda * (t**0.88) * (PLOT_BOTTOM - cy) * 0.34))
        for pts in (pos, neg):
            if dash:
                for i in range(len(pts) - 1):
                    dashed_line(d, pts[i], pts[i + 1], color, width=width, dash=9, gap=7)
            else:
                d.line(pts, fill=color, width=width, joint="curve")

    curve(2.25, AMBER, 5, dash=True)
    curve(1.31, ACCENT, 6)

    # legend, upper-left quadrant (empty)
    lx, ly = ax0 + 16, PLOT_TOP + 12
    d.line([(lx, ly + 12), (lx + 56, ly + 12)], fill=ACCENT, width=6)
    d.text((lx + 70, ly - 2), "λ = 1.31 · pooled, 2024", font=seg(23), fill=INK)
    ly2 = ly + 46
    for i in range(0, 56, 16):
        d.line([(lx + i, ly2 + 12), (lx + i + 9, ly2 + 12)], fill=AMBER, width=5)
    d.text((lx + 70, ly2 - 2), "λ = 2.25 · the 1992 number", font=seg(23), fill=MUTED)

    # annotation, lower-right quadrant (empty)
    d.text((cx + 40, cy + 62), "losses hurt more than", font=seg(23, bold=True), fill=INK)
    d.text((cx + 40, cy + 92), "equal gains feel good", font=seg(23, bold=True), fill=INK)
    d.text((cx + 40, cy + 128), "so the curve is steeper", font=seg(21), fill=MUTED)
    d.text((cx + 40, cy + 156), "below the axis than above it", font=seg(21), fill=MUTED)

    # ---------------- right panel: how big is lambda
    bx = 900
    panel_header(d, bx, "How big is the asymmetry?",
                 ["loss-aversion coefficient λ, with the honest uncertainty"])
    sx0, sx1 = bx + 40, W - 160
    lo, hi = 0.85, 2.60
    scale = lambda v: sx0 + (sx1 - sx0) * (v - lo) / (hi - lo)

    rows = [
        ("Tversky & Kahneman 1992", 2.25, None, None, AMBER, "the most-cited estimate"),
        ("Walasek et al. 2024", 1.31, 1.10, 1.53, ACCENT, "pooled meta-analysis, 95% CI"),
        ("no asymmetry", 1.00, None, None, FAINT, "for reference"),
    ]
    for i, (label, val, ci_lo, ci_hi, color, note) in enumerate(rows):
        y = 450 + i * 115
        d.text((bx, y - 52), label, font=seg(25, bold=True), fill=INK)
        d.text((bx, y - 22), note, font=seg(20), fill=MUTED)
        d.line([(sx0, y + 14), (sx1, y + 14)], fill=GRID, width=3)
        if ci_lo is not None:
            d.line([(scale(ci_lo), y + 14), (scale(ci_hi), y + 14)], fill=color, width=9)
            for edge in (ci_lo, ci_hi):
                d.line([(scale(edge), y + 1), (scale(edge), y + 27)], fill=color, width=6)
        d.ellipse([scale(val) - 14, y, scale(val) + 14, y + 28], fill=color)
        label_x = scale(ci_hi) + 26 if ci_hi is not None else scale(val) + 24
        d.text((label_x, y - 6), f"{val:.2f}", font=seg(26, bold=True), fill=color)

    axis_y = 790
    for tick in (1.0, 1.5, 2.0, 2.5):
        d.line([(scale(tick), axis_y), (scale(tick), axis_y + 10)], fill=FAINT, width=2)
        d.text((scale(tick) - 16, axis_y + 16), f"{tick:.1f}", font=seg(20), fill=MUTED)
    d.text((bx, 756), "λ = 1 means a loss and a win of equal size are felt equally.",
           font=seg(21), fill=MUTED)

    save(img, "loss-aversion.png")


# ================================================================ figure 3
def figure_objectives():
    img, d = chart_shell(
        "The same maths, two opposite answers",
        "Why 'never chase' and 'always chase' are both correct — about different questions",
        "Left: expected log growth per bet, p = 0.55, even-money.  Right: Monte Carlo, p = 0.45, "
        "20,000 paths, target = double or bust (seed 11).",
    )

    # ---------------- panel A: growth-optimal staking
    ax0, ax1 = 150, 740
    panel_header(d, ax0, "The career game",
                 ["expected log growth per bet against stake size"])
    p = 0.55
    fs = np.linspace(0.001, 0.62, 400)
    g = p * np.log(1 + fs) + (1 - p) * np.log(1 - fs)
    f_star = 2 * p - 1
    gmax = p * math.log(1 + f_star) + (1 - p) * math.log(1 - f_star)
    yzero = PLOT_TOP + (PLOT_BOTTOM - PLOT_TOP) * 0.62

    gx = lambda f: ax0 + (ax1 - ax0) * (f / 0.62)
    gy = lambda v: yzero - v * (yzero - PLOT_TOP) * 0.86 / gmax

    d.line([(ax0, yzero), (ax1, yzero)], fill=FAINT, width=2)
    d.line([(gx(f), gy(v)) for f, v in zip(fs, g) if f < 2 * f_star],
           fill=ACCENT, width=6, joint="curve")
    d.line([(gx(f), gy(v)) for f, v in zip(fs, g) if f >= 2 * f_star and gy(v) <= PLOT_BOTTOM],
           fill=ALERT, width=6, joint="curve")

    d.ellipse([gx(f_star) - 11, gy(gmax) - 11, gx(f_star) + 11, gy(gmax) + 11], fill=GREEN)
    d.line([(gx(f_star), gy(gmax)), (gx(f_star), yzero)], fill=GREEN, width=2)
    d.line([(gx(2 * f_star), yzero), (gx(2 * f_star), PLOT_BOTTOM - 40)], fill=ALERT, width=2)
    d.text((ax0 - 18, yzero + 12), "0", font=seg(20), fill=MUTED)
    d.text((ax1 - 96, PLOT_BOTTOM + 14), "stake fraction", font=seg(20), fill=MUTED)

    # labels, in the empty right half, with leaders
    lx, ly = ax0 + 300, PLOT_TOP + 66
    d.line([(lx - 16, ly + 12), (gx(f_star) + 12, gy(gmax) + 4)], fill=GREEN, width=2)
    d.text((lx, ly - 30), "f* = 10%", font=seg(27, bold=True), fill=GREEN)
    d.text((lx, ly + 10), "the growth-optimal stake", font=seg(22), fill=MUTED)
    d.text((lx, ly + 40), "for a 55% edge at even money", font=seg(22), fill=MUTED)

    lx2, ly2 = ax0 + 300, PLOT_TOP + 210
    d.line([(lx2 - 16, ly2 + 10), (gx(2 * f_star), yzero - 2)], fill=ALERT, width=2)
    d.text((lx2, ly2 - 30), "2f* = 20%", font=seg(27, bold=True), fill=ALERT)
    d.text((lx2, ly2 + 10), "expected growth turns negative.", font=seg(22), fill=MUTED)
    d.text((lx2, ly2 + 40), "Stake past this and ruin is certain,", font=seg(22), fill=MUTED)
    d.text((lx2, ly2 + 70), "even with a genuine 5% edge.", font=seg(22), fill=MUTED)

    # ---------------- panel B: deadline objective
    bx0, bx1 = 900, 1490
    rng = np.random.default_rng(11)
    fracs = np.linspace(0.05, 1.0, 14)
    paths, rounds = 20000, 400
    probs = []
    for f in fracs:
        bank = np.ones(paths)
        alive = np.ones(paths, dtype=bool)
        won = np.zeros(paths, dtype=bool)
        for _ in range(rounds):
            idx = np.where(alive)[0]
            if idx.size == 0:
                break
            b = np.minimum(bank[idx] * f, 2.0 - bank[idx])
            b = np.maximum(b, 0.0)
            win = rng.random(idx.size) < 0.45
            bank[idx] = np.where(win, bank[idx] + b, bank[idx] - b)
            hit_t = bank[idx] >= 2.0 - 1e-9
            hit_r = bank[idx] <= 1e-9
            won[idx[hit_t]] = True
            alive[idx[hit_t]] = False
            alive[idx[hit_r]] = False
        probs.append(won.mean())
    probs = np.array(probs)
    print("[objectives] P(double before bust): "
          + ", ".join(f"f={f:.2f}:{v:.3f}" for f, v in zip(fracs, probs)))

    panel_header(d, bx0, "The Friday-night game", [
        "chance of doubling up before busting, p = 0.45",
        f"pressing wins here: {probs.max() * 100:.0f}% at bold play vs {probs[0] * 100:.0f}% at the smallest stake.",
    ])

    top = max(probs.max() * 1.22, 0.05)
    pts = [(bx0 + (bx1 - bx0) * (i + 0.5) / len(fracs),
            PLOT_BOTTOM - (PLOT_BOTTOM - PLOT_TOP) * (v / top)) for i, v in enumerate(probs)]
    for x, y in pts:
        d.line([(x, PLOT_BOTTOM), (x, y)], fill=ACCENT_SOFT, width=22)
    d.line(pts, fill=ACCENT, width=6, joint="curve")
    for x, y in pts:
        d.ellipse([x - 7, y - 7, x + 7, y + 7], fill=ACCENT)
    d.line([(bx0, PLOT_BOTTOM), (bx1, PLOT_BOTTOM)], fill=FAINT, width=2)
    d.text((bx0, PLOT_BOTTOM + 14), "small stake", font=seg(20), fill=MUTED)
    d.text((bx1 - 176, PLOT_BOTTOM + 14), "all-in (bold play)", font=seg(20), fill=MUTED)
    d.text((bx0 + 8, PLOT_TOP + 6), "With a deadline and a target,", font=seg(22, bold=True), fill=INK)
    d.text((bx0 + 8, PLOT_TOP + 40), "maximising variance maximises", font=seg(22), fill=MUTED)
    d.text((bx0 + 8, PLOT_TOP + 70), "your chance of getting there.", font=seg(22), fill=MUTED)

    save(img, "objective-functions.png")


# ================================================================ hero
def hero():
    w, h = 1600, 900
    img = Image.new("RGB", (w, h), (11, 26, 22))
    d = ImageDraw.Draw(img)

    top = np.array([13, 17, 23], dtype=float)
    bot = np.array([10, 58, 45], dtype=float)
    for y in range(h):
        t = (y / h) ** 0.85
        row = top * (1 - t) + bot * t
        d.line([(0, y), (w, y)], fill=tuple(int(c) for c in row))

    table = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    td = ImageDraw.Draw(table)
    tx0, ty0, tx1, ty1 = 880, 150, 1580, 830
    td.rounded_rectangle([tx0, ty0, tx1, ty1], radius=44, fill=(20, 92, 70, 210))
    td.rounded_rectangle([tx0 + 26, ty0 + 26, tx1 - 26, ty1 - 26], radius=30, fill=(26, 116, 88, 235))
    for cx_, cy_ in [(tx0 + 44, ty0 + 44), (tx1 - 44, ty0 + 44), (tx0 + 44, ty1 - 44),
                     (tx1 - 44, ty1 - 44), ((tx0 + tx1) / 2, ty0 + 34), ((tx0 + tx1) / 2, ty1 - 34)]:
        td.ellipse([cx_ - 30, cy_ - 30, cx_ + 30, cy_ + 30], fill=(9, 32, 26, 255))
        td.ellipse([cx_ - 21, cy_ - 21, cx_ + 21, cy_ + 21], fill=(4, 14, 12, 255))

    balls = [
        (0.26, 0.46, 22, (245, 245, 240)),
        (0.55, 0.32, 22, (232, 196, 44)),
        (0.64, 0.40, 22, (32, 74, 168)),
        (0.60, 0.52, 22, (198, 46, 46)),
        (0.70, 0.58, 22, (122, 58, 156)),
        (0.50, 0.60, 22, (222, 122, 34)),
        (0.42, 0.50, 22, (26, 122, 76)),
        (0.78, 0.70, 22, (24, 24, 28)),
    ]
    for fx, fy, r, col in balls:
        bx = tx0 + (tx1 - tx0) * fx
        by = ty0 + (ty1 - ty0) * fy
        td.ellipse([bx - r - 3, by - r + 2, bx + r + 3, by + r + 8], fill=(6, 24, 19, 190))
        td.ellipse([bx - r, by - r, bx + r, by + r], fill=col + (255,))
        td.ellipse([bx - r * 0.42, by - r * 0.62, bx - r * 0.02, by - r * 0.22],
                   fill=(255, 255, 255, 96))
    table = table.filter(ImageFilter.GaussianBlur(0.6))
    img = Image.alpha_composite(img.convert("RGBA"), table).convert("RGB")

    scrim = Image.new("L", (w, h), 0)
    sd = ImageDraw.Draw(scrim)
    for x in range(0, 980):
        sd.line([(x, 0), (x, h)], fill=int(232 * (1 - x / 980) ** 1.25))
    scrim = scrim.filter(ImageFilter.GaussianBlur(40))
    img = Image.composite(Image.new("RGB", (w, h), (10, 16, 20)), img, scrim)
    d = ImageDraw.Draw(img)

    tracked_text(d, (86, 92), "CUEISM  ·  ANALYSIS", seg(22, bold=True), (120, 190, 255), tracking=4.2)
    d.line([(88, 140), (268, 140)], fill=(120, 190, 255), width=3)
    d.text((84, 206), "Learn to", font=font("georgiab.ttf", 126), fill=(255, 255, 255))
    d.text((84, 336), "Lose First", font=font("georgiab.ttf", 126), fill=(255, 255, 255))
    d.text((88, 500), "Why losing properly is the most", font=seg(38, light=True), fill=(214, 226, 236))
    d.text((88, 552), "underrated skill in pool", font=seg(38, light=True), fill=(214, 226, 236))
    d.line([(88, 646), (700, 646)], fill=(70, 96, 92), width=2)
    d.text((88, 676), "Twelve competitions a week. Six losses a week, minimum.",
           font=seg(27), fill=(168, 186, 186))
    d.text((88, 716), "The players who last are not the best potters.",
           font=seg(27), fill=(168, 186, 186))

    save(img, "hero.png")


if __name__ == "__main__":
    figure_streaks()
    figure_loss_aversion()
    figure_objectives()
    hero()
