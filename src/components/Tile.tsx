import { Link } from 'react-router-dom'
import CatBadge from './CatBadge'
import type { CatName } from '../lib/cats'
import s from './Tile.module.css'

type Props = {
  to: string
  title: string
  subtitle: string
  color: string
  cat: CatName
}

export default function Tile({ to, title, subtitle, color, cat }: Props) {
  return (
    <Link to={to} className={s.tile} style={{ ['--accent' as string]: color }}>
      <CatBadge cat={cat} color={color} size={84} />
      <span className={s.text}>
        <span className={s.title}>{title}</span>
        <span className={s.subtitle}>{subtitle}</span>
      </span>
    </Link>
  )
}
