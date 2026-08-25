import { LEVELS } from './levels'
import type { CatImages } from './images'
import type { MergeEngine } from './engine'

export type Sparkle = { x: number; y: number; born: number; top: boolean }

const BOARD = '#FFF9F2'
const GRID = '#FDEEDD'
const DANGER = '#F2A7BE'

function drawCat(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  x: number,
  y: number,
  r: number,
  angle: number,
  pop: number,
) {
  // pop: 0..1, swiezo polaczony kotek robi "blup"
  const scale = 1 + 0.18 * pop
  const d = r * 2 * 1.08 * scale
  const k = d / Math.max(img.width, img.height)
  const w = img.width * k
  const h = img.height * k

  ctx.save()
  ctx.translate(x, y)
  ctx.rotate(angle)
  ctx.drawImage(img, -w / 2, -h / 2, w, h)
  ctx.restore()
}

export function drawBoard(
  ctx: CanvasRenderingContext2D,
  game: MergeEngine,
  images: CatImages,
  opts: {
    aimX: number | null
    nextLevel: number
    sparkles: Sparkle[]
    now: number
    ready: boolean
  },
) {
  const { w, h, dangerY } = game
  ctx.clearRect(0, 0, w, h)

  // tlo planszy w kratke
  ctx.fillStyle = BOARD
  ctx.fillRect(0, 0, w, h)
  ctx.fillStyle = GRID
  const cell = w / 8
  for (let row = 0; row * cell < h; row++) {
    for (let col = 0; col < 8; col++) {
      if ((row + col) % 2 === 0) continue
      ctx.fillRect(col * cell, row * cell, cell, cell)
    }
  }

  // linia przegranej
  ctx.save()
  ctx.strokeStyle = DANGER
  ctx.lineWidth = 3
  ctx.setLineDash([10, 9])
  ctx.beginPath()
  ctx.moveTo(0, dangerY)
  ctx.lineTo(w, dangerY)
  ctx.stroke()
  ctx.restore()

  // celownik + podglad tego, co spadnie
  if (opts.aimX !== null && opts.ready) {
    const r = game.radius(opts.nextLevel)
    const x = Math.min(Math.max(opts.aimX, r + 2), w - r - 2)

    ctx.save()
    ctx.strokeStyle = 'rgba(120, 106, 140, 0.35)'
    ctx.lineWidth = 2
    ctx.setLineDash([3, 10])
    ctx.beginPath()
    ctx.moveTo(x, dangerY)
    ctx.lineTo(x, h)
    ctx.stroke()
    ctx.restore()

    const img = images[LEVELS[opts.nextLevel].cat]
    if (img) {
      ctx.globalAlpha = 0.9
      drawCat(ctx, img, x, dangerY - r - 8, r, 0, 0)
      ctx.globalAlpha = 1
    }
  }

  // kotki
  for (const cat of game.cats) {
    const img = images[LEVELS[cat.plugin.level].cat]
    if (!img) continue
    if (cat.plugin.pop > 0) cat.plugin.pop = Math.max(0, cat.plugin.pop - 0.08)
    drawCat(
      ctx,
      img,
      cat.position.x,
      cat.position.y,
      game.radius(cat.plugin.level),
      cat.angle,
      cat.plugin.pop,
    )
  }

  // iskierki po polaczeniu
  for (const s of opts.sparkles) {
    const t = (opts.now - s.born) / (s.top ? 900 : 450)
    if (t >= 1) continue
    const rings = s.top ? 3 : 1
    for (let i = 0; i < rings; i++) {
      const tt = Math.max(0, t - i * 0.15)
      if (tt >= 1) continue
      ctx.save()
      ctx.globalAlpha = (1 - tt) * 0.7
      ctx.strokeStyle = s.top ? '#FFC2D6' : '#FFE6AC'
      ctx.lineWidth = 4 * (1 - tt) + 1
      ctx.beginPath()
      ctx.arc(s.x, s.y, 18 + tt * (s.top ? 120 : 46), 0, Math.PI * 2)
      ctx.stroke()
      ctx.restore()
    }
  }
}
