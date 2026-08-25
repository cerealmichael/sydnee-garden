import Cat from './Cat'
import s from './Loading.module.css'

/** Zaslonka na czas doczytywania ekranu (trasy sa lazy). */
export default function Loading() {
  return (
    <div className={s.wrap}>
      <Cat name="mochi" className={s.cat} />
    </div>
  )
}
