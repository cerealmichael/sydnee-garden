import CatBadge from '../../components/CatBadge'
import s from './GameOverCard.module.css'

type Props = {
  score: number
  best: number
  onRestart: () => void
}

export default function GameOverCard({ score, best, onRestart }: Props) {
  const record = score >= best && score > 0

  return (
    <div className={s.overlay}>
      <div className={s.card}>
        <CatBadge cat={record ? 'gift' : 'mochi'} color="var(--peach)" size={104} />
        <h2 className={s.title}>{record ? 'Nowy rekord!' : 'Koniec!'}</h2>
        <p className={s.score}>{score}</p>
        <p className={s.best}>Najlepszy: {best}</p>
        <button className={s.again} onClick={onRestart}>
          Jeszcze raz
        </button>
      </div>
    </div>
  )
}
