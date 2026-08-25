import { supabase } from '../lib/supabase'
import type { Person } from '../lib/person'

export type Watering = { person: Person; day: string }

export type GardenApi = {
  list: () => Promise<Watering[]>
  water: (person: Person, day: string) => Promise<void>
  /** wola cb, gdy druga osoba podleje - zwraca funkcje odpinajaca */
  subscribe: (cb: () => void) => () => void
}

const LOCAL_KEY = 'garden:waterings'

/** Tryb bez Supabase: wszystko siedzi w localStorage tej przegladarki. */
function localGarden(): GardenApi {
  const read = (): Watering[] => {
    try {
      return JSON.parse(localStorage.getItem(LOCAL_KEY) || '[]')
    } catch {
      return []
    }
  }

  return {
    list: async () => read(),
    water: async (person, day) => {
      const all = read()
      if (all.some((w) => w.person === person && w.day === day)) return
      all.push({ person, day })
      try {
        localStorage.setItem(LOCAL_KEY, JSON.stringify(all))
      } catch {
        /* trudno */
      }
    },
    subscribe: () => () => {},
  }
}

function supabaseGarden(client: NonNullable<typeof supabase>): GardenApi {
  return {
    list: async () => {
      const { data, error } = await client
        .from('waterings')
        .select('person, day')
        .order('day', { ascending: true })
      if (error) throw error
      return (data ?? []) as Watering[]
    },

    water: async (person, day) => {
      const { error } = await client.from('waterings').insert({ person, day })
      // 23505 = ta osoba juz dzisiaj podlala, to nie jest blad
      if (error && error.code !== '23505') throw error
    },

    subscribe: (cb) => {
      const channel = client
        .channel('waterings')
        .on(
          'postgres_changes',
          { event: 'INSERT', schema: 'public', table: 'waterings' },
          () => cb(),
        )
        .subscribe()
      return () => {
        client.removeChannel(channel)
      }
    },
  }
}

export const garden: GardenApi = supabase ? supabaseGarden(supabase) : localGarden()
