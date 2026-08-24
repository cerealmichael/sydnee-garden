import PusheenCat from './PusheenCat'
import s from './RotateNotice.module.css'

/** Apka jest tylko na portret - w poziomie prosimy o obrot. */
export default function RotateNotice() {
  return (
    <div className={s.notice} aria-hidden="true">
      <PusheenCat className={s.cat} />
      <p>Obróć telefon 🙂</p>
    </div>
  )
}
