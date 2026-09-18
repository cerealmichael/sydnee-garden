import { useCallback, useEffect, useRef, useState } from 'react'
import {
  addNumbers,
  aliveCount,
  canMatch,
  clearPair,
  dealBoard,
  findPair,
  MAX_ADDS,
  type Board,
  type Pair,
} from './rules'
import { pairPoints, multiplier, HINT, ROW, SPARE_ADD, SWEEP } from './scoring'
import { scores } from './api'
import {
  forgetGame,
  pushHistory,
  readBest,
  readGame,
  readHistory,
  saveBest,
  saveGame,
  type HistoryEntry,
} from './storage'
import { readPerson, savePerson, type Person } from '../../lib/person'
import type { Bests } from './api'

/** Nastroj kotka w pasku - czysto dekoracyjny, ale zdradza stan gry. */
export type Mood = 'calm' | 'happy' | 'wow' | 'stuck' | 'over'

type Game = {
  board: Board
  score: number
  /** pary polaczone pod rzad, bez dosypywania i podpowiedzi */
  streak: number
  addsLeft: number
  over: boolean
  selected: number | null
  hint: Pair | null
  /** para w trakcie animacji znikania */
  flash: Pair | null
  /** od tego indeksu cyfry sa swiezo dosypane (-1 = nic nowego) */
  freshFrom: number
}

const fresh = (board: Board): Game => ({
  board,
  score: 0,
  streak: 0,
  addsLeft: MAX_ADDS,
  over: false,
  selected: null,
  hint: null,
  flash: null,
  freshFrom: -1,
})

const HINT_MS = 2200
const FLASH_MS = 260

const finish = (g: Game): Game => ({
  ...g,
  over: true,
  score: g.score + g.addsLeft * SPARE_ADD,
  selected: null,
  hint: null,
})

/** Po kazdym ruchu: gdy nie ma juz par i nie ma czym dosypac - koniec gry. */
const settle = (g: Game): Game => (findPair(g.board) === null && g.addsLeft === 0 ? finish(g) : g)

export function useNumbersGame() {
  const [game, setGame] = useState<Game>(() => {
    const saved = readGame()
    if (!saved) return fresh(dealBoard())
    return { ...fresh(saved.board), score: saved.score, streak: saved.streak, addsLeft: saved.addsLeft }
  })

  const [best, setBest] = useState(readBest)
  /** rekord sprzed tej partii - karta konca gry ma czym sie pochwalic */
  const [prevBest, setPrevBest] = useState(readBest)
  const [history, setHistory] = useState<HistoryEntry[]>(readHistory)
  const [person, setPerson] = useState<Person | null>(readPerson)
  const [bests, setBests] = useState<Bests>({})
  const sentRef = useRef(false)

  const { board, over, addsLeft, score } = game
  const stuck = !over && findPair(board) === null

  // wspolne rekordy: raz na wejscie i po kazdym wyslanym wyniku
  const refreshBests = useCallback(() => {
    scores
      .bests()
      .then(setBests)
      .catch(() => {
        /* brak sieci albo tabeli - tablica po prostu sie nie pokaze */
      })
  }, [])

  useEffect(refreshBests, [refreshBests])

  // wznowiona partia tez moze byc juz martwa (zapis zrobiony tuz przed koncem),
  // a bez tego dalo sie utknac na planszy bez par i bez dosypywania
  useEffect(() => {
    if (!over && stuck && addsLeft === 0) setGame(finish)
  }, [over, stuck, addsLeft])

  // niedokonczona partia czeka w localStorage; po koncu gry nie ma czego wracac
  useEffect(() => {
    if (over) forgetGame()
    else saveGame({ board, score, streak: game.streak, addsLeft })
  }, [board, score, game.streak, addsLeft, over])

  // koniec gry: rekord, historia i wyslanie wyniku (jesli wiemy, kto gral)
  useEffect(() => {
    if (!over || sentRef.current) return
    sentRef.current = true

    const before = readBest()
    setPrevBest(before)
    if (score > before) {
      saveBest(score)
      setBest(score)
    }
    setHistory(pushHistory(score))

    if (person) {
      scores
        .submit(person, score)
        .then(refreshBests)
        .catch(() => {
          /* trudno, wynik zostaje lokalnie */
        })
    }
  }, [over, score, person, refreshBests])

  const tap = useCallback((i: number) => {
    // losujemy z gory, zeby updater zostal czysty (StrictMode woła go dwa razy)
    const spare = dealBoard()

    setGame((g) => {
      if (g.over || g.board[i]?.done) return g
      if (g.selected === null) return { ...g, selected: i, hint: null }
      if (g.selected === i) return { ...g, selected: null }
      if (!canMatch(g.board, g.selected, i)) return { ...g, selected: i, hint: null }

      const pair: Pair = [g.selected, i]
      const { board: next, rows } = clearPair(g.board, pair[0], pair[1])
      const streak = g.streak + 1
      let score = g.score + pairPoints(g.streak) + rows * ROW
      let addsLeft = g.addsLeft
      let board = next

      // pusta plansza: premia, swieze rozdanie i dosypywanie od nowa
      if (aliveCount(board) === 0) {
        score += SWEEP
        board = spare
        addsLeft = MAX_ADDS
      }

      return settle({
        ...g,
        board,
        score,
        streak,
        addsLeft,
        selected: null,
        hint: null,
        flash: pair,
        freshFrom: -1,
      })
    })
  }, [])

  const add = useCallback(() => {
    setGame((g) => {
      if (g.over || g.addsLeft === 0) return g
      const { board, from } = addNumbers(g.board)
      return settle({
        ...g,
        board,
        addsLeft: g.addsLeft - 1,
        streak: 0,
        selected: null,
        hint: null,
        freshFrom: from,
      })
    })
  }, [])

  const askHint = useCallback(() => {
    setGame((g) => {
      if (g.over) return g
      const pair = findPair(g.board)
      if (!pair) return g
      return {
        ...g,
        hint: pair,
        streak: 0,
        selected: null,
        score: Math.max(0, g.score - HINT),
      }
    })
  }, [])

  const restart = useCallback(() => {
    const board = dealBoard()
    sentRef.current = false
    setGame(fresh(board))
  }, [])

  /** "Czyj to wynik?" na karcie konca gry - zapamietujemy i wysylamy. */
  const claim = useCallback(
    (who: Person) => {
      savePerson(who)
      setPerson(who)
      scores
        .submit(who, score)
        .then(refreshBests)
        .catch(() => {
          /* trudno */
        })
    },
    [score, refreshBests],
  )

  // podpowiedz i blysk same gasna
  useEffect(() => {
    if (!game.hint) return
    const t = setTimeout(() => setGame((g) => ({ ...g, hint: null })), HINT_MS)
    return () => clearTimeout(t)
  }, [game.hint])

  useEffect(() => {
    if (!game.flash) return
    const t = setTimeout(() => setGame((g) => ({ ...g, flash: null })), FLASH_MS)
    return () => clearTimeout(t)
  }, [game.flash])

  const mult = multiplier(game.streak)
  const mood: Mood = over ? 'over' : stuck ? 'stuck' : mult >= 4 ? 'wow' : mult >= 2 ? 'happy' : 'calm'

  return {
    ...game,
    left: aliveCount(board),
    multiplier: mult,
    stuck,
    mood,
    best,
    prevBest,
    history,
    person,
    bests,
    tap,
    add,
    askHint,
    restart,
    claim,
  }
}
