import { useNavigate } from 'react-router-dom'
import s from './TopBar.module.css'

type Props = {
  title?: string
  back?: boolean
}

export default function TopBar({ title, back }: Props) {
  const navigate = useNavigate()

  return (
    <header className={s.bar}>
      {back && (
        <button className={s.back} onClick={() => navigate('/')} aria-label="Wróć">
          <svg viewBox="0 0 24 24" width="24" height="24" aria-hidden="true">
            <path
              d="M15 5 L 8 12 L 15 19"
              fill="none"
              stroke="currentColor"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      )}
      {title && <h1 className={s.title}>{title}</h1>}
    </header>
  )
}
