import { useCallback, useEffect, useRef, useState } from 'react'
import { BRUSHES, PALETTE } from './palette'
import { addPoint, isEmpty, MAX_STROKES, type Stroke } from './strokes'
import s from './DrawPad.module.css'

type Props = {
  busy: boolean
  onClose: () => void
  onPlant: (strokes: Stroke[]) => void
}

export default function DrawPad({ busy, onClose, onPlant }: Props) {
  const wrapRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const strokesRef = useRef<Stroke[]>([])
  const drawingRef = useRef<Stroke | null>(null)
  const sizeRef = useRef(1)

  const [color, setColor] = useState<string>(PALETTE[0])
  const [brush, setBrush] = useState(1)
  const [empty, setEmpty] = useState(true)

  const redraw = useCallback(() => {
    const canvas = canvasRef.current
    const ctx = canvas?.getContext('2d')
    if (!canvas || !ctx) return
    const size = sizeRef.current
    ctx.clearRect(0, 0, size, size)
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'

    for (const stroke of strokesRef.current) {
      if (stroke.p.length < 2) continue
      ctx.strokeStyle = stroke.c
      ctx.lineWidth = stroke.w * size
      ctx.beginPath()
      ctx.moveTo(stroke.p[0] * size, stroke.p[1] * size)
      for (let i = 2; i < stroke.p.length; i += 2) {
        ctx.lineTo(stroke.p[i] * size, stroke.p[i + 1] * size)
      }
      if (stroke.p.length === 2) ctx.lineTo(stroke.p[0] * size, stroke.p[1] * size)
      ctx.stroke()
    }
  }, [])

  // rozmiar plotna
  useEffect(() => {
    const wrap = wrapRef.current
    const canvas = canvasRef.current
    if (!wrap || !canvas) return

    const apply = () => {
      const box = wrap.getBoundingClientRect()
      const size = Math.floor(Math.min(box.width, box.height))
      if (size < 2) return
      const dpr = Math.min(window.devicePixelRatio || 1, 3)
      sizeRef.current = size
      canvas.width = size * dpr
      canvas.height = size * dpr
      canvas.style.width = `${size}px`
      canvas.style.height = `${size}px`
      canvas.getContext('2d')?.setTransform(dpr, 0, 0, dpr, 0, 0)
      redraw()
    }

    apply()
    const ro = new ResizeObserver(apply)
    ro.observe(wrap)
    return () => ro.disconnect()
  }, [redraw])

  // rysowanie
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const at = (e: PointerEvent) => {
      const box = canvas.getBoundingClientRect()
      return { x: (e.clientX - box.left) / box.width, y: (e.clientY - box.top) / box.height }
    }

    const down = (e: PointerEvent) => {
      if (strokesRef.current.length >= MAX_STROKES) return
      canvas.setPointerCapture(e.pointerId)
      const { x, y } = at(e)
      const stroke: Stroke = { c: color, w: BRUSHES[brush], p: [] }
      addPoint(stroke, x, y)
      strokesRef.current.push(stroke)
      drawingRef.current = stroke
      redraw()
      setEmpty(false)
    }

    const move = (e: PointerEvent) => {
      const stroke = drawingRef.current
      if (!stroke) return
      e.preventDefault()
      const { x, y } = at(e)
      if (addPoint(stroke, x, y)) redraw()
    }

    const up = () => {
      drawingRef.current = null
      setEmpty(isEmpty(strokesRef.current))
    }

    canvas.addEventListener('pointerdown', down)
    canvas.addEventListener('pointermove', move, { passive: false })
    canvas.addEventListener('pointerup', up)
    canvas.addEventListener('pointercancel', up)
    return () => {
      canvas.removeEventListener('pointerdown', down)
      canvas.removeEventListener('pointermove', move)
      canvas.removeEventListener('pointerup', up)
      canvas.removeEventListener('pointercancel', up)
    }
  }, [color, brush, redraw])

  const undo = () => {
    strokesRef.current.pop()
    redraw()
    setEmpty(isEmpty(strokesRef.current))
  }

  const clear = () => {
    strokesRef.current = []
    redraw()
    setEmpty(true)
  }

  return (
    <div className={s.sheet}>
      <header className={s.head}>
        <h2 className={s.title}>Narysuj kwiatka</h2>
        <button className={s.close} onClick={onClose} aria-label="Zamknij">
          ✕
        </button>
      </header>

      <div className={s.padWrap} ref={wrapRef}>
        <canvas ref={canvasRef} className={s.pad} />
        {empty && <p className={s.hint}>Rysuj palcem 🌸</p>}
      </div>

      <div className={s.colors}>
        {PALETTE.map((c) => (
          <button
            key={c}
            className={c === color ? `${s.color} ${s.picked}` : s.color}
            style={{ background: c }}
            onClick={() => setColor(c)}
            aria-label={`Kolor ${c}`}
          />
        ))}
      </div>

      <div className={s.tools}>
        <div className={s.brushes}>
          {BRUSHES.map((b, i) => (
            <button
              key={b}
              className={i === brush ? `${s.brush} ${s.picked}` : s.brush}
              onClick={() => setBrush(i)}
              aria-label={`Grubość ${i + 1}`}
            >
              <span style={{ width: 6 + i * 7, height: 6 + i * 7, background: color }} />
            </button>
          ))}
        </div>
        <button className={s.tool} onClick={undo} disabled={empty}>
          Cofnij
        </button>
        <button className={s.tool} onClick={clear} disabled={empty}>
          Od nowa
        </button>
      </div>

      <button
        className={s.plant}
        disabled={empty || busy}
        onClick={() => onPlant(strokesRef.current)}
      >
        {busy ? 'Sadzę…' : 'Zasadź 🌱'}
      </button>
    </div>
  )
}
