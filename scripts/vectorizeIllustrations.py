#!/usr/bin/env python3
"""Vectorize the spot illustrations (public/library/illustrations/<id>.webp)
into themeable SVGs next to them (<id>.svg).

Needs (none of them is a project dependency, this is a one-off tool):
  - the `vtracer` CLI on PATH (https://github.com/visioncortex/vtracer)
  - Pillow (`pip install pillow`) and Node's `npx svgo`

What it does: flattens the transparent WebP on white, traces it with vtracer,
drops the white backdrop path, turns the pink accent shades (the #EC4899
family; darker burgundy clothes are kept) into `fill="currentColor"` so the
page can recolor them per theme, and minifies with svgo (viewBox 0 0 800 600).

Usage: python3 scripts/vectorizeIllustrations.py [id ...]
"""
import colorsys
import re
import subprocess
import sys
import tempfile
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
DIR = ROOT / 'public' / 'library' / 'illustrations'
# vtracer color precision / speckle filter / gradient step per illustration,
# tuned so each file stays under the 40 KB budget of docs/backgrounds-brief.md.
SETTINGS = {
    'empty-lesson': (7, 5, 14),
    'course-complete': (7, 5, 14),
    'welcome': (7, 8, 18),
    'unsupported': (7, 5, 14),
}


def is_accent(hex_color: str) -> bool:
    r, g, b = (int(hex_color[i:i + 2], 16) / 255 for i in (1, 3, 5))
    h, s, v = colorsys.rgb_to_hsv(r, g, b)
    return 0.88 <= h <= 0.97 and s > 0.4 and v > 0.68


def vectorize(name: str) -> None:
    from PIL import Image  # imported late so --help style errors stay readable

    precision, speckle, gradient = SETTINGS[name]
    im = Image.open(DIR / f'{name}.webp').convert('RGBA').resize((800, 600), Image.LANCZOS)
    flat = Image.new('RGB', im.size, (255, 255, 255))
    flat.paste(im, mask=im.split()[3])
    with tempfile.TemporaryDirectory() as tmp:
        png, raw, pre = Path(tmp) / 'in.png', Path(tmp) / 'raw.svg', Path(tmp) / 'pre.svg'
        flat.save(png)
        subprocess.run(
            ['vtracer', '-i', str(png), '-o', str(raw), '--colormode', 'color', '--hierarchical', 'stacked',
             '-m', 'spline', '-p', str(precision), '-f', str(speckle), '-g', str(gradient), '-c', '60',
             '-l', '5', '-s', '45', '--path_precision', '1'],
            check=True, capture_output=True)
        paths, dropped_backdrop = [], False
        for p in re.findall(r'<path [^>]*/>', raw.read_text()):
            fill = re.search(r'fill="(#[0-9A-Fa-f]{6})"', p).group(1)
            if not dropped_backdrop and min(int(fill[i:i + 2], 16) for i in (1, 3, 5)) >= 248:
                dropped_backdrop = True  # the first near-white full-canvas path is the flattening backdrop
                continue
            if is_accent(fill):
                p = p.replace(f'fill="{fill}"', 'fill="currentColor"')
            paths.append(p)
        pre.write_text(f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 600">{"".join(paths)}</svg>')
        out = DIR / f'{name}.svg'
        subprocess.run(['npx', '--yes', 'svgo', '--multipass', '-p', '1', '-i', str(pre), '-o', str(out)],
                       check=True, capture_output=True)
    print(f'{name}.svg: {out.stat().st_size // 1024} KB')


if __name__ == '__main__':
    for name in sys.argv[1:] or SETTINGS:
        vectorize(name)
