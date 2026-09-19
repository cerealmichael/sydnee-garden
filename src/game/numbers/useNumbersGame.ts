import { useCallback, useEffect, useRef, useState } from 'react'
import {
  addNumbers,
  aliveCount,
  canMatch,
  clearPair,
  dealBoard,
  findPair,
  type Board,
  type Pair,
} from './rules'
import { pairPoints, multiplier, ROW, SPARE_ADD, SWEEP } from './scoring'
import { LEVELS, type Level } from './levels'
import { scores, type Bests } from './api'
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

/** Nastroj kotka w pasku - czysto dekoracyjny, ale zdradza stan gry. */
export type Mood = 'calm' | 'happy' | 'wow' | 'stuck' | 'over'

type Game = {
  level: Level
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

const HINT_MS = 2200
const FLASH_MS = 260

const deal = (level: Level) => dealBoard(LEVELS[level])

const fresh = (level: Level, board: Board): Game => ({
  level,
  board,
  score: 0,
  streak: 0,
  addsLeft: LEVELS[level].adds,
  over: false,
  selected: null,
  hint: null,
  flash: null,
  freshFrom: -1,
})

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
  // null = nikt jeszcze nie wybral poziomu, wisi ekran startowy
  const [game, setGame] = useState<Game | null>(() => {
    const saved = readGame()
    if (!saved) return null
    return {
      ...fresh(saved.level, saved.board),
      score: saved.score,
      streak: saved.streak,
      addsLeft: saved.addsLeft,
    }
  })

  const level = game?.level ?? null
  const [best, setBest] = useState(0)
  /** rekord sprzed tej partii - karta konca gry ma czym sie pochwalic */
  const [prevBest, setPrevBest] = useState(0)
  const [history, setHistory] = useState<HistoryEntry[]>([])
  const [person, setPerson] = useState<Person | null>(readPerson)
  const [bests, setBests] = useState<Bests>({})
  const sentRef = useRef(false)

  const over = game?.over ?? false
  const score = game?.score ?? 0
  const addsLeft = game?.addsLeft ?? 0
  const stuck = Boolean(game) && !over && findPair(game!.board) === null

  // rekord, historia i wspolna tablica zalezne od poziomu
  const refreshBests = useCallback((lvl: Level) => {
    scores
      .bests(lvl)
      .then(setBests)
      .catch(() => {
        /* brak sieci albo tabeli - tablica po prostu sie nie pokaze */
      })
  }, [])

  useEffect(() => {
    if (!level) return
    setBest(readBest(level))
    setPrevBest(readBest(level))
    setHistory(readHistory(level))
    refreshBests(level)
  }, [level, refreshBests])

  // wznowiona partia tez moze byc juz martwa (zapis zrobiony tuz przed koncem),
  // a bez tego dalo sie utknac na planszy bez par i bez dosypywania
  useEffect(() => {
    if (game && !over && stuck && addsLeft === 0) setGame((g) => (g ? finish(g) : g))
  }, [game, over, stuck, addsLeft])

  // niedokonczona partia czeka w localStorage; po koncu gry nie ma czego wracac
  useEffect(() => {
    if (!game) return
    if (game.over) forgetGame()
    else
      saveGame({
        level: game.level,
        board: game.board,
        score: game.score,
        streak: game.streak,
        addsLeft: game.addsLeft,
      })
  }, [game])

  // koniec gry: rekord, historia i wyslanie wyniku (jesli wiemy, kto gral)
  useEffect(() => {
    if (!game || !game.over || sentRef.current) return
    sentRef.current = true

    const lvl = game.level
    const before = readBest(lvl)
    setPrevBest(before)
    if (game.score > before) {
      saveBest(lvl, game.score)
      setBest(game.score)
    }
    setHistory(pushHistory(lvl, game.score))

    if (person) {
      scores
        .submit(lvl, person, game.score)
        .then(() => refreshBests(lvl))
        .catch(() => {
          /* trudno, wynik zostaje lokalnie */
        })
    }
  }, [game, person, refreshBests])

  const tap = useCallback((i: number) => {
    // losujemy z gory, zeby updater zostal czysty (StrictMode wola go dwa razy)
    setGame((g) => {
      if (!g || g.over || g.board[i]?.done) return g
      if (g.selected === null) return { ...g, selected: i, hint: null }
      if (g.selected === i) return { ...g, selected: null }
      if (!canMatch(g.board, g.selected, i)) return { ...g, selected: i, hint: null }

      const pair: Pair = [g.selected, i]
      const { board: next, rows } = clearPair(g.board, pair[0], pair[1])
      let score = g.score + pairPoints(g.streak) + rows * ROW
      let addsLeft = g.addsLeft
      let board = next

      // pusta plansza: premia, swieze rozdanie i jedno dosypanie z powrotem
      // (komplet co plansze robil z tego gre bez konca - patrz symulacja w README)
      if (aliveCount(board) === 0) {
        score += SWEEP
        board = deal(g.level)
        addsLeft = Math.min(LEVELS[g.level].adds, addsLeft + 1)
      }

      return settle({
        ...g,
        board,
        score,
        streak: g.streak + 1,
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
      if (!g || g.over || g.addsLeft === 0) return g
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
      if (!g || g.over) return g
      const pair = findPair(g.board)
      if (!pair) return g
      return {
        ...g,
        hint: pair,
        streak: 0,
        selected: null,
        score: Math.max(0, g.score - LEVELS[g.level].hintCost),
      }
    })
  }, [])

  /** Start partii na wybranym poziomie (tez "jeszcze raz"). */
  const start = useCallback((lvl: Level) => {
    sentRef.current = false
    setGame(fresh(lvl, deal(lvl)))
  }, [])

  /** Powrot do wyboru poziomu - biezaca partia przepada. */
  const toMenu = useCallback(() => {
    sentRef.current = false
    forgetGame()
    setGame(null)
  }, [])

  /** "Czyj to wynik?" na karcie konca gry - zapamietujemy i wysylamy. */
  const claim = useCallback(
    (who: Person) => {
      savePerson(who)
      setPerson(who)
      if (!level) return
      scores
        .submit(level, who, score)
        .then(() => refreshBests(level))
        .catch(() => {
          /* trudno */
        })
    },
    [level, score, refreshBests],
  )

  // podpowiedz i blysk same gasna
  useEffect(() => {
    if (!game?.hint) return
    const t = setTimeout(() => setGame((g) => (g ? { ...g, hint: null } : g)), HINT_MS)
    return () => clearTimeout(t)
  }, [game?.hint])

  useEffect(() => {
    if (!game?.flash) return
    const t = setTimeout(() => setGame((g) => (g ? { ...g, flash: null } : g)), FLASH_MS)
    return () => clearTimeout(t)
  }, [game?.flash])

  const mult = multiplier(game?.streak ?? 0)
  const mood: Mood = over
    ? 'over'
    : stuck
      ? 'stuck'
      : mult >= 4
        ? 'wow'
        : mult >= 2
          ? 'happy'
          : 'calm'

  return {
    game,
    level,
    left: game ? aliveCount(game.board) : 0,
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
    start,
    toMenu,
    claim,
  }
}
