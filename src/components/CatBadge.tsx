import Cat from './Cat'
import type { CatName } from '../lib/cats'
import s from './CatBadge.module.css'

type Props = {
  cat?: CatName
  /** kolor kola - dowolny token z palety */
  color?: string
  size?: number
}

/** Kotek w pastelowym kole. */
export default function CatBadge({ cat = 'classic', color = 'var(--pink)', size = 96 }: Props) {
  return (
    <div className={s.badge} style={{ background: color, width: size, height: size }}>
      <Cat name={cat} className={s.cat} />
    </div>
  )
}
