import { supabase } from '../lib/supabase'
import { toDataUrl } from '../lib/image'

export type Letter = {
  body: string
  /** publiczny adres zdjecia albo data URL w trybie lokalnym */
  photo: string | null
  updated_at: string | null
}

export type LetterApi = {
  get: () => Promise<Letter>
  save: (letter: Pick<Letter, 'body' | 'photo'>) => Promise<void>
  uploadPhoto: (blob: Blob) => Promise<string>
  subscribe: (cb: () => void) => () => void
}

const LOCAL_KEY = 'letter:content'
const EMPTY: Letter = { body: '', photo: null, updated_at: null }
const BUCKET = 'letter'

function localLetter(): LetterApi {
  return {
    get: async () => {
      try {
        return { ...EMPTY, ...JSON.parse(localStorage.getItem(LOCAL_KEY) || '{}') }
      } catch {
        return EMPTY
      }
    },
    save: async (letter) => {
      try {
        localStorage.setItem(
          LOCAL_KEY,
          JSON.stringify({ ...letter, updated_at: new Date().toISOString() }),
        )
      } catch {
        /* zdjecie moze nie zmiescic sie w localStorage - trudno */
      }
    },
    uploadPhoto: (blob) => toDataUrl(blob),
    subscribe: () => () => {},
  }
}

function supabaseLetter(client: NonNullable<typeof supabase>): LetterApi {
  return {
    get: async () => {
      const { data, error } = await client
        .from('letter')
        .select('body, photo, updated_at')
        .eq('id', 1)
        .maybeSingle()
      if (error) throw error
      return data ? (data as Letter) : EMPTY
    },

    save: async (letter) => {
      const { error } = await client
        .from('letter')
        .upsert({ id: 1, ...letter, updated_at: new Date().toISOString() })
      if (error) throw error
    },

    uploadPhoto: async (blob) => {
      const name = `${Date.now()}.jpg`
      const { error } = await client.storage
        .from(BUCKET)
        .upload(name, blob, { contentType: 'image/jpeg', upsert: true })
      if (error) throw error
      return client.storage.from(BUCKET).getPublicUrl(name).data.publicUrl
    },

    subscribe: (cb) => {
      const channel = client
        .channel('letter')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'letter' }, () => cb())
        .subscribe()
      return () => {
        client.removeChannel(channel)
      }
    },
  }
}

export const letterApi: LetterApi = supabase ? supabaseLetter(supabase) : localLetter()
