import { Link } from 'react-router-dom'
import CatBadge from './CatBadge'
import s from './Tile.module.css'

type Props = {
  to: string
  title: string
  subtitle: string
  color: string
  item?: 'sprout' | 'fruit' | 'letter'
}

export default function Tile({ to, title, subtitle, color, item }: Props) {
  return (
    <Link to={to} className={s.tile} style={{ ['--accent' as string]: color }}>
      <CatBadge item={item} color={color} size={84} />
      <span className={s.text}>
        <span className={s.title}>{title}</span>
        <span className={s.subtitle}>{subtitle}</span>
      </span>
    </Link>
  )
}
