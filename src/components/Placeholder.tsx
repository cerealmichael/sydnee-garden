import CatBadge from './CatBadge'
import type { CatName } from '../lib/cats'
import s from './Placeholder.module.css'

type Props = {
  text: string
  color: string
  cat: CatName
}

/** Tymczasowa zawartosc pustych ekranow. */
export default function Placeholder({ text, color, cat }: Props) {
  return (
    <div className={s.wrap}>
      <CatBadge cat={cat} color={color} size={140} />
      <p className={s.text}>{text}</p>
    </div>
  )
}
