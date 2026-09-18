import CatBadge from '../../components/CatBadge'
import type { CatName } from '../../lib/cats'
import type { Mood } from './useNumbersGame'
import s from './Hud.module.css'

type Props = {
  score: number
  multiplier: number
  left: number
  mood: Mood
}

/** Kotek w pasku zdradza, jak leci: spokojny, zachwycony albo zmartwiony. */
const MOOD: Record<Mood, { cat: CatName; color: string; says: string }> = {
  calm: { cat: 'classic', color: 'var(--sky)', says: 'Szukaj par' },
  happy: { cat: 'cool', color: 'var(--mint)', says: 'Ładna seria!' },
  wow: { cat: 'unicorn', color: 'var(--lilac)', says: 'Ale jedziesz!' },
  stuck: { cat: 'mochi', color: 'var(--peach)', says: 'Dosyp cyfry' },
  over: { cat: 'mochi', color: 'var(--peach)', says: 'Koniec' },
}

export default function Hud({ score, multiplier, left, mood }: Props) {
  const m = MOOD[mood]

  return (
    <div className={s.hud}>
      <div className={s.score}>
        <span className={s.label}>Wynik</span>
        <span className={s.value}>{score}</span>
      </div>

      {multiplier > 1 && <span className={s.combo}>×{multiplier}</span>}

      <div className={s.cat}>
        <CatBadge cat={m.cat} color={m.color} size={54} />
        <span className={s.says}>
          {m.says}
          <span className={s.left}>{left} cyfr</span>
        </span>
      </div>
    </div>
  )
}
