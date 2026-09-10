#!/usr/bin/env python3
"""
Regenerate assets/img/og-image.png - the 1200x630 preview card used by
LinkedIn, Slack, X and iMessage when the site URL is shared.

This is a build-time convenience only: the site itself stays 100% static and
does NOT need Python to run. Re-run it only if you change the name or title.

    python tools/make-og-image.py

Requires Pillow:  pip install Pillow
"""

from pathlib import Path
from PIL import Image, ImageDraw, ImageFont

# --- Content -----------------------------------------------------------------
NAME = "Koessi Kevin Zokpodo"
TITLE = "MFE, Africa Business School \u2014 UM6P"
TITLE2 = "MBA Business Analytics \u2014 JGBS"
PITCH = "Derivatives pricing \u00b7 Stochastic control \u00b7 Systematic trading"
EYEBROW = "QUANTITATIVE FINANCE PORTFOLIO"
CREDENTIAL = "1st place \u2014 UNITAR, Geneva 2025"

# --- Palette (matches assets/css/style.css dark tokens) ----------------------
BG = (13, 22, 38)
SURFACE_LINE = (36, 52, 79)
ACCENT = (111, 159, 216)
WHITE = (238, 242, 248)
MUTED = (135, 148, 169)

W, H = 1200, 630
OUT = Path(__file__).resolve().parent.parent / "assets" / "img" / "og-image.png"

# Windows ships Segoe UI; fall back to Pillow's bundled DejaVu elsewhere.
FONT_CANDIDATES = {
    "bold": ["C:/Windows/Fonts/segoeuib.ttf", "DejaVuSans-Bold.ttf"],
    "regular": ["C:/Windows/Fonts/segoeui.ttf", "DejaVuSans.ttf"],
    "mono": ["C:/Windows/Fonts/consola.ttf", "DejaVuSansMono.ttf"],
}


def load_font(kind: str, size: int) -> ImageFont.FreeTypeFont:
    """First font that actually loads wins; last resort is the bitmap default."""
    for path in FONT_CANDIDATES[kind]:
        try:
            return ImageFont.truetype(path, size)
        except OSError:
            continue
    return ImageFont.load_default()


def main() -> None:
    img = Image.new("RGB", (W, H), BG)
    draw = ImageDraw.Draw(img)

    # Faint terminal grid, fading out toward the bottom-left.
    for x in range(0, W, 60):
        draw.line([(x, 0), (x, H)], fill=SURFACE_LINE, width=1)
    for y in range(0, H, 60):
        draw.line([(0, y), (W, y)], fill=SURFACE_LINE, width=1)

    # Mask the grid with a soft vertical gradient so text stays legible.
    veil = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    veil_draw = ImageDraw.Draw(veil)
    for y in range(H):
        alpha = int(235 * (1 - y / H) ** 0.5)
        veil_draw.line([(0, y), (W, y)], fill=BG + (alpha,))
    img = Image.alpha_composite(img.convert("RGBA"), veil).convert("RGB")
    draw = ImageDraw.Draw(img)

    left = 84
    draw.text((left, 96), EYEBROW, font=load_font("mono", 22), fill=ACCENT)

    # Accent rule under the eyebrow
    draw.rectangle([left, 142, left + 96, 146], fill=ACCENT)

    draw.text((left, 186), NAME, font=load_font("bold", 66), fill=WHITE)
    draw.text((left, 282), TITLE, font=load_font("regular", 31), fill=(183, 194, 212))
    draw.text((left, 326), TITLE2, font=load_font("regular", 31), fill=(183, 194, 212))
    draw.text((left, 392), PITCH, font=load_font("mono", 22), fill=MUTED)

    # Award pill - the single most differentiating line on the card
    pill_font = load_font("mono", 21)
    pill_box = draw.textbbox((0, 0), CREDENTIAL, font=pill_font)
    pill_w = pill_box[2] - pill_box[0] + 40
    draw.rounded_rectangle(
        [left, 444, left + pill_w, 494], radius=25,
        fill=(26, 44, 71), outline=ACCENT, width=1,
    )
    draw.text((left + 20, 456), CREDENTIAL, font=pill_font, fill=ACCENT)

    # A minimal equity-curve motif in the lower right - signals "quant"
    # without turning the card into a dashboard.
    pts = [0.0, 0.18, 0.10, 0.32, 0.27, 0.46, 0.58, 0.52, 0.74, 0.88, 1.0]
    x0, x1, base, height = 700, 1116, 540, 130
    curve = [
        (x0 + (x1 - x0) * i / (len(pts) - 1), base - height * v)
        for i, v in enumerate(pts)
    ]
    draw.line(curve, fill=ACCENT, width=4, joint="curve")
    draw.line([(x0, base + 14), (x1, base + 14)], fill=SURFACE_LINE, width=2)

    # Bottom accent bar
    draw.rectangle([0, H - 8, W, H], fill=ACCENT)

    OUT.parent.mkdir(parents=True, exist_ok=True)
    img.save(OUT, "PNG", optimize=True)
    print(f"wrote {OUT} ({OUT.stat().st_size / 1024:.1f} KB)")


if __name__ == "__main__":
    main()
