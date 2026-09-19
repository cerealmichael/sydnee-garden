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
/** parzysta liczba cyfr, inaczej jedna zawsze zostanie na planszy */
export const START_ROWS = 4

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

/** Wszystkie pary, ktore da sie teraz zlozyc. */
export function allPairs(board: Board): Pair[] {
  const out: Pair[] = []
  for (let i = 0; i < board.length; i++) {
    if (board[i].done) continue
    for (const j of partners(board, i)) {
      if (fits(board[i].v, board[j].v)) out.push([i, j])
    }
  }
  return out
}

function shuffle<T>(items: T[]): T[] {
  const a = [...items]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

/**
 * Cyfry do rozdania losowane **parami**: albo dwie takie same, albo dwie do 10.
 * Dzieki temu caly multizbior da sie sparowac - przy niezaleznym losowaniu bardzo
 * czesto sie nie da (np. nieparzysta liczba piatek) i wyczyszczenie planszy jest
 * niemozliwe, choc plansza wyglada niewinnie. Potem tasujemy, wiec ulozenie jest
 * dalej losowe; gwarancja dotyczy tylko tego, co jest na planszy.
 */
function pairedDigits(cells: number): number[] {
  const out: number[] = []
  while (out.length < cells) {
    const d = 1 + Math.floor(Math.random() * 9)
    // polowa par "takie same", polowa "do dziesieciu" (dla 5 to i tak to samo)
    out.push(d, Math.random() < 0.5 ? d : 10 - d)
  }
  return shuffle(out.slice(0, cells))
}

/** Jedna losowa rozgrywka do konca - zwraca, ile cyfr zostalo na planszy. */
function playout(start: Board): number {
  let board = start

  for (let guard = 0; guard < 500; guard++) {
    const pairs = allPairs(board)
    if (pairs.length === 0) break
    const [a, b] = pairs[Math.floor(Math.random() * pairs.length)]
    board = clearPair(board, a, b).board
  }

  return aliveCount(board)
}

export type Solvability = {
  /** najlepszy wynik z prob: ile cyfr zostalo w najlepszej rozgrywce */
  left: number
  /** jaka czesc losowych rozgrywek wyczyscila plansze do zera */
  winRate: number
}

/**
 * Jak bardzo plansza wybacza. Puszczamy kilkadziesiat losowych rozgrywek bez
 * dosypywania: `left === 0` znaczy, ze istnieje linia czyszczaca wszystko,
 * a `winRate` mowi, jak latwo na nia trafic - stad bierze sie poziom trudnosci.
 */
export function solvability(board: Board, tries = 40): Solvability {
  let left = Infinity
  let wins = 0

  for (let i = 0; i < tries; i++) {
    const rest = playout(board)
    if (rest === 0) wins += 1
    if (rest < left) left = rest
  }

  return { left, winRate: wins / tries }
}

export type Deal = {
  rows?: number
  /** ile losowych rozgrywek sprawdzamy na kandydacie */
  tries?: number
  /** widelki na "wybaczalnosc" planszy (udzial wygranych losowych rozgrywek) */
  minWinRate?: number
  maxWinRate?: number
}

/**
 * Nowe rozdanie. Kazdy kandydat ma sparowalny multizbior, a do tego sprawdzamy
 * losowymi rozgrywkami, czy **da sie go wyczyscic do zera bez dosypywania** -
 * inaczej "zagraj madrze" byloby pustym haslem. Widelki na winRate decyduja,
 * czy plansza jest wyrozumiala (latwy), czy trzeba przy niej pomyslec (trudny).
 */
export function dealBoard({
  rows = START_ROWS,
  tries = 40,
  minWinRate = 0,
  maxWinRate = 1,
}: Deal = {}): Board {
  const cells = rows * WIDTH
  // przy nieparzystej liczbie cyfr jedna zawsze zostanie - takiej planszy nie da
  // sie wyczyscic do zera nawet teoretycznie, wiec tyle wlasnie wymagamy
  const perfect = cells % 2
  let best: Board | null = null
  let bestMiss = Infinity

  for (let attempt = 0; attempt < 40; attempt++) {
    const board: Board = pairedDigits(cells).map((v) => ({ v, done: false }))
    const { left, winRate } = solvability(board, tries)
    if (left > perfect) continue // nie do wyczyszczenia - odrzucamy
    if (winRate >= minWinRate && winRate <= maxWinRate) return board

    const miss = winRate < minWinRate ? minWinRate - winRate : winRate - maxWinRate
    if (miss < bestMiss) {
      bestMiss = miss
      best = board
    }
  }

  // awaryjnie: byle nie martwa plansza (w praktyce nieosiagalne)
  return best ?? pairedDigits(cells).map((v) => ({ v, done: false }))
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
 *
 * Sama kopia **nie gwarantuje ruchu**: jedyna pewna nowa stycznosc to ostatnia
 * zywa cyfra obok kopii pierwszej, a to nie musi byc para. Dlatego gdy po
 * dosypaniu nadal nie ma pary, dokladamy jeszcze jedna kopie ostatniej cyfry -
 * laduje tuz za kopia tej samej cyfry, wiec para jest zawsze. Dosypanie nigdy
 * nie konczy gry przez przypadek.
 */
export function addNumbers(board: Board) {
  const alive = board.filter((c) => !c.done)
  const next: Board = [...board, ...alive.map((c) => ({ v: c.v, done: false }))]

  if (alive.length > 0 && findPair(next) === null) {
    next.push({ v: alive[alive.length - 1].v, done: false })
  }

  return { board: next, from: board.length }
}
