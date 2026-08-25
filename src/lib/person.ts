import type { CatName } from './cats'

export type Person = 'a' | 'b'

export const PEOPLE: Record<Person, { name: string; cat: CatName; color: string }> = {
  a: { name: 'Tomek', cat: 'classic', color: 'var(--mint)' },
  b: { name: 'Sydney', cat: 'fluffy', color: 'var(--pink)' },
}

const KEY = 'garden:person'

export function readPerson(): Person | null {
  try {
    const v = localStorage.getItem(KEY)
    return v === 'a' || v === 'b' ? v : null
  } catch {
    return null
  }
}

export function savePerson(person: Person) {
  try {
    localStorage.setItem(KEY, person)
  } catch {
    /* prywatne okno - trudno */
  }
}

/** Lokalna data YYYY-MM-DD (nie UTC - dzien ma sie zmieniac o polnocy u nas). */
export function today(date = new Date()) {
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`
}
