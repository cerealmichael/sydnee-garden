import { useState } from 'react'
import Screen from '../components/Screen'
import Cat from '../components/Cat'
import DrawPad from '../garden/DrawPad'
import Meadow from '../garden/Meadow'
import PersonPicker from '../garden/PersonPicker'
import { useGarden } from '../garden/useGarden'
import type { Stroke } from '../garden/strokes'
import { PEOPLE, readPerson, savePerson, type Person } from '../lib/person'
import s from './Garden.module.css'

export default function Garden() {
  const [person, setPerson] = useState<Person | null>(readPerson)
  const [drawing, setDrawing] = useState(false)
  const [selected, setSelected] = useState<string | null>(null)
  const [confirming, setConfirming] = useState(false)
  const g = useGarden()

  const pick = (p: Person) => {
    savePerson(p)
    setPerson(p)
  }

  const plant = async (strokes: Stroke[], note: string) => {
    if (!person) return
    // kopiujemy, bo DrawPad trzyma swoje kreski w refie i moze je czyscic
    const ok = await g.plant(person, strokes.map((st) => ({ ...st, p: [...st.p] })), note)
    if (ok) setDrawing(false)
  }

  const select = (id: string | null) => {
    setSelected(id)
    setConfirming(false)
  }

  const remove = async () => {
    if (!selected) return
    const id = selected
    select(null)
    await g.remove(id)
  }

  const picked = g.flowers.find((f) => f.id === selected)

  return (
    <Screen title="Ogródek" back fill>
      <Meadow flowers={g.flowers} selected={selected} onSelect={select} />

      <div className={s.bar}>
        {picked ? (
          confirming ? (
            <span className={s.info}>
              <span className={s.infoWho}>Wyrwać kwiatka?</span>
              <button className={s.yes} onClick={remove}>
                Tak
              </button>
              <button className={s.no} onClick={() => setConfirming(false)}>
                Nie
              </button>
            </span>
          ) : (
            <span className={s.info}>
              <Cat name={PEOPLE[picked.author].cat} className={s.infoCat} />
              <span className={s.infoText}>
                <span className={s.infoWho}>
                  {PEOPLE[picked.author].name} ·{' '}
                  {new Date(picked.created_at).toLocaleDateString('pl-PL', {
                    day: 'numeric',
                    month: 'long',
                  })}
                </span>
                {picked.note && <span className={s.infoNote}>{picked.note}</span>}
              </span>
              <button
                className={s.trash}
                onClick={() => setConfirming(true)}
                aria-label="Usuń kwiatka"
              >
                🗑
              </button>
            </span>
          )
        ) : (
          <span className={s.count}>
            {g.loading ? 'Wczytuję…' : `Kwiatków: ${g.flowers.length}`}
          </span>
        )}
      </div>

      <button className={s.add} onClick={() => setDrawing(true)} disabled={!person}>
        Narysuj kwiatka 🌸
      </button>

      {g.error && <p className={s.error}>{g.error}</p>}

      {drawing && (
        <DrawPad busy={g.busy} onClose={() => setDrawing(false)} onPlant={plant} />
      )}
      {!person && <PersonPicker onPick={pick} />}
    </Screen>
  )
}
