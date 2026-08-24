"""Mini-toolkit PNG (odczyt/zapis/skalowanie) w czystym Pythonie.

Uzywany przez prep-cats.py i gen-icons.py. Obsluguje 8-bit RGB i RGBA.
"""
import struct
import zlib


def read_png(path):
    """-> (w, h, channels, bytearray pikseli)"""
    d = open(path, 'rb').read()
    assert d[:8] == b'\x89PNG\r\n\x1a\n', f'{path}: to nie PNG'
    pos, idat = 8, bytearray()
    w = h = ctype = None
    while pos < len(d):
        ln = struct.unpack('>I', d[pos:pos + 4])[0]
        tag = d[pos + 4:pos + 8]
        body = d[pos + 8:pos + 8 + ln]
        if tag == b'IHDR':
            w, h, depth, ctype = struct.unpack('>IIBB', body[:10])
            assert depth == 8 and ctype in (2, 6), f'{path}: nieobslugiwany format'
        elif tag == b'IDAT':
            idat += body
        elif tag == b'IEND':
            break
        pos += 12 + ln

    ch = 3 if ctype == 2 else 4
    raw = zlib.decompress(bytes(idat))
    px = bytearray(w * h * ch)
    prev = bytearray(w * ch)
    p = 0
    for y in range(h):
        f = raw[p]; p += 1
        line = bytearray(raw[p:p + w * ch]); p += w * ch
        if f:
            for i in range(len(line)):
                a = line[i - ch] if i >= ch else 0
                b = prev[i]
                c = prev[i - ch] if i >= ch else 0
                if f == 1:
                    line[i] = (line[i] + a) & 0xFF
                elif f == 2:
                    line[i] = (line[i] + b) & 0xFF
                elif f == 3:
                    line[i] = (line[i] + (a + b) // 2) & 0xFF
                else:
                    pp = a + b - c
                    pa, pb, pc = abs(pp - a), abs(pp - b), abs(pp - c)
                    pr = a if (pa <= pb and pa <= pc) else (b if pb <= pc else c)
                    line[i] = (line[i] + pr) & 0xFF
        px[y * w * ch:(y + 1) * w * ch] = line
        prev = line
    return w, h, ch, px


def write_png(path, w, h, px, ch=4):
    raw = bytearray()
    for y in range(h):
        raw.append(0)
        raw += px[y * w * ch:(y + 1) * w * ch]

    def chunk(tag, data):
        return (struct.pack('>I', len(data)) + tag + data
                + struct.pack('>I', zlib.crc32(tag + data) & 0xFFFFFFFF))

    blob = (b'\x89PNG\r\n\x1a\n'
            + chunk(b'IHDR', struct.pack('>IIBBBBB', w, h, 8, 6 if ch == 4 else 2, 0, 0, 0))
            + chunk(b'IDAT', zlib.compress(bytes(raw), 9))
            + chunk(b'IEND', b''))
    open(path, 'wb').write(blob)
    return len(blob)


def resize_rgba(src, sw, sh, dw, dh):
    """Box filter, srednia wazona alfa (zeby nie ciemnialy brzegi)."""
    out = bytearray(dw * dh * 4)
    for dy in range(dh):
        sy0, sy1 = dy * sh // dh, max(dy * sh // dh + 1, (dy + 1) * sh // dh)
        for dx in range(dw):
            sx0, sx1 = dx * sw // dw, max(dx * sw // dw + 1, (dx + 1) * sw // dw)
            r = g = b = a = n = 0
            for sy in range(sy0, sy1):
                base = (sy * sw + sx0) * 4
                for k in range(sx1 - sx0):
                    o = base + k * 4
                    av = src[o + 3]
                    r += src[o] * av; g += src[o + 1] * av; b += src[o + 2] * av
                    a += av; n += 1
            o = (dy * dw + dx) * 4
            if a:
                out[o] = r // a; out[o + 1] = g // a; out[o + 2] = b // a
            out[o + 3] = a // n
    return out
