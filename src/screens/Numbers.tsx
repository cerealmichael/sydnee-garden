import Screen from '../components/Screen'
import Board from '../game/numbers/Board'
import GameOverCard from '../game/numbers/GameOverCard'
import Hud from '../game/numbers/Hud'
import StartCard from '../game/numbers/StartCard'
import Tools from '../game/numbers/Tools'
import { LEVELS } from '../game/numbers/levels'
import { useNumbersGame } from '../game/numbers/useNumbersGame'
import s from './Numbers.module.css'

export default function Numbers() {
  const g = useNumbersGame()

  if (!g.game) {
    return (
      <Screen title="Numba Match" back fill>
        <StartCard onStart={g.start} />
      </Screen>
    )
  }

  const game = g.game

  return (
    <Screen title="Numba Match" back fill>
      <Hud score={game.score} multiplier={g.multiplier} left={g.left} mood={g.mood} />

      <Board
        board={game.board}
        selected={game.selected}
        hint={game.hint}
        flash={game.flash}
        freshFrom={game.freshFrom}
        onTap={g.tap}
      />

      <Tools
        addsLeft={game.addsLeft}
        stuck={g.stuck}
        disabled={game.over}
        onAdd={g.add}
        onHint={g.askHint}
        onRestart={g.toMenu}
      />

      <p className={s.footer}>
        {LEVELS[game.level].label} · rekord {g.best}
      </p>

      {game.over && (
        <GameOverCard
          level={game.level}
          score={game.score}
          best={g.best}
          prevBest={g.prevBest}
          history={g.history}
          bests={g.bests}
          person={g.person}
          onClaim={g.claim}
          onAgain={() => g.start(game.level)}
          onMenu={g.toMenu}
        />
      )}
    </Screen>
  )
}
