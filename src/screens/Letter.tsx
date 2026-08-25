import { useState } from 'react'
import Screen from '../components/Screen'
import CatBadge from '../components/CatBadge'
import LetterEditor from '../letter/LetterEditor'
import { useLetter } from '../letter/useLetter'
import s from './Letter.module.css'

export default function Letter() {
  const { letter, loading, busy, error, save, upload } = useLetter()
  const [editing, setEditing] = useState(false)

  const store = async (body: string, photo: string | null) => {
    if (await save(body, photo)) setEditing(false)
  }

  const empty = !letter.body && !letter.photo

  return (
    <Screen title="List" back fill>
      <div className={s.paper}>
        {loading ? (
          <p className={s.placeholder}>Wczytuję…</p>
        ) : empty ? (
          <div className={s.blank}>
            <CatBadge cat="mail" color="var(--pink)" size={120} />
            <p className={s.placeholder}>Listu jeszcze nie ma.</p>
          </div>
        ) : (
          <>
            {letter.photo && <img src={letter.photo} alt="" className={s.photo} />}
            {letter.body && <p className={s.body}>{letter.body}</p>}
          </>
        )}
      </div>

      <button className={s.edit} onClick={() => setEditing(true)}>
        {empty ? 'Napisz list ✍️' : 'Edytuj list'}
      </button>

      {error && <p className={s.error}>{error}</p>}

      {editing && (
        <LetterEditor
          body={letter.body}
          photo={letter.photo}
          busy={busy}
          onPickPhoto={upload}
          onSave={store}
          onCancel={() => setEditing(false)}
        />
      )}
    </Screen>
  )
}
