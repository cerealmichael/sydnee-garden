import PusheenCat from './PusheenCat'
import s from './CatBadge.module.css'

type Props = {
  item?: 'sprout' | 'fruit' | 'letter'
  /** kolor kola - dowolny token z palety */
  color?: string
  size?: number
  title?: string
}

/** Kotek w pastelowym kole. */
export default function CatBadge({ item, color = 'var(--pink)', size = 96, title }: Props) {
  return (
    <div className={s.badge} style={{ background: color, width: size, height: size }}>
      <PusheenCat item={item} title={title} className={s.cat} />
    </div>
  )
}
