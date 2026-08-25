import { useState } from 'react'
import Screen from '../components/Screen'
import Cat from '../components/Cat'
import FlowerBed from '../garden/FlowerBed'
import PersonPicker from '../garden/PersonPicker'
import PlantArt from '../garden/PlantArt'
import { useGarden } from '../garden/useGarden'
import { PER_FLOWER, STAGE_NAMES } from '../garden/stages'
import { PEOPLE, readPerson, savePerson, type Person } from '../lib/person'
import s from './Garden.module.css'

export default function Garden() {
  const [person, setPerson] = useState<Person | null>(readPerson)
  const g = useGarden(person)

  const pick = (p: Person) => {
    savePerson(p)
    setPerson(p)
  }

  return (
    <Screen title="Ogródek" back fill>
      <div className={s.scene}>
        <PlantArt stage={g.stage} className={s.plant} />
        <span className={s.stage}>{STAGE_NAMES[g.stage]}</span>
      </div>

      <div className={s.progress}>
        <div className={s.bar}>
          <span style={{ width: `${(g.progress / PER_FLOWER) * 100}%` }} />
        </div>
        <p className={s.progressText}>
          {g.progress} / {PER_FLOWER} podlań do kwiatka
        </p>
      </div>

      <div className={s.people}>
        {(Object.keys(PEOPLE) as Person[]).map((key) => {
          const done = g.todayBy.has(key)
          return (
            <span key={key} className={done ? `${s.person} ${s.done}` : s.person}>
              <Cat name={PEOPLE[key].cat} className={s.personCat} />
              <span className={s.personName}>{PEOPLE[key].name}</span>
              <span className={s.personMark}>{done ? '💧' : '·'}</span>
            </span>
          )
        })}
      </div>

      <button
        className={s.water}
        onClick={g.water}
        disabled={!g.canWater || g.busy || g.loading}
      >
        {g.canWater ? 'Podlej 💧' : 'Dziś już podlane'}
      </button>

      <div className={s.foot}>
        <FlowerBed count={g.flowers} />
        {g.streak > 0 && <p className={s.streak}>Razem od {g.streak} dni 🔥</p>}
        {g.error && <p className={s.error}>{g.error}</p>}
      </div>

      {!person && <PersonPicker onPick={pick} />}
    </Screen>
  )
}
