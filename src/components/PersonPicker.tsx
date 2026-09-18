import CatBadge from './CatBadge'
import { PEOPLE, type Person } from '../lib/person'
import s from './PersonPicker.module.css'

type Props = {
  title?: string
  onPick: (person: Person) => void
  /** null = nie da sie zamknac (pytanie musi paść) */
  onClose?: () => void
}

/** Kto siedzi przy tym telefonie - zapisujemy w localStorage. */
export default function PersonPicker({ title = 'Kto rysuje?', onPick, onClose }: Props) {
  return (
    <div className={s.overlay} onClick={onClose}>
      <div className={s.card} onClick={(e) => e.stopPropagation()}>
        <h2 className={s.title}>{title}</h2>
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
