import { useRef, useState } from 'react'
import s from './LetterEditor.module.css'

type Props = {
  body: string
  photo: string | null
  busy: boolean
  onPickPhoto: (file: File) => Promise<string | null>
  onSave: (body: string, photo: string | null) => void
  onCancel: () => void
}

export default function LetterEditor({
  body,
  photo,
  busy,
  onPickPhoto,
  onSave,
  onCancel,
}: Props) {
  const fileRef = useRef<HTMLInputElement>(null)
  const [text, setText] = useState(body)
  const [image, setImage] = useState(photo)

  const pick = async (file?: File) => {
    if (!file) return
    const url = await onPickPhoto(file)
    if (url) setImage(url)
  }

  return (
    <div className={s.sheet}>
      <header className={s.head}>
        <h2 className={s.title}>Piszemy list</h2>
        <button className={s.close} onClick={onCancel} aria-label="Zamknij">
          ✕
        </button>
      </header>

      <div className={s.photoBox}>
        {image ? (
          <img src={image} alt="" className={s.photo} />
        ) : (
          <p className={s.photoEmpty}>Bez zdjęcia</p>
        )}
      </div>

      <div className={s.photoTools}>
        <button className={s.tool} onClick={() => fileRef.current?.click()} disabled={busy}>
          {image ? 'Zmień zdjęcie' : 'Dodaj zdjęcie 📷'}
        </button>
        {image && (
          <button className={s.tool} onClick={() => setImage(null)} disabled={busy}>
            Usuń zdjęcie
          </button>
        )}
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          hidden
          onChange={(e) => pick(e.target.files?.[0])}
        />
      </div>

      <textarea
        className={s.body}
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Tu wpisz treść listu…"
      />

      <button className={s.save} onClick={() => onSave(text, image)} disabled={busy}>
        {busy ? 'Zapisuję…' : 'Zapisz 💌'}
      </button>
    </div>
  )
}
