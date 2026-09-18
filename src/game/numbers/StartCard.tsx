import CatBadge from '../../components/CatBadge'
import { LEVELS, LEVEL_KEYS, type Level } from './levels'
import { readBest } from './storage'
import s from './StartCard.module.css'

type Props = {
  onStart: (level: Level) => void
}

/** Ekran startowy: wybor poziomu i rekord na kazdym z nich. */
export default function StartCard({ onStart }: Props) {
  return (
    <div className={s.card}>
      <p className={s.rules}>
        Łącz dwie takie same cyfry albo dwie dające <b>10</b>. Sąsiadów szukaj w rzędzie,
        w kolumnie, na skosie i tuż obok w kolejności czytania.
      </p>

      <div className={s.levels}>
        {LEVEL_KEYS.map((key) => {
          const level = LEVELS[key]
          const best = readBest(key)

          return (
            <button
              key={key}
              className={s.level}
              style={{ ['--accent' as string]: level.color }}
              onClick={() => onStart(key)}
            >
              <CatBadge cat={level.cat} color={level.color} size={64} />
              <span className={s.text}>
                <span className={s.name}>{level.label}</span>
                <span className={s.note}>{level.note}</span>
              </span>
              <span className={s.best}>{best > 0 ? best : '—'}</span>
            </button>
          )
        })}
      </div>

      <p className={s.foot}>Liczba po prawej to Twój rekord na tym poziomie.</p>
    </div>
  )
}
