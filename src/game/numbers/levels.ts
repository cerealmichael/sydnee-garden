/**
 * Poziomy trudnosci. W tej grze wiecej cyfr na planszy = wiecej mozliwosci,
 * wiec trudniej nie robi sie wieksza plansza, tylko:
 *  - chudsze rozdanie startowe (mniej gotowych par),
 *  - mniej dosypan,
 *  - drozsza podpowiedz.
 */

import type { CatName } from '../../lib/cats'

export type Level = 'easy' | 'hard'

export type LevelConfig = {
  label: string
  cat: CatName
  color: string
  /** rzedy w rozdaniu startowym */
  rows: number
  /** ile razy mozna dosypac cyfry */
  adds: number
  /** ile punktow kosztuje podpowiedz */
  hintCost: number
  /** widelki na liczbe par w rozdaniu startowym */
  minPairs: number
  maxPairs: number
  note: string
}

export const LEVELS: Record<Level, LevelConfig> = {
  easy: {
    label: 'Łatwy',
    cat: 'mochi',
    color: 'var(--mint)',
    rows: 3,
    adds: 5,
    hintCost: 5,
    // mediana surowego rozdania to ~16 par, wiec latwy bierze te hojniejsze polowe
    minPairs: 16,
    maxPairs: 999,
    note: '5 dosypań, tania podpowiedź, hojne rozdanie',
  },
  hard: {
    label: 'Trudny',
    cat: 'cool',
    color: 'var(--peach)',
    rows: 3,
    adds: 3,
    hintCost: 15,
    // ~7% najchudszych rozdan (ponizej 11 par praktycznie sie nie zdarza)
    minPairs: 1,
    maxPairs: 10,
    note: '3 dosypania, droga podpowiedź, skąpe rozdanie',
  },
}

export const LEVEL_KEYS = Object.keys(LEVELS) as Level[]

export const isLevel = (v: unknown): v is Level => v === 'easy' || v === 'hard'
