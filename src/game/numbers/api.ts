/**
 * Wspolna tablica wynikow. Z Supabase oboje widzicie swoje rekordy obok siebie;
 * bez kluczy leci to samo po localStorage, tyle ze widac tylko siebie.
 */

import { supabase } from '../../lib/supabase'
import type { Person } from '../../lib/person'

/** Nazwa gry w tabeli - jedna tabela obsluzy tez nastepne gry. */
const GAME = 'numbers'

export type Bests = Partial<Record<Person, number>>

export type ScoresApi = {
  /** najlepszy wynik kazdej osoby */
  bests: () => Promise<Bests>
  submit: (author: Person, score: number) => Promise<void>
}

const LOCAL_KEY = 'numbers:bests'

function localScores(): ScoresApi {
  const read = (): Bests => {
    try {
      return JSON.parse(localStorage.getItem(LOCAL_KEY) || '{}')
    } catch {
      return {}
    }
  }

  return {
    bests: async () => read(),
    submit: async (author, score) => {
      const all = read()
      if (score <= (all[author] ?? 0)) return
      try {
        localStorage.setItem(LOCAL_KEY, JSON.stringify({ ...all, [author]: score }))
      } catch {
        /* trudno */
      }
    },
  }
}

function supabaseScores(client: NonNullable<typeof supabase>): ScoresApi {
  return {
    bests: async () => {
      const { data, error } = await client
        .from('scores')
        .select('author, score')
        .eq('game', GAME)
        .order('score', { ascending: false })
      if (error) throw error

      const out: Bests = {}
      for (const row of (data ?? []) as { author: Person; score: number }[]) {
        // posortowane malejaco, wiec pierwszy wpis osoby jest jej rekordem
        if (out[row.author] === undefined) out[row.author] = row.score
      }
      return out
    },

    submit: async (author, score) => {
      const { error } = await client.from('scores').insert({ game: GAME, author, score })
      if (error) throw error
    },
  }
}

export const scores: ScoresApi = supabase ? supabaseScores(supabase) : localScores()
