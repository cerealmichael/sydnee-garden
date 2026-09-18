/**
 * Model planszy. Czyste funkcje, zero Reacta - dzieki temu da sie to przejsc
 * w glowie i przetestowac w konsoli.
 *
 * Plansza to jedna tablica komorek czytana jak tekst: 9 w rzedzie, potem
 * nastepny rzad. Skreslona cyfra zostaje na miejscu (znika dopiero caly pusty
 * rzad), ale przestaje istniec dla sasiedztwa - i o to chodzi w tej grze:
 * czyszczenie otwiera nowe sciezki.
 */

export const WIDTH = 9
export const START_ROWS = 3
export const MAX_ADDS = 5

export type Cell = {
  /** cyfra 1..9 */
  v: number
  /** true = juz skreslona */
  done: boolean
}

export type Board = Cell[]

export type Pair = [number, number]

const col = (i: number) => i % WIDTH

/** Para jest dobra, gdy cyfry sa rowne albo daja w sumie 10. */
export const fits = (a: number, b: number) => a === b || a + b === 10

/** Pierwsza nieskreslona cyfra dalej w kolejnosci czytania. */
function nextAlive(board: Board, i: number): number | null {
  for (let j = i + 1; j < board.length; j++) if (!board[j].done) return j
  return null
}

/**
 * Pierwsza nieskreslona cyfra w danym kierunku (w dol, na skos), z pomijaniem
 * skreslonych. Skos pilnuje kolumn, zeby nie przeskoczyl z konca rzedu na
 * poczatek nastepnego.
 */
function nextInDir(board: Board, i: number, dCol: number): number | null {
  let row = Math.floor(i / WIDTH) + 1
  let c = col(i) + dCol

  while (c >= 0 && c < WIDTH) {
    const j = row * WIDTH + c
    if (j >= board.length) return null
    if (!board[j].done) return j
    row += 1
    c += dCol
  }
  return null
}

/**
 * Kandydaci na partnera dla komorki i, zawsze o wiekszym indeksie.
 * Poziom w rzedzie zalatwia kolejnosc czytania (miedzy nimi moga byc tylko
 * skreslone), wiec zostaja: pion i dwa skosy.
 */
function partners(board: Board, i: number): number[] {
  const out: number[] = []
  const push = (j: number | null) => {
    if (j !== null && !out.includes(j)) out.push(j)
  }

  push(nextAlive(board, i))
  push(nextInDir(board, i, 0))
  push(nextInDir(board, i, 1))
  push(nextInDir(board, i, -1))
  return out
}

/** Czy te dwie komorki wolno ze soba polaczyc. */
export function canMatch(board: Board, a: number, b: number): boolean {
  if (a === b) return false
  const [lo, hi] = a < b ? [a, b] : [b, a]
  if (!board[lo] || !board[hi] || board[lo].done || board[hi].done) return false
  if (!fits(board[lo].v, board[hi].v)) return false
  return partners(board, lo).includes(hi)
}

/** Pierwsza mozliwa para (sluzy i za podpowiedz, i za test "koniec gry?"). */
export function findPair(board: Board): Pair | null {
  for (let i = 0; i < board.length; i++) {
    if (board[i].done) continue
    for (const j of partners(board, i)) {
      if (fits(board[i].v, board[j].v)) return [i, j]
    }
  }
  return null
}

export const aliveCount = (board: Board) => board.reduce((n, c) => n + (c.done ? 0 : 1), 0)

const randomDigit = () => 1 + Math.floor(Math.random() * 9)

/** Nowe rozdanie. Losujemy do skutku, zeby nie zaczynac od martwej planszy. */
export function dealBoard(rows = START_ROWS): Board {
  for (let attempt = 0; attempt < 50; attempt++) {
    const board: Board = Array.from({ length: rows * WIDTH }, () => ({
      v: randomDigit(),
      done: false,
    }))
    if (findPair(board)) return board
  }
  // praktycznie nieosiagalne, ale niech funkcja zawsze cos zwroci
  return Array.from({ length: rows * WIDTH }, () => ({ v: 5, done: false }))
}

/**
 * Skreslenie pary. Zwraca nowa plansze i liczbe rzedow, ktore po niej zniknely
 * (pusty rzad wypada w calosci, wiec kolumny zostaja rowno).
 */
export function clearPair(board: Board, a: number, b: number) {
  const next = board.map((c, i) => (i === a || i === b ? { ...c, done: true } : c))
  return dropEmptyRows(next)
}

function dropEmptyRows(board: Board) {
  const kept: Board = []
  let rows = 0

  for (let start = 0; start < board.length; start += WIDTH) {
    const row = board.slice(start, start + WIDTH)
    if (row.every((c) => c.done)) rows += 1
    else kept.push(...row)
  }

  return { board: kept, rows }
}

/**
 * Dosypanie cyfr: na koniec planszy trafia kopia tego, co jeszcze na niej
 * zostalo, w kolejnosci czytania. Zwraca tez indeks, od ktorego zaczynaja sie
 * swieze cyfry - ekran podswietla je i przewija do nich.
 */
export function addNumbers(board: Board) {
  const fresh = board.filter((c) => !c.done).map((c) => ({ v: c.v, done: false }))
  return { board: [...board, ...fresh], from: board.length }
}
