import type { CatName } from '../../lib/cats'

export type Level = {
  cat: CatName
  /** promien jako ulamek szerokosci planszy */
  r: number
  /** punkty za polaczenie DO tego poziomu */
  score: number
}

/** Drabinka ewolucji - od najmniejszego kotka do jednorozca. */
export const LEVELS: Level[] = [
  { cat: 'classic', r: 0.052, score: 1 },
  { cat: 'mochi', r: 0.066, score: 3 },
  { cat: 'fluffy', r: 0.082, score: 6 },
  { cat: 'cool', r: 0.098, score: 10 },
  { cat: 'donut', r: 0.115, score: 15 },
  { cat: 'pizza', r: 0.134, score: 21 },
  { cat: 'watermelon', r: 0.154, score: 28 },
  { cat: 'mail', r: 0.175, score: 36 },
  { cat: 'reading', r: 0.197, score: 45 },
  { cat: 'guitar', r: 0.22, score: 55 },
  { cat: 'unicorn', r: 0.244, score: 66 },
]

export const TOP_LEVEL = LEVELS.length - 1

/** Z ilu pierwszych poziomow losujemy to, co spada. */
export const DROPPABLE = 5

/** Dwa jednorozce znikaja i daja bonus. */
export const FINAL_BONUS = 150

export const randomLevel = () => Math.floor(Math.random() * DROPPABLE)
