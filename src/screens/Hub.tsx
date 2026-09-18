import { useState } from 'react'
import Screen from '../components/Screen'
import Tile from '../components/Tile'
import CatBadge from '../components/CatBadge'
import CloudBadge from '../components/CloudBadge'
import PersonPicker from '../components/PersonPicker'
import { PEOPLE, readPerson, savePerson, type Person } from '../lib/person'
import s from './Hub.module.css'

export default function Hub() {
  const [person, setPerson] = useState<Person | null>(readPerson)
  const [picking, setPicking] = useState(false)

  const pick = (who: Person) => {
    savePerson(who)
    setPerson(who)
    setPicking(false)
  }

  return (
    <Screen>
      <div className={s.hero}>
        <CatBadge cat="duo" color="var(--lilac)" size={132} />
        <h1 className={s.hello}>Cześć 🌸</h1>
      </div>

      <nav className={s.tiles}>
        <Tile
          to="/ogrodek"
          title="Ogródek"
          subtitle="Nasze rosnące coś"
          color="var(--mint)"
          cat="classic"
        />
        <Tile
          to="/merge"
          title="Pusheen Merge"
          subtitle="Łącz kotki"
          color="var(--peach)"
          cat="donut"
        />
        <Tile
          to="/numba-match"
          title="Numba Match"
          subtitle="Łącz pary cyfr"
          color="var(--sky)"
          cat="cool"
        />
        <Tile to="/list" title="List" subtitle="Do przeczytania" color="var(--pink)" cat="mail" />
      </nav>

      {/* kto gra na tym telefonie - stad wiadomo, czyj wynik trafia do tabeli */}
      <button className={s.who} onClick={() => setPicking(true)}>
        {person ? `Ten telefon to ${PEOPLE[person].name} · zmień` : 'Kto gra na tym telefonie?'}
      </button>

      {picking && (
        <PersonPicker
          title="Kto gra na tym telefonie?"
          onPick={pick}
          onClose={() => setPicking(false)}
        />
      )}

      <CloudBadge />
    </Screen>
  )
}
