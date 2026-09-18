/**
 * Punktacja. Orygnal daje sucho 1 punkt za pare - tu para tez jest baza, ale
 * oplaca sie grac dalej bez dosypywania i podpowiedzi, bo seria podbija mnoznik.
 */

export const PAIR = 10
/** za kazdy rzad, ktory zniknal z planszy */
export const ROW = 50
/** za wyczyszczenie calej planszy */
export const SWEEP = 200
/** za kazde niewykorzystane dosypanie, doliczane na koniec gry */
export const SPARE_ADD = 25
/** podpowiedz kosztuje tyle punktow i zbija serie */
export const HINT = 5

export const MAX_MULTIPLIER = 5

/** Co trzecia para pod rzad to kolejny mnoznik: 1, 1, 1, 2, 2, 2, 3... */
export const multiplier = (streak: number) =>
  Math.min(MAX_MULTIPLIER, 1 + Math.floor(streak / 3))

export const pairPoints = (streak: number) => PAIR * multiplier(streak)
