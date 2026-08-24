#!/usr/bin/env python3
"""Sklada ikony PWA: kotek z public/cats/ na pastelowym tle.

  python3 scripts/gen-icons.py [nazwa-kotka]   # domyslnie: classic
"""
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from pngkit import read_png, resize_rgba, write_png  # noqa: E402

OUT = 'public/icons'
BG_TOP = (0xFF, 0xE4, 0xEF)
BG_BOT = (0xE7, 0xDD, 0xFF)


def icon(path, size, cat, cw, chh, fill):
    """fill = jaka czesc krotszego boku ma zajac kotek"""
    scale = size * fill / max(cw, chh)
    dw, dh = max(1, round(cw * scale)), max(1, round(chh * scale))
    small = resize_rgba(cat, cw, chh, dw, dh)
    ox, oy = (size - dw) // 2, (size - dh) // 2

    out = bytearray(size * size * 4)
    for y in range(size):
        t = y / (size - 1)
        bg = tuple(int(BG_TOP[i] + (BG_BOT[i] - BG_TOP[i]) * t) for i in range(3))
        for x in range(size):
            o = (y * size + x) * 4
            out[o:o + 3] = bytes(bg)
            out[o + 3] = 255
            sx, sy = x - ox, y - oy
            if 0 <= sx < dw and 0 <= sy < dh:
                so = (sy * dw + sx) * 4
                a = small[so + 3]
                if a:
                    for i in range(3):
                        out[o + i] = (small[so + i] * a + out[o + i] * (255 - a)) // 255

    size_b = write_png(path, size, size, out)
    print(f'{path}  {size}px  {size_b // 1024}kB')


name = sys.argv[1] if len(sys.argv) > 1 else 'classic'
cw, chh, ch, px = read_png(f'public/cats/{name}.png')
assert ch == 4, 'kotek musi miec alfe (przepusc przez prep-cats.py)'

os.makedirs(OUT, exist_ok=True)
icon(f'{OUT}/apple-touch-icon.png', 180, px, cw, chh, 0.80)
icon(f'{OUT}/icon-192.png', 192, px, cw, chh, 0.80)
icon(f'{OUT}/icon-512.png', 512, px, cw, chh, 0.80)
icon(f'{OUT}/icon-maskable-512.png', 512, px, cw, chh, 0.58)  # safe zone 80%
icon(f'{OUT}/favicon-64.png', 64, px, cw, chh, 0.86)
