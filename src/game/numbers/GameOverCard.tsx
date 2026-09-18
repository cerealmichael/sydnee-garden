import CatBadge from '../../components/CatBadge'
import { PEOPLE, type Person } from '../../lib/person'
import type { Bests } from './api'
import { LEVELS, type Level } from './levels'
import type { HistoryEntry } from './storage'
import s from './GameOverCard.module.css'

type Props = {
  level: Level
  score: number
  best: number
  /** rekord sprzed tej partii */
  prevBest: number
  history: HistoryEntry[]
  bests: Bests
  /** null = jeszcze nie wiadomo, kto gra na tym telefonie */
  person: Person | null
  onClaim: (who: Person) => void
  /** jeszcze raz na tym samym poziomie */
  onAgain: () => void
  /** powrot do wyboru poziomu */
  onMenu: () => void
}

const day = (iso: string) =>
  new Date(iso).toLocaleDateString('pl-PL', { day: 'numeric', month: 'short' })

export default function GameOverCard({
  level,
  score,
  best,
  prevBest,
  history,
  bests,
  person,
  onClaim,
  onAgain,
  onMenu,
}: Props) {
  const record = score > prevBest && score > 0
  const people = Object.keys(PEOPLE) as Person[]
  const anyBest = people.some((p) => bests[p] !== undefined)

  return (
    <div className={s.overlay}>
      <div className={s.card}>
        <CatBadge
          cat={record ? 'unicorn' : 'mochi'}
          color={record ? 'var(--lilac)' : 'var(--peach)'}
          size={92}
        />
        <h2 className={s.title}>{record ? 'Nowy rekord!' : 'Koniec!'}</h2>
        <p className={s.score}>{score}</p>
        <p className={s.best}>
          {LEVELS[level].label} · {record ? `poprzedni rekord: ${prevBest}` : `Twój rekord: ${best}`}
        </p>

        {person === null ? (
          <div className={s.claim}>
            <span className={s.claimTitle}>Czyj to wynik?</span>
            <div className={s.people}>
              {people.map((key) => (
                <button key={key} className={s.person} onClick={() => onClaim(key)}>
                  <CatBadge cat={PEOPLE[key].cat} color={PEOPLE[key].color} size={52} />
                  <span>{PEOPLE[key].name}</span>
                </button>
              ))}
            </div>
          </div>
        ) : (
          anyBest && (
            <div className={s.table}>
              {people.map((key) => (
                <span key={key} className={s.row}>
                  <span className={s.who}>{PEOPLE[key].name}</span>
                  <span className={s.dots} />
                  <span className={s.num}>{bests[key] ?? '—'}</span>
                </span>
              ))}
            </div>
          )
        )}

        {history.length > 1 && (
          <p className={s.history}>
            Ostatnio:{' '}
            {history.slice(1, 5).map((h, i) => (
              <span key={h.at}>
                {i > 0 && ' · '}
                {h.score} <span className={s.when}>{day(h.at)}</span>
              </span>
            ))}
          </p>
        )}

        <button className={s.again} onClick={onAgain}>
          Jeszcze raz
        </button>
        <button className={s.menu} onClick={onMenu}>
          Zmień poziom
        </button>
      </div>
    </div>
  )
}
