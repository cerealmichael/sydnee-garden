/**
 * Wspolna tablica wynikow. Z Supabase oboje widzicie swoje rekordy obok siebie;
 * bez kluczy leci to samo po localStorage, tyle ze widac tylko siebie.
 * Kazdy poziom trudnosci ma wlasna tablice.
 */

import { supabase } from '../../lib/supabase'
import type { Person } from '../../lib/person'
import type { Level } from './levels'

/** Nazwa gry w tabeli - jedna tabela obsluzy tez nastepne gry i poziomy. */
const game = (level: Level) => `numba-match:${level}`

export type Bests = Partial<Record<Person, number>>

export type ScoresApi = {
  /** najlepszy wynik kazdej osoby na tym poziomie */
  bests: (level: Level) => Promise<Bests>
  submit: (level: Level, author: Person, score: number) => Promise<void>
}

const LOCAL_KEY = 'numbers:bests'

type LocalBests = Partial<Record<Level, Bests>>

function localScores(): ScoresApi {
  const read = (): LocalBests => {
    try {
      return JSON.parse(localStorage.getItem(LOCAL_KEY) || '{}')
    } catch {
      return {}
    }
  }

  return {
    bests: async (level) => read()[level] ?? {},
    submit: async (level, author, score) => {
      const all = read()
      const forLevel = all[level] ?? {}
      if (score <= (forLevel[author] ?? 0)) return
      try {
        localStorage.setItem(
          LOCAL_KEY,
          JSON.stringify({ ...all, [level]: { ...forLevel, [author]: score } }),
        )
      } catch {
        /* trudno */
      }
    },
  }
}

function supabaseScores(client: NonNullable<typeof supabase>): ScoresApi {
  return {
    bests: async (level) => {
      const { data, error } = await client
        .from('scores')
        .select('author, score')
        .eq('game', game(level))
        .order('score', { ascending: false })
      if (error) throw error

      const out: Bests = {}
      for (const row of (data ?? []) as { author: Person; score: number }[]) {
        // posortowane malejaco, wiec pierwszy wpis osoby jest jej rekordem
        if (out[row.author] === undefined) out[row.author] = row.score
      }
      return out
    },

    submit: async (level, author, score) => {
      const { error } = await client.from('scores').insert({ game: game(level), author, score })
      if (error) throw error
    },
  }
}

export const scores: ScoresApi = supabase ? supabaseScores(supabase) : localScores()
