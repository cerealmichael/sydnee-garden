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
    plte = trns = b''
    while pos < len(d):
        ln = struct.unpack('>I', d[pos:pos + 4])[0]
        tag = d[pos + 4:pos + 8]
        body = d[pos + 8:pos + 8 + ln]
        if tag == b'IHDR':
            w, h, depth, ctype = struct.unpack('>IIBB', body[:10])
            assert depth == 8 and ctype in (2, 3, 6), f'{path}: nieobslugiwany format'
        elif tag == b'PLTE':
            plte = body
        elif tag == b'tRNS':
            trns = body
        elif tag == b'IDAT':
            idat += body
        elif tag == b'IEND':
            break
        pos += 12 + ln

    ch = {2: 3, 3: 1, 6: 4}[ctype]
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

    if ctype == 3:  # paleta -> RGBA
        out = bytearray(w * h * 4)
        for i, idx in enumerate(px):
            out[i * 4:i * 4 + 3] = plte[idx * 3:idx * 3 + 3]
            out[i * 4 + 3] = trns[idx] if idx < len(trns) else 255
        return w, h, 4, out

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


def _median_cut(hist, want):
    """hist: {(r,g,b,a): count} -> lista pudelek (kazde = lista kolorow)."""
    boxes = [list(hist.items())]
    while len(boxes) < want:
        # dziel pudelko o najwiekszym rozrzucie * liczbie pikseli
        best, best_score, best_ch = None, -1, 0
        for bi, box in enumerate(boxes):
            if len(box) < 2:
                continue
            n = sum(c for _, c in box)
            for ch in range(4):
                vals = [col[ch] for col, _ in box]
                score = (max(vals) - min(vals)) * n
                if score > best_score:
                    best, best_score, best_ch = bi, score, ch
        if best is None or best_score <= 0:
            break
        box = sorted(boxes[best], key=lambda kv: kv[0][best_ch])
        half, acc = sum(c for _, c in box) / 2, 0
        cut = 1
        for i, (_, c) in enumerate(box):
            acc += c
            if acc >= half:
                cut = min(max(i, 1), len(box) - 1)
                break
        boxes[best:best + 1] = [box[:cut], box[cut:]]
    return boxes


def write_png_indexed(path, w, h, rgba, colors=128):
    """Zapisuje PNG-8 z paleta + tRNS. Dla plaskich grafik ~5x mniejszy niz RGBA."""
    from collections import Counter

    hist = Counter()
    quant = bytearray(len(rgba))
    for o in range(0, len(rgba), 4):
        a = rgba[o + 3]
        if a < 8:
            key = (0, 0, 0, 0)
        else:
            # 6 bitow na kanal - mniej unikatow, szybsze mapowanie
            key = (rgba[o] & 0xFC, rgba[o + 1] & 0xFC, rgba[o + 2] & 0xFC, a & 0xFC)
        quant[o:o + 4] = bytes(key)
        hist[key] += 1

    transparent = hist.pop((0, 0, 0, 0), 0)
    want = colors - (1 if transparent else 0)
    palette = []
    for box in _median_cut(hist, want):
        if not box:
            continue
        n = sum(c for _, c in box)
        palette.append(tuple(
            min(255, sum(col[ch] * c for col, c in box) // n) for ch in range(4)))
    if transparent:
        palette.insert(0, (0, 0, 0, 0))

    cache = {}

    def index_of(key):
        i = cache.get(key)
        if i is None:
            if key[3] == 0:
                i = 0 if transparent else min(
                    range(len(palette)), key=lambda j: palette[j][3])
            else:
                start = 1 if transparent else 0
                i = min(range(start, len(palette)), key=lambda j: sum(
                    (palette[j][k] - key[k]) ** 2 * (3 if k == 3 else 1) for k in range(4)))
            cache[key] = i
        return i

    raw = bytearray()
    for y in range(h):
        raw.append(0)
        base = y * w * 4
        for x in range(w):
            o = base + x * 4
            raw.append(index_of(tuple(quant[o:o + 4])))

    def chunk(tag, data):
        return (struct.pack('>I', len(data)) + tag + data
                + struct.pack('>I', zlib.crc32(tag + data) & 0xFFFFFFFF))

    plte = b''.join(bytes(c[:3]) for c in palette)
    trns = bytes(c[3] for c in palette)
    blob = (b'\x89PNG\r\n\x1a\n'
            + chunk(b'IHDR', struct.pack('>IIBBBBB', w, h, 8, 3, 0, 0, 0))
            + chunk(b'PLTE', plte)
            + chunk(b'tRNS', trns)
            + chunk(b'IDAT', zlib.compress(bytes(raw), 9))
            + chunk(b'IEND', b''))
    open(path, 'wb').write(blob)
    return len(blob)
