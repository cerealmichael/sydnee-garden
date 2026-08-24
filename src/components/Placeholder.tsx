import CatBadge from './CatBadge'
import s from './Placeholder.module.css'

type Props = {
  text: string
  color: string
  item?: 'sprout' | 'fruit' | 'letter'
}

/** Tymczasowa zawartosc pustych ekranow. */
export default function Placeholder({ text, color, item }: Props) {
  return (
    <div className={s.wrap}>
      <CatBadge color={color} size={140} item={item} />
      <p className={s.text}>{text}</p>
    </div>
  )
}
