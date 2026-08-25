import type { Flower } from './api'

/**
 * Elipsa trawy w ukladzie 0..1 (musi zgadzac sie z <ellipse> w Meadow.tsx,
 * ktore rysujemy z preserveAspectRatio="none", wiec mapowanie jest liniowe).
 */
const GRASS = { cx: 0.5, cy: 0.553, rx: 0.47, ry: 0.355 }
/** Margines, zeby kwiatek nie zwisal z krawedzi. */
const INSET = 0.82
const TRIES = 24

/**
 * Szuka wolnego miejsca na trawie: losuje kilku kandydatow wewnatrz elipsy
 * i bierze tego, ktory jest najdalej od juz zasadzonych kwiatkow. Pozycja
 * zapisuje sie razem z kwiatkiem, wiec potem juz sie nie rusza.
 */
export function freeSpot(flowers: Flower[]) {
  let best = { x: GRASS.cx, y: GRASS.cy }
  let bestDist = -1

  for (let i = 0; i < TRIES; i++) {
    // rownomiernie po powierzchni elipsy
    const angle = Math.random() * Math.PI * 2
    const radius = Math.sqrt(Math.random()) * INSET
    const x = GRASS.cx + Math.cos(angle) * radius * GRASS.rx
    const y = GRASS.cy + Math.sin(angle) * radius * GRASS.ry

    let nearest = Infinity
    for (const f of flowers) {
      // pion wazymy mocniej - laka jest w rzucie skosnym
      const d = Math.hypot(f.x - x, (f.y - y) * 1.8)
      if (d < nearest) nearest = d
    }

    if (nearest > bestDist) {
      bestDist = nearest
      best = { x, y }
    }
  }

  return best
}
