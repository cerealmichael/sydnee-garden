import type { ReactNode } from 'react'
import TopBar from './TopBar'
import s from './Screen.module.css'

type Props = {
  title?: string
  back?: boolean
  /** true = tresc wypelnia ekran i nie scrolluje (gry, plansze) */
  fill?: boolean
  children: ReactNode
}

/** Ramka ekranu: pelne 100dvh + safe-area, scroll tylko w srodku. */
export default function Screen({ title, back = false, fill = false, children }: Props) {
  return (
    <div className={s.screen}>
      {(title || back) && <TopBar title={title} back={back} />}
      <main className={fill ? `${s.body} ${s.fill}` : s.body}>{children}</main>
    </div>
  )
}
