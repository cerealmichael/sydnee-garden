import CatBadge from '../components/CatBadge'
import { PEOPLE, type Person } from '../lib/person'
import s from './PersonPicker.module.css'

type Props = { onPick: (person: Person) => void }

/** Jednorazowe pytanie "kto rysuje" - zapisujemy w localStorage. */
export default function PersonPicker({ onPick }: Props) {
  return (
    <div className={s.overlay}>
      <div className={s.card}>
        <h2 className={s.title}>Kto rysuje?</h2>
        <div className={s.options}>
          {(Object.keys(PEOPLE) as Person[]).map((key) => (
            <button key={key} className={s.option} onClick={() => onPick(key)}>
              <CatBadge cat={PEOPLE[key].cat} color={PEOPLE[key].color} size={92} />
              <span>{PEOPLE[key].name}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
