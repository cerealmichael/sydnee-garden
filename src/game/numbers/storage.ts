/**
 * Pamiec gry na tym urzadzeniu: niedokonczona partia, rekord i kilka ostatnich
 * wynikow. Wszystko w localStorage, wiec kazdy zapis jest w try/catch -
 * w prywatnym oknie Safari te wywala wyjatkiem.
 */

import type { Board } from './rules'

const STATE_KEY = 'numbers:state'
const BEST_KEY = 'numbers:best'
const HISTORY_KEY = 'numbers:history'

const HISTORY_LIMIT = 8

export type SavedGame = {
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

export function readBest(): number {
  try {
    return Number(localStorage.getItem(BEST_KEY)) || 0
  } catch {
    return 0
  }
}

export function saveBest(score: number) {
  try {
    localStorage.setItem(BEST_KEY, String(score))
  } catch {
    /* trudno */
  }
}

export function readHistory(): HistoryEntry[] {
  try {
    const data = JSON.parse(localStorage.getItem(HISTORY_KEY) || '[]')
    return Array.isArray(data) ? (data as HistoryEntry[]) : []
  } catch {
    return []
  }
}

/** Dopisuje wynik na poczatek i przycina liste. Zwraca nowa historie. */
export function pushHistory(score: number): HistoryEntry[] {
  const next = [{ score, at: new Date().toISOString() }, ...readHistory()].slice(0, HISTORY_LIMIT)
  try {
    localStorage.setItem(HISTORY_KEY, JSON.stringify(next))
  } catch {
    /* trudno */
  }
  return next
}
