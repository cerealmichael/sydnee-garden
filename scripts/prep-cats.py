#!/usr/bin/env python3
"""Przygotowuje grafiki kotkow do public/cats/.

Wejscie: PNG z czarnym tlem (albo juz z alfa). Wyjscie: PNG-8 z paleta i alfa,
tlo wyciete, marginesy przyciete, dluzszy bok przeskalowany do BOX.

  python3 scripts/prep-cats.py <plik.png>:<nazwa> [...]
  np. python3 scripts/prep-cats.py ~/Downloads/kot.png:sleepy

Potem dopisz nowa nazwe do src/lib/cats.ts.
"""
import os
import sys
from collections import deque

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from pngkit import read_png, resize_rgba, write_png_indexed  # noqa: E402

OUT = 'public/cats'
BOX = 448     # dluzszy bok wyniku (na iPhone wyswietlamy max ~140 px @3x)
COLORS = 128  # paleta - plaskie grafiki nic na tym nie traca
BG_MAX = 62   # kanal <= tyle => kandydat na tlo (kontur kotka ma ~91)


def cut_background(w, h, ch, px):
    """Flood fill od krawedzi po ciemnych pikselach -> alpha 0."""
    opaque = bytearray(b'\xff' * (w * h))
    q = deque()

    def dark(i):
        o = i * ch
        return px[o] <= BG_MAX and px[o + 1] <= BG_MAX and px[o + 2] <= BG_MAX

    edge = [x for x in range(w)] + [(h - 1) * w + x for x in range(w)]
    edge += [y * w for y in range(h)] + [y * w + w - 1 for y in range(h)]
    for i in edge:
        if opaque[i] and dark(i):
            opaque[i] = 0
            q.append(i)

    while q:
        i = q.popleft()
        x, y = i % w, i // w
        for nx, ny in ((x - 1, y), (x + 1, y), (x, y - 1), (x, y + 1)):
            if 0 <= nx < w and 0 <= ny < h:
                j = ny * w + nx
                if opaque[j] and dark(j):
                    opaque[j] = 0
                    q.append(j)
    return opaque


def bbox(w, h, opaque):
    x0, y0, x1, y1 = w, h, -1, -1
    for y in range(h):
        row = y * w
        for x in range(w):
            if opaque[row + x]:
                if x < x0: x0 = x
                if x > x1: x1 = x
                if y < y0: y0 = y
                if y > y1: y1 = y
    return x0, y0, x1 + 1, y1 + 1


def prep(src_path, name):
    w, h, ch, px = read_png(src_path)
    opaque = cut_background(w, h, ch, px)
    x0, y0, x1, y1 = bbox(w, h, opaque)
    cw, cht = x1 - x0, y1 - y0

    rgba = bytearray(cw * cht * 4)
    for y in range(cht):
        for x in range(cw):
            si = (y + y0) * w + (x + x0)
            so, do = si * ch, (y * cw + x) * 4
            rgba[do:do + 3] = px[so:so + 3]
            rgba[do + 3] = opaque[si] if ch == 3 else min(opaque[si], px[so + 3])

    scale = BOX / max(cw, cht)
    dw, dh = max(1, round(cw * scale)), max(1, round(cht * scale))
    small = resize_rgba(rgba, cw, cht, dw, dh)

    os.makedirs(OUT, exist_ok=True)
    size = write_png_indexed(f'{OUT}/{name}.png', dw, dh, small, COLORS)
    print(f'{name}.png  {dw}x{dh}  {size // 1024}kB')


if __name__ == '__main__':
    if len(sys.argv) < 2:
        print(__doc__)
        raise SystemExit(1)
    for arg in sys.argv[1:]:
        path, _, nm = arg.rpartition(':')
        prep(path, nm)
