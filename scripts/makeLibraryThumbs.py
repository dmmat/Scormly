#!/usr/bin/env python3
"""Small round-avatar pictures of the library characters:
public/library/characters/<id>/thumb.webp (96x96, from neutral.webp).

The landing's chat demo and the library picker show a character in a 22-48 px
circle, so they use these instead of the 512x512 portraits. Run after adding
or redrawing a character. Needs Pillow (`pip install pillow`).

Usage: python3 scripts/makeLibraryThumbs.py
"""
from pathlib import Path

from PIL import Image

ROOT = Path(__file__).resolve().parent.parent
SIZE = 96

for character in sorted((ROOT / 'public' / 'library' / 'characters').iterdir()):
    source = character / 'neutral.webp'
    if not source.exists():
        continue
    image = Image.open(source).convert('RGBA').resize((SIZE, SIZE), Image.LANCZOS)
    out = character / 'thumb.webp'
    image.save(out, 'WEBP', quality=82, method=6)
    print(f'{character.name}: {out.stat().st_size} bytes')
