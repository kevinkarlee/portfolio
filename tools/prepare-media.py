#!/usr/bin/env python3
"""
One-off helper: turn the raw phone photos and certificate images dropped in
the repository root into
web-sized, correctly-oriented JPEGs under assets/img/.

The site itself is still 100% static - this only exists so the originals never
have to be committed or served at full resolution.

    python tools/prepare-media.py

Requires Pillow:  pip install Pillow
"""

from pathlib import Path
from PIL import Image, ImageOps

ROOT = Path(__file__).resolve().parent.parent
OUT_GENEVA = ROOT / "assets" / "img" / "geneva"
OUT_CERTS = ROOT / "assets" / "img" / "certs"

# source filename -> (output path, max width on the long edge)
JOBS = {
    # --- Geneva / UNITAR photographs -------------------------------------
    "WhatsApp Image 2026-09-10 at 18.38.44.jpeg":
        (OUT_GENEVA / "un-certificate.jpg", 1500),
    "WhatsApp Image 2026-09-10 at 18.38.44 (1).jpeg":
        (OUT_GENEVA / "team.jpg", 1500),
    "WhatsApp Image 2026-09-10 at 18.39.06.jpeg":
        (OUT_GENEVA / "allee-des-nations.jpg", 1800),
    "WhatsApp Image 2026-09-10 at 18.38.44 (2).jpeg":
        (OUT_GENEVA / "flags-portrait.jpg", 1200),

    # --- Trading certifications ------------------------------------------
    "passed-ftmo-challenge (1).jpeg":
        (OUT_CERTS / "ftmo-challenge.jpg", 1000),
    "passed-verification (1).jpeg":
        (OUT_CERTS / "ftmo-verification.jpg", 1000),
    "WhatsApp Image 2026-09-10 at 18.48.38 (1).jpeg":
        (OUT_CERTS / "fundednext-elite-200k.jpg", 1200),
    "WhatsApp Image 2026-09-10 at 18.48.37 (1).jpeg":
        (OUT_CERTS / "fundednext-crown.jpg", 1200),
}


def main() -> None:
    OUT_GENEVA.mkdir(parents=True, exist_ok=True)
    OUT_CERTS.mkdir(parents=True, exist_ok=True)

    for source_name, (target, max_edge) in JOBS.items():
        source = ROOT / source_name
        if not source.exists():
            print(f"skip (not found): {source_name}")
            continue

        with Image.open(source) as img:
            # Phone photos carry an EXIF rotation flag that browsers honour
            # inconsistently - bake the rotation into the pixels instead.
            img = ImageOps.exif_transpose(img).convert("RGB")
            img.thumbnail((max_edge, max_edge), Image.LANCZOS)
            img.save(target, "JPEG", quality=82, optimize=True, progressive=True)

        kb = target.stat().st_size / 1024
        print(f"{target.relative_to(ROOT)}  {img.size[0]}x{img.size[1]}  {kb:.0f} KB")


if __name__ == "__main__":
    main()
