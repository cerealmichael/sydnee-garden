/**
 * Poziomy trudnosci. W tej grze wiecej cyfr na planszy = wiecej mozliwosci,
 * wiec trudniej nie robi sie wieksza plansza, tylko:
 *  - mniej wybaczajace rozdanie (patrz `winRate` nizej),
 *  - mniej dosypan,
 *  - drozsza podpowiedz.
 *
 * Kazde rozdanie - na obu poziomach - da sie wyczyscic do zera bez dosypywania,
 * o ile gra sie madrze. Roznica jest w tym, jak latwo w ta linie trafic:
 * `winRate` to udzial losowych rozgrywek, ktore sprzataja cala plansze.
 */

import type { CatName } from '../../lib/cats'

export type Level = 'easy' | 'hard'

export type LevelConfig = {
  label: string
  cat: CatName
  color: string
  /** rzedy w rozdaniu startowym (parzysta liczba cyfr, inaczej jedna zawsze zostanie) */
  rows: number
  /** ile razy mozna dosypac cyfry */
  adds: number
  /** ile punktow kosztuje podpowiedz */
  hintCost: number
  /** ile losowych rozgrywek sprawdzamy przy szukaniu rozdania */
  tries: number
  /** widelki na wybaczalnosc rozdania */
  minWinRate: number
  maxWinRate: number
  note: string
}

export const LEVELS: Record<Level, LevelConfig> = {
  easy: {
    label: 'Łatwy',
    cat: 'mochi',
    color: 'var(--mint)',
    rows: 4,
    adds: 5,
    hintCost: 5,
    tries: 40,
    // mediana wybaczalnosci to ~0.20, wiec latwy bierze rozdania powyzej niej
    minWinRate: 0.25,
    maxWinRate: 1,
    note: '5 dosypań, tania podpowiedź, wyrozumiała plansza',
  },
  hard: {
    label: 'Trudny',
    cat: 'cool',
    color: 'var(--peach)',
    rows: 4,
    adds: 3,
    hintCost: 15,
    tries: 40,
    // plansze, przy ktorych losowa gra prawie nigdy nie sprzata wszystkiego
    minWinRate: 0,
    maxWinRate: 0.08,
    note: '3 dosypania, droga podpowiedź, wymagająca plansza',
  },
}

export const LEVEL_KEYS = Object.keys(LEVELS) as Level[]

export const isLevel = (v: unknown): v is Level => v === 'easy' || v === 'hard'
