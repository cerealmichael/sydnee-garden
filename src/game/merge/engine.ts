import Matter from 'matter-js'
import { FINAL_BONUS, LEVELS, TOP_LEVEL } from './levels'

const { Bodies, Body, Composite, Engine, Events } = Matter

export type CatPlugin = { level: number; born: number; pop: number }
export type CatBody = Matter.Body & { plugin: CatPlugin }

export type EngineHandlers = {
  onScore: (points: number) => void
  /** blysk po polaczeniu - do efektow w rendererze */
  onPop: (x: number, y: number, level: number, top: boolean) => void
  onGameOver: () => void
}

const STEP = 1000 / 60
const WALL = 200
/** ile ms kotek musi wystawac ponad linie, zeby przegrac */
const OVER_LIMIT = 900
/** mlody kotek jeszcze nie liczy sie do przegranej */
const GRACE = 500

export class MergeEngine {
  readonly engine = Engine.create({ enableSleeping: true })
  w = 0
  h = 0
  dangerY = 0
  over = false

  private walls: Matter.Body[] = []
  private pending: [CatBody, CatBody][] = []
  private dead = new Set<number>()
  private acc = 0
  private overSince = 0

  constructor(private handlers: EngineHandlers) {
    this.engine.gravity.y = 1.1

    Events.on(this.engine, 'collisionStart', (e) => {
      for (const { bodyA, bodyB } of e.pairs) {
        const a = bodyA as CatBody
        const b = bodyB as CatBody
        if (typeof a.plugin?.level !== 'number') continue
        if (typeof b.plugin?.level !== 'number') continue
        if (a.plugin.level !== b.plugin.level) continue
        this.pending.push([a, b])
      }
    })
  }

  get cats(): CatBody[] {
    return Composite.allBodies(this.engine.world).filter(
      (b) => !b.isStatic,
    ) as CatBody[]
  }

  radius(level: number) {
    return LEVELS[level].r * this.w
  }

  resize(w: number, h: number) {
    const scale = this.w ? w / this.w : 1
    this.w = w
    this.h = h
    this.dangerY = h * 0.13

    if (scale !== 1) {
      for (const cat of this.cats) {
        Body.scale(cat, scale, scale)
        Body.setPosition(cat, { x: cat.position.x * scale, y: cat.position.y * scale })
      }
    }

    Composite.remove(this.engine.world, this.walls)
    const opts = { isStatic: true, friction: 0.4, restitution: 0 }
    this.walls = [
      Bodies.rectangle(-WALL / 2, h / 2, WALL, h * 3, opts),
      Bodies.rectangle(w + WALL / 2, h / 2, WALL, h * 3, opts),
      Bodies.rectangle(w / 2, h + WALL / 2, w + WALL * 2, WALL, opts),
    ]
    Composite.add(this.engine.world, this.walls)
  }

  drop(level: number, x: number) {
    const r = this.radius(level)
    const clamped = Math.min(Math.max(x, r + 2), this.w - r - 2)
    const body = Bodies.circle(clamped, this.dangerY - r - 8, r, {
      restitution: 0.08,
      friction: 0.45,
      frictionStatic: 0.6,
      frictionAir: 0.004,
      slop: 0.02,
    }) as CatBody
    body.plugin = { level, born: performance.now(), pop: 0 }
    Composite.add(this.engine.world, body)
    return body
  }

  step(dt: number) {
    if (this.over) return
    this.acc = Math.min(this.acc + dt, STEP * 5)
    while (this.acc >= STEP) {
      Engine.update(this.engine, STEP)
      this.acc -= STEP
      this.resolveMerges()
    }
    this.checkGameOver()
  }

  private resolveMerges() {
    const pairs = this.pending
    this.pending = []

    for (const [a, b] of pairs) {
      if (this.dead.has(a.id) || this.dead.has(b.id)) continue
      this.dead.add(a.id)
      this.dead.add(b.id)

      const level = a.plugin.level
      const x = (a.position.x + b.position.x) / 2
      const y = (a.position.y + b.position.y) / 2
      Composite.remove(this.engine.world, [a, b])

      if (level === TOP_LEVEL) {
        // dwa jednorozce znikaja i daja bonus
        this.handlers.onScore(FINAL_BONUS)
        this.handlers.onPop(x, y, level, true)
        continue
      }

      const next = level + 1
      const body = Bodies.circle(x, y, this.radius(next), {
        restitution: 0.08,
        friction: 0.45,
        frictionStatic: 0.6,
        frictionAir: 0.004,
        slop: 0.02,
      }) as CatBody
      body.plugin = { level: next, born: performance.now(), pop: 1 }
      Composite.add(this.engine.world, body)
      this.handlers.onScore(LEVELS[next].score)
      this.handlers.onPop(x, y, next, false)
    }
  }

  private checkGameOver() {
    const now = performance.now()
    const sticking = this.cats.some((cat) => {
      if (now - cat.plugin.born < GRACE) return false
      if (cat.speed > 0.9) return false
      return cat.position.y - this.radius(cat.plugin.level) < this.dangerY
    })

    if (!sticking) {
      this.overSince = 0
      return
    }
    if (!this.overSince) this.overSince = now
    if (now - this.overSince > OVER_LIMIT) {
      this.over = true
      this.handlers.onGameOver()
    }
  }

  reset() {
    Composite.remove(this.engine.world, this.cats)
    this.dead.clear()
    this.pending = []
    this.acc = 0
    this.overSince = 0
    this.over = false
  }
}
