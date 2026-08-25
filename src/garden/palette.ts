/** Pastelowe kredki. Poza tym mozna wybrac dowolny kolor (natywny picker). */
export const PALETTE = [
  '#FF9FB6', // róż
  '#FF7EA8', // ciemniejszy róż
  '#FFB48A', // koral
  '#FFD98A', // żółty
  '#FFF0A8', // kremowy
  '#C9EFA8', // seledyn
  '#8FD08A', // zielony
  '#5FA88E', // szałwia
  '#9FD8F0', // błękit
  '#8FB8FF', // chaber
  '#C6B4FF', // liliowy
  '#E6A8E0', // wrzos
  '#FFFFFF', // biały
  '#6E5A6B', // ciemny fiolet (kontury)
] as const

/** Grubosci kreski jako ulamek boku kwadratu rysowania. */
export const BRUSHES = [0.012, 0.026, 0.05, 0.09] as const

const CUSTOM_KEY = 'garden:custom-colors'
const MAX_CUSTOM = 4

export function readCustom(): string[] {
  try {
    const v = JSON.parse(localStorage.getItem(CUSTOM_KEY) || '[]')
    return Array.isArray(v) ? v.slice(0, MAX_CUSTOM) : []
  } catch {
    return []
  }
}

export function saveCustom(colors: string[]) {
  try {
    localStorage.setItem(CUSTOM_KEY, JSON.stringify(colors.slice(0, MAX_CUSTOM)))
  } catch {
    /* prywatne okno - trudno */
  }
}
