import Screen from '../components/Screen'
import Board from '../game/numbers/Board'
import GameOverCard from '../game/numbers/GameOverCard'
import Hud from '../game/numbers/Hud'
import Tools from '../game/numbers/Tools'
import { useNumbersGame } from '../game/numbers/useNumbersGame'
import s from './Numbers.module.css'

export default function Numbers() {
  const g = useNumbersGame()

  return (
    <Screen title="Dziesiątki" back fill>
      <Hud score={g.score} multiplier={g.multiplier} left={g.left} mood={g.mood} />

      <Board
        board={g.board}
        selected={g.selected}
        hint={g.hint}
        flash={g.flash}
        freshFrom={g.freshFrom}
        onTap={g.tap}
      />

      <Tools
        addsLeft={g.addsLeft}
        stuck={g.stuck}
        disabled={g.over}
        onAdd={g.add}
        onHint={g.askHint}
        onRestart={g.restart}
      />

      <p className={s.footer}>Łącz cyfry równe albo dające 10 · rekord {g.best}</p>

      {g.over && (
        <GameOverCard
          score={g.score}
          best={g.best}
          prevBest={g.prevBest}
          history={g.history}
          bests={g.bests}
          person={g.person}
          onClaim={g.claim}
          onRestart={g.restart}
        />
      )}
    </Screen>
  )
}
