import { useCallback, useEffect, useRef, useState } from 'react'
import { MergeEngine } from './engine'
import { loadCats, type CatImages } from './images'
import { LEVELS, randomLevel } from './levels'
import { drawBoard, type Sparkle } from './render'

const BEST_KEY = 'merge:best'
const COOLDOWN = 380

const readBest = () => {
  try {
    return Number(localStorage.getItem(BEST_KEY)) || 0
  } catch {
    return 0
  }
}

const newQueue = () => [randomLevel(), randomLevel(), randomLevel()]

export function useMergeGame() {
  const wrapRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const gameRef = useRef<MergeEngine | null>(null)
  const imagesRef = useRef<CatImages>({})
  const aimRef = useRef<number | null>(null)
  const readyRef = useRef(true)
  const sparklesRef = useRef<Sparkle[]>([])
  const queueRef = useRef<number[]>(newQueue())

  const [queue, setQueue] = useState(queueRef.current)
  const [score, setScore] = useState(0)
  const [best, setBest] = useState(readBest)
  const [over, setOver] = useState(false)
  const [loaded, setLoaded] = useState(false)

  // silnik + grafiki: raz na cale zycie ekranu
  useEffect(() => {
    gameRef.current = new MergeEngine({
      onScore: (points) => setScore((s) => s + points),
      onPop: (x, y, _level, top) =>
        sparklesRef.current.push({ x, y, born: performance.now(), top }),
      onGameOver: () => setOver(true),
    })
    loadCats(LEVELS.map((l) => l.cat)).then((imgs) => {
      imagesRef.current = imgs
      setLoaded(true)
    })
  }, [])

  // rozmiar planszy (uwaga: pasek Safari potrafi zmieniac wysokosc w locie)
  useEffect(() => {
    const wrap = wrapRef.current
    const canvas = canvasRef.current
    if (!wrap || !canvas) return

    const apply = () => {
      const { width, height } = wrap.getBoundingClientRect()
      if (width < 2 || height < 2) return
      const dpr = Math.min(window.devicePixelRatio || 1, 3)
      canvas.width = Math.round(width * dpr)
      canvas.height = Math.round(height * dpr)
      canvas.style.width = `${width}px`
      canvas.style.height = `${height}px`
      canvas.getContext('2d')?.setTransform(dpr, 0, 0, dpr, 0, 0)
      gameRef.current?.resize(width, height)
    }

    apply()
    const ro = new ResizeObserver(apply)
    ro.observe(wrap)
    return () => ro.disconnect()
  }, [])

  // petla
  useEffect(() => {
    if (!loaded) return
    const canvas = canvasRef.current
    const ctx = canvas?.getContext('2d')
    if (!ctx) return

    let raf = 0
    let last = performance.now()

    const frame = (now: number) => {
      const game = gameRef.current
      if (game) {
        game.step(Math.min(now - last, 60))
        sparklesRef.current = sparklesRef.current.filter((s) => now - s.born < 1000)
        drawBoard(ctx, game, imagesRef.current, {
          aimX: aimRef.current,
          nextLevel: queueRef.current[0],
          sparkles: sparklesRef.current,
          now,
          ready: readyRef.current && !game.over,
        })
      }
      last = now
      raf = requestAnimationFrame(frame)
    }

    raf = requestAnimationFrame(frame)
    return () => cancelAnimationFrame(raf)
  }, [loaded])

  // dotyk
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const localX = (e: PointerEvent) => e.clientX - canvas.getBoundingClientRect().left

    const down = (e: PointerEvent) => {
      if (gameRef.current?.over) return
      canvas.setPointerCapture(e.pointerId)
      aimRef.current = localX(e)
    }

    const move = (e: PointerEvent) => {
      if (aimRef.current === null) return
      e.preventDefault()
      aimRef.current = localX(e)
    }

    const up = (e: PointerEvent) => {
      const game = gameRef.current
      if (aimRef.current === null || !game || game.over) {
        aimRef.current = null
        return
      }
      const x = localX(e)
      aimRef.current = null
      if (!readyRef.current) return

      game.drop(queueRef.current[0], x)
      queueRef.current = [...queueRef.current.slice(1), randomLevel()]
      setQueue(queueRef.current)

      readyRef.current = false
      window.setTimeout(() => {
        readyRef.current = true
      }, COOLDOWN)
    }

    const cancel = () => {
      aimRef.current = null
    }

    canvas.addEventListener('pointerdown', down)
    canvas.addEventListener('pointermove', move, { passive: false })
    canvas.addEventListener('pointerup', up)
    canvas.addEventListener('pointercancel', cancel)
    return () => {
      canvas.removeEventListener('pointerdown', down)
      canvas.removeEventListener('pointermove', move)
      canvas.removeEventListener('pointerup', up)
      canvas.removeEventListener('pointercancel', cancel)
    }
  }, [])

  // rekord
  useEffect(() => {
    if (!over || score <= best) return
    setBest(score)
    try {
      localStorage.setItem(BEST_KEY, String(score))
    } catch {
      /* prywatne okno - trudno */
    }
  }, [over, score, best])

  const restart = useCallback(() => {
    gameRef.current?.reset()
    queueRef.current = newQueue()
    sparklesRef.current = []
    readyRef.current = true
    aimRef.current = null
    setQueue(queueRef.current)
    setScore(0)
    setOver(false)
  }, [])

  return { wrapRef, canvasRef, queue, score, best, over, loaded, restart }
}
