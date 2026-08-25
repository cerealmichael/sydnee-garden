import Screen from '../components/Screen'
import GameOverCard from '../game/merge/GameOverCard'
import NextQueue from '../game/merge/NextQueue'
import { useMergeGame } from '../game/merge/useMergeGame'
import s from './Merge.module.css'

export default function Merge() {
  const { wrapRef, canvasRef, queue, score, best, over, loaded, restart } = useMergeGame()

  return (
    <Screen title="Pusheen Merge" back fill>
      <div className={s.hud}>
        <div className={s.score}>
          <span className={s.scoreLabel}>Wynik</span>
          <span className={s.scoreValue}>{score}</span>
        </div>
        <NextQueue levels={queue} />
      </div>

      <div className={s.board} ref={wrapRef}>
        <canvas ref={canvasRef} className={s.canvas} />
        {!loaded && <p className={s.loading}>Kotki się rozgrzewają…</p>}
        {over && <GameOverCard score={score} best={best} onRestart={restart} />}
      </div>

      <p className={s.footer}>Najlepszy wynik: {best}</p>
    </Screen>
  )
}
