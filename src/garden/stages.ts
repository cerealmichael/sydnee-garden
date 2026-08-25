import type { Watering } from './api'
import { today } from '../lib/person'

/** Tyle podlan potrzeba na jeden kwiatek (2 osoby x 7 dni). */
export const PER_FLOWER = 14

export const STAGE_NAMES = ['Nasionko', 'Kiełek', 'Łodyżka', 'Pączek', 'Kwiat'] as const

/** Progi (liczba podlan), po ktorych roslina wchodzi w kolejne stadium. */
const THRESHOLDS = [0, 2, 5, 9, 12]

export function stageFor(progress: number) {
  let stage = 0
  for (let i = 0; i < THRESHOLDS.length; i++) if (progress >= THRESHOLDS[i]) stage = i
  return stage
}

const dayBefore = (day: string, back: number) => {
  const d = new Date(`${day}T12:00:00`)
  d.setDate(d.getDate() - back)
  return today(d)
}

/** Ile dni z rzedu podlaliscie OBOJE (liczac od dzis albo wczoraj). */
export function streakOf(waterings: Watering[], now = today()) {
  const both = new Set<string>()
  const byDay = new Map<string, Set<string>>()
  for (const w of waterings) {
    const set = byDay.get(w.day) ?? new Set<string>()
    set.add(w.person)
    byDay.set(w.day, set)
    if (set.size === 2) both.add(w.day)
  }

  // dzis moze byc jeszcze niedokonczone - wtedy liczymy od wczoraj
  let start = both.has(now) ? 0 : 1
  if (start === 1 && !both.has(dayBefore(now, 1))) return 0

  let streak = 0
  while (both.has(dayBefore(now, start))) {
    streak++
    start++
  }
  return streak
}
