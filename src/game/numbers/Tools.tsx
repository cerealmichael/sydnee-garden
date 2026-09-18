import { useState } from 'react'
import Cat from '../../components/Cat'
import s from './Tools.module.css'

type Props = {
  addsLeft: number
  /** true = na planszy nie ma juz zadnej pary */
  stuck: boolean
  disabled: boolean
  onAdd: () => void
  onHint: () => void
  onRestart: () => void
}

/**
 * Zamiast plusa i zarowki - dwa kotki. Kotek w kokardce dosypuje cyfry
 * (licznik na ramieniu), kotek z ksiazka podpowiada. "Od nowa" pyta
 * o potwierdzenie w tym samym pasku, zeby nie zgubic dobrej partii.
 */
export default function Tools({ addsLeft, stuck, disabled, onAdd, onHint, onRestart }: Props) {
  const [confirming, setConfirming] = useState(false)

  if (confirming) {
    return (
      <div className={s.tools}>
        <span className={s.ask}>Zaczynamy od nowa?</span>
        <button
          className={s.yes}
          onClick={() => {
            setConfirming(false)
            onRestart()
          }}
        >
          Tak
        </button>
        <button className={s.no} onClick={() => setConfirming(false)}>
          Nie
        </button>
      </div>
    )
  }

  return (
    <div className={s.tools}>
      <button
        className={`${s.button} ${stuck && addsLeft > 0 ? s.nudge : ''}`}
        onClick={onAdd}
        disabled={disabled || addsLeft === 0}
      >
        <Cat name="gift" className={s.cat} />
        <span className={s.count}>{addsLeft}</span>
        <span className={s.name}>Dosyp</span>
      </button>

      <button className={s.button} onClick={onHint} disabled={disabled || stuck}>
        <Cat name="reading" className={s.cat} />
        <span className={s.name}>Podpowiedź</span>
      </button>

      <button className={s.restart} onClick={() => setConfirming(true)} aria-label="Od nowa">
        <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true">
          <path
            d="M19 12a7 7 0 1 1-2.1-5"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.6"
            strokeLinecap="round"
          />
          <path
            d="M18.5 3.5 V 7.5 H 14.5"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.6"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>
    </div>
  )
}
