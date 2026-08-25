import { supabase } from '../lib/supabase'
import type { Person } from '../lib/person'
import type { Stroke } from './strokes'

export type Flower = {
  id: string
  author: Person
  strokes: Stroke[]
  /** notatka do kwiatka (moze byc pusta) */
  note: string
  /** miejsce na lace, 0..1 */
  x: number
  y: number
  created_at: string
}

export type NewFlower = Omit<Flower, 'id' | 'created_at'>

export type GardenApi = {
  list: () => Promise<Flower[]>
  plant: (flower: NewFlower) => Promise<void>
  remove: (id: string) => Promise<void>
  /** wola cb, gdy druga osoba cos zasadzi - zwraca funkcje odpinajaca */
  subscribe: (cb: () => void) => () => void
}

const LOCAL_KEY = 'garden:flowers'

/** Tryb bez Supabase: ogrodek siedzi w localStorage tej przegladarki. */
function localGarden(): GardenApi {
  const read = (): Flower[] => {
    try {
      return JSON.parse(localStorage.getItem(LOCAL_KEY) || '[]')
    } catch {
      return []
    }
  }

  return {
    list: async () => read(),
    plant: async (flower) => {
      const all = read()
      all.push({ ...flower, id: crypto.randomUUID(), created_at: new Date().toISOString() })
      try {
        localStorage.setItem(LOCAL_KEY, JSON.stringify(all))
      } catch {
        /* trudno */
      }
    },
    remove: async (id) => {
      const all = read().filter((f) => f.id !== id)
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
        .from('flowers')
        .select('id, author, strokes, note, x, y, created_at')
        .order('created_at', { ascending: true })
      if (error) throw error
      return (data ?? []) as Flower[]
    },

    plant: async (flower) => {
      const { error } = await client.from('flowers').insert(flower)
      if (error) throw error
    },

    remove: async (id) => {
      const { error } = await client.from('flowers').delete().eq('id', id)
      if (error) throw error
    },

    subscribe: (cb) => {
      // '*' zamiast INSERT, zeby usuniecie u drugiej osoby tez bylo widac
      const channel = client
        .channel('flowers')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'flowers' }, () => cb())
        .subscribe()
      return () => {
        client.removeChannel(channel)
      }
    },
  }
}

export const garden: GardenApi = supabase ? supabaseGarden(supabase) : localGarden()
