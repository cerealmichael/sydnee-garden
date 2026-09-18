/**
 * Pamiec gry na tym urzadzeniu: niedokonczona partia, rekord i kilka ostatnich
 * wynikow. Rekordy i historia sa osobne dla kazdego poziomu - inaczej trudny
 * nigdy by z latwym nie wygral. Wszystko w localStorage, wiec kazdy zapis jest
 * w try/catch: w prywatnym oknie Safari te wywala wyjatkiem.
 */

import { isLevel, type Level } from './levels'
import type { Board } from './rules'

const STATE_KEY = 'numbers:state'
const bestKey = (level: Level) => `numbers:best:${level}`
const historyKey = (level: Level) => `numbers:history:${level}`

const HISTORY_LIMIT = 8

export type SavedGame = {
  level: Level
  board: Board
  score: number
  streak: number
  addsLeft: number
}

export type HistoryEntry = {
  score: number
  /** ISO */
  at: string
}

export function readGame(): SavedGame | null {
  try {
    const raw = localStorage.getItem(STATE_KEY)
    if (!raw) return null
    const data = JSON.parse(raw) as SavedGame
    if (!isLevel(data.level)) return null
    if (!Array.isArray(data.board) || data.board.length === 0) return null
    if (typeof data.score !== 'number' || typeof data.addsLeft !== 'number') return null
    return data
  } catch {
    return null
  }
}

export function saveGame(game: SavedGame) {
  try {
    localStorage.setItem(STATE_KEY, JSON.stringify(game))
  } catch {
    /* trudno - gra i tak dziala, tylko nie wroci po zamknieciu */
  }
}

export function forgetGame() {
  try {
    localStorage.removeItem(STATE_KEY)
  } catch {
    /* trudno */
  }
}

export function readBest(level: Level): number {
  try {
    return Number(localStorage.getItem(bestKey(level))) || 0
  } catch {
    return 0
  }
}

export function saveBest(level: Level, score: number) {
  try {
    localStorage.setItem(bestKey(level), String(score))
  } catch {
    /* trudno */
  }
}

export function readHistory(level: Level): HistoryEntry[] {
  try {
    const data = JSON.parse(localStorage.getItem(historyKey(level)) || '[]')
    return Array.isArray(data) ? (data as HistoryEntry[]) : []
  } catch {
    return []
  }
}

/** Dopisuje wynik na poczatek i przycina liste. Zwraca nowa historie. */
export function pushHistory(level: Level, score: number): HistoryEntry[] {
  const next = [{ score, at: new Date().toISOString() }, ...readHistory(level)].slice(
    0,
    HISTORY_LIMIT,
  )
  try {
    localStorage.setItem(historyKey(level), JSON.stringify(next))
  } catch {
    /* trudno */
  }
  return next
}
