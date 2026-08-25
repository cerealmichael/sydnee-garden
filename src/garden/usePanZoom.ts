import { useCallback, useEffect, useRef, useState } from 'react'

export type View = { scale: number; x: number; y: number }

const MAX_ZOOM = 3.5
/** ruch wiekszy niz tyle px = przeciaganie, a nie tapniecie w kwiatka */
const TAP_SLOP = 8

type Args = {
  /** rozmiar swiata w px przy scale = 1 */
  world: { w: number; h: number }
}

/**
 * Przesuwanie jednym palcem i szczypanie dwoma. Trzymamy transform w refie
 * i wpisujemy go prosto do stylu - React nie przerysowuje sie 60 razy na sekunde.
 */
export function usePanZoom({ world }: Args) {
  const viewportRef = useRef<HTMLDivElement>(null)
  const worldRef = useRef<HTMLDivElement>(null)
  const viewRef = useRef<View>({ scale: 1, x: 0, y: 0 })
  const pointers = useRef(new Map<number, { x: number; y: number }>())
  const startRef = useRef<{ dist: number; scale: number; cx: number; cy: number } | null>(null)
  const movedRef = useRef(0)
  const [ready, setReady] = useState(false)

  const apply = useCallback(() => {
    const el = worldRef.current
    if (!el) return
    const { scale, x, y } = viewRef.current
    el.style.transform = `translate(${x}px, ${y}px) scale(${scale})`
  }, [])

  /** dopasowanie calej laki do ekranu */
  const fit = useCallback(() => {
    const vp = viewportRef.current
    if (!vp || !world.w || !world.h) return
    const box = vp.getBoundingClientRect()
    const scale = Math.min(box.width / world.w, box.height / world.h)
    viewRef.current = {
      scale,
      x: (box.width - world.w * scale) / 2,
      y: (box.height - world.h * scale) / 2,
    }
    apply()
    setReady(true)
  }, [apply, world.w, world.h])

  useEffect(() => {
    fit()
    const vp = viewportRef.current
    if (!vp) return
    const ro = new ResizeObserver(fit)
    ro.observe(vp)
    return () => ro.disconnect()
  }, [fit])

  const clamp = useCallback(() => {
    const vp = viewportRef.current
    if (!vp) return
    const box = vp.getBoundingClientRect()
    const v = viewRef.current
    const minScale = Math.min(box.width / world.w, box.height / world.h)
    v.scale = Math.min(Math.max(v.scale, minScale), minScale * MAX_ZOOM)

    const w = world.w * v.scale
    const h = world.h * v.scale
    // mniejszy wymiar wysrodkowujemy, wiekszy trzymamy w granicach
    v.x = w <= box.width ? (box.width - w) / 2 : Math.min(0, Math.max(box.width - w, v.x))
    v.y = h <= box.height ? (box.height - h) / 2 : Math.min(0, Math.max(box.height - h, v.y))
  }, [world.w, world.h])

  useEffect(() => {
    const vp = viewportRef.current
    if (!vp) return

    const mid = () => {
      const list = [...pointers.current.values()]
      const cx = list.reduce((a, p) => a + p.x, 0) / list.length
      const cy = list.reduce((a, p) => a + p.y, 0) / list.length
      const dist =
        list.length > 1 ? Math.hypot(list[0].x - list[1].x, list[0].y - list[1].y) : 0
      return { cx, cy, dist }
    }

    const down = (e: PointerEvent) => {
      pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY })
      movedRef.current = 0
      const m = mid()
      startRef.current = { dist: m.dist, scale: viewRef.current.scale, cx: m.cx, cy: m.cy }
    }

    const move = (e: PointerEvent) => {
      if (!pointers.current.has(e.pointerId)) return
      const prev = mid()
      pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY })
      const now = mid()
      const start = startRef.current
      if (!start) return
      e.preventDefault()

      const v = viewRef.current
      movedRef.current += Math.hypot(now.cx - prev.cx, now.cy - prev.cy)

      // szczypanie: skalujemy wokol srodka miedzy palcami
      if (pointers.current.size > 1 && prev.dist > 0 && now.dist > 0) {
        const next = (v.scale * now.dist) / prev.dist
        const box = vp.getBoundingClientRect()
        const ox = now.cx - box.left
        const oy = now.cy - box.top
        v.x = ox - ((ox - v.x) * next) / v.scale
        v.y = oy - ((oy - v.y) * next) / v.scale
        v.scale = next
        movedRef.current += 100
      }

      v.x += now.cx - prev.cx
      v.y += now.cy - prev.cy
      clamp()
      apply()
    }

    const up = (e: PointerEvent) => {
      pointers.current.delete(e.pointerId)
      startRef.current = pointers.current.size ? { ...mid(), scale: viewRef.current.scale } : null
      clamp()
      apply()
    }

    vp.addEventListener('pointerdown', down)
    vp.addEventListener('pointermove', move, { passive: false })
    vp.addEventListener('pointerup', up)
    vp.addEventListener('pointercancel', up)
    return () => {
      vp.removeEventListener('pointerdown', down)
      vp.removeEventListener('pointermove', move)
      vp.removeEventListener('pointerup', up)
      vp.removeEventListener('pointercancel', up)
    }
  }, [apply, clamp])

  /** czy ostatni gest byl tapnieciem (a nie przeciaganiem laki) */
  const wasTap = () => movedRef.current < TAP_SLOP

  return { viewportRef, worldRef, fit, wasTap, ready }
}
