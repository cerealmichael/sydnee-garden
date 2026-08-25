/**
 * Kwiatek trzymamy jako wektory, nie obrazek: kilka kresek, kazda to kolor,
 * grubosc i punkty znormalizowane do 0..1. Dzieki temu rekord w bazie ma
 * kilkaset bajtow i skaluje sie ostro na kazdym ekranie.
 */
export type Stroke = {
  /** kolor */
  c: string
  /** grubosc (ulamek boku) */
  w: number
  /** punkty [x0, y0, x1, y1, ...] */
  p: number[]
}

/** Punkty blizej niz tyle sa pomijane - mniej danych, ta sama kreska. */
const MIN_STEP = 0.006

export const MAX_STROKES = 80
export const NOTE_MAX = 140
export const MAX_POINTS = 1400

export function addPoint(stroke: Stroke, x: number, y: number) {
  const n = stroke.p.length
  if (n >= 2) {
    const dx = x - stroke.p[n - 2]
    const dy = y - stroke.p[n - 1]
    if (Math.hypot(dx, dy) < MIN_STEP) return false
  }
  if (stroke.p.length / 2 >= MAX_POINTS) return false
  stroke.p.push(round(x), round(y))
  return true
}

const round = (v: number) => Math.round(Math.min(Math.max(v, 0), 1) * 1000) / 1000

export const isEmpty = (strokes: Stroke[]) => strokes.every((s) => s.p.length < 2)

export const pointCount = (strokes: Stroke[]) =>
  strokes.reduce((sum, s) => sum + s.p.length / 2, 0)

/** Kropka (jedno tapniecie) tez ma byc widoczna - rysujemy ja jako punkt. */
export function toPolyline(stroke: Stroke) {
  const pts: string[] = []
  for (let i = 0; i < stroke.p.length; i += 2) pts.push(`${stroke.p[i]},${stroke.p[i + 1]}`)
  if (pts.length === 1) pts.push(pts[0])
  return pts.join(' ')
}
