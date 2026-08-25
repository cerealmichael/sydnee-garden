import { useEffect, useState } from 'react'
import Screen from '../components/Screen'
import CatBadge from '../components/CatBadge'
import GiftBox from '../letter/GiftBox'
import LetterEditor from '../letter/LetterEditor'
import { useLetter } from '../letter/useLetter'
import s from './Letter.module.css'

type Phase = 'closed' | 'opening' | 'open'

export default function Letter() {
  const { letter, loading, busy, error, save, upload } = useLetter()
  const [editing, setEditing] = useState(false)
  const [phase, setPhase] = useState<Phase>('closed')

  // po zapisie nowego zdjecia prezent pakuje sie z powrotem
  useEffect(() => setPhase('closed'), [letter.photo])

  useEffect(() => {
    if (phase !== 'opening') return
    const t = window.setTimeout(() => setPhase('open'), 620)
    return () => window.clearTimeout(t)
  }, [phase])

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
            {letter.body && <p className={s.body}>{letter.body}</p>}
            {letter.photo && (
              <>
                {phase !== 'open' && (
                  <GiftBox phase={phase} onOpen={() => setPhase('opening')} />
                )}
                {phase === 'open' && (
                  <img src={letter.photo} alt="" className={s.photo} />
                )}
              </>
            )}
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
