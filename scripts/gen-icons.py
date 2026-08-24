#!/usr/bin/env python3
"""Generuje ikony PWA (kotek, PNG RGB) bez zewnetrznych zaleznosci."""
import struct, zlib, os, math

OUT = os.environ.get("ICON_OUT", "public/icons")

BG_TOP = (0xFF, 0xE4, 0xEF)
BG_BOT = (0xE7, 0xDD, 0xFF)
FUR = (0xAC, 0x9C, 0x90)
FUR_D = (0x8D, 0x7A, 0x6E)
INK = (0x5B, 0x40, 0x34)
NOSE = (0xF1, 0x9B, 0xB8)


def cap(px, py, ax, ay, bx, by, r):
    """punkt w kapsule (odcinek ax,ay -> bx,by o promieniu r)"""
    dx, dy = bx - ax, by - ay
    l2 = dx * dx + dy * dy
    t = 0.0 if l2 == 0 else max(0.0, min(1.0, ((px - ax) * dx + (py - ay) * dy) / l2))
    return math.hypot(px - (ax + t * dx), py - (ay + t * dy)) <= r


def ell(px, py, cx, cy, rx, ry, n=2.0):
    return (abs((px - cx) / rx) ** n + abs((py - cy) / ry) ** n) <= 1.0


def tri(px, py, p1, p2, p3):
    def s(a, b, c):
        return (a[0] - c[0]) * (b[1] - c[1]) - (b[0] - c[0]) * (a[1] - c[1])
    d1, d2, d3 = s((px, py), p1, p2), s((px, py), p2, p3), s((px, py), p3, p1)
    neg = d1 < 0 or d2 < 0 or d3 < 0
    pos = d1 > 0 or d2 > 0 or d3 > 0
    return not (neg and pos)


def cat_color(x, y):
    """zwraca kolor kotka albo None (tlo). x,y w [-1,1], y w gore."""
    # ogon
    if cap(x, y, 0.44, -0.34, 0.84, -0.14, 0.055):
        return FUR
    # wasy (poza sylwetka, zeby ich nie przycielo)
    for sgn in (-1, 1):
        for dy in (0.05, -0.03):
            if cap(x, y, sgn * 0.66, -0.02 + dy, sgn * 0.84, 0.01 + dy, 0.014):
                return FUR_D
    # uszy
    if tri(x, y, (-0.52, 0.20), (-0.60, 0.56), (-0.22, 0.36)):
        return FUR
    if tri(x, y, (0.52, 0.20), (0.60, 0.56), (0.22, 0.36)):
        return FUR
    # lapki
    if ell(x, y, -0.30, -0.50, 0.14, 0.07) or ell(x, y, 0.30, -0.50, 0.14, 0.07):
        return FUR
    # cialo / glowa (jedna bulka, jak Pusheen)
    if ell(x, y, 0.0, 0.0, 0.66, 0.46, 2.4):
        # paski
        for i, sy in enumerate((0.30, 0.20, 0.10)):
            if cap(x, y, -0.34 + i * 0.02, sy, -0.14 + i * 0.02, sy, 0.028):
                return FUR_D
        # nosek
        if ell(x, y, 0.0, -0.13, 0.04, 0.032):
            return NOSE
        # oczy
        if ell(x, y, -0.22, -0.04, 0.055, 0.075) or ell(x, y, 0.22, -0.04, 0.055, 0.075):
            return INK
        # buzka :3
        if cap(x, y, -0.07, -0.20, 0.0, -0.26, 0.022) or cap(x, y, 0.07, -0.20, 0.0, -0.26, 0.022):
            return INK
        return FUR
    return None


def render(size, zoom, rounded):
    ss = 3
    W = size * ss
    r = W * 0.235
    px = bytearray()
    for py in range(W):
        t = py / (W - 1)
        bg_row = tuple(int(BG_TOP[i] + (BG_BOT[i] - BG_TOP[i]) * t) for i in range(3))
        for pxx in range(W):
            c = bg_row
            if rounded:
                cx = min(max(pxx + 0.5, r), W - r)
                cy = min(max(py + 0.5, r), W - r)
                if math.hypot(pxx + 0.5 - cx, py + 0.5 - cy) > r:
                    c = (0xFF, 0xFF, 0xFF)
            x = (pxx + 0.5 - W / 2.0) / (W / 2.0) / zoom
            y = -(py + 0.5 - W / 2.0) / (W / 2.0) / zoom
            cc = cat_color(x, y)
            px += bytes(cc if cc else c)
    out = bytearray()
    for y in range(size):
        out.append(0)
        for x in range(size):
            acc = [0, 0, 0]
            for dy in range(ss):
                base = ((y * ss + dy) * W + x * ss) * 3
                for dx in range(ss):
                    o = base + dx * 3
                    acc[0] += px[o]; acc[1] += px[o + 1]; acc[2] += px[o + 2]
            n = ss * ss
            out += bytes((acc[0] // n, acc[1] // n, acc[2] // n))
    return bytes(out)


def png(path, size, zoom=0.86, rounded=True):
    raw = render(size, zoom, rounded)

    def chunk(tag, data):
        return (struct.pack(">I", len(data)) + tag + data
                + struct.pack(">I", zlib.crc32(tag + data) & 0xFFFFFFFF))

    ihdr = struct.pack(">IIBBBBB", size, size, 8, 2, 0, 0, 0)
    blob = (b"\x89PNG\r\n\x1a\n" + chunk(b"IHDR", ihdr)
            + chunk(b"IDAT", zlib.compress(raw, 9)) + chunk(b"IEND", b""))
    with open(path, "wb") as f:
        f.write(blob)
    print(path, f"{size}px", f"{len(blob) // 1024}kB")


os.makedirs(OUT, exist_ok=True)
png(f"{OUT}/apple-touch-icon.png", 180, 0.86, False)   # iOS zaokragla samo
png(f"{OUT}/icon-192.png", 192, 0.86, True)
png(f"{OUT}/icon-512.png", 512, 0.86, True)
png(f"{OUT}/icon-maskable-512.png", 512, 0.60, False)  # safe zone 80%
png(f"{OUT}/favicon-64.png", 64, 0.86, True)
