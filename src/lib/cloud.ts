import { useEffect, useState } from 'react'

export type CloudState =
  /** sprawdzamy polaczenie */
  | { kind: 'checking' }
  /** wszystko gra - dane sa wspolne */
  | { kind: 'ok' }
  /** brak kluczy w buildzie: dane siedza tylko na tym urzadzeniu */
  | { kind: 'local' }
  /** klucze sa, ale baza nie odpowiada (brak tabel? zle polityki? zly klucz?) */
  | { kind: 'error'; message: string }

/** Czytamy env wprost, zeby nie wciagac klienta Supabase do glownego bundla. */
const configured = Boolean(
  import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_ANON_KEY,
)

const TIMEOUT = 8000

/**
 * Jedno zapytanie na starcie, zeby wiedziec, czy pamiec jest wspolna.
 * Bez tego cichy fallback na localStorage wyglada identycznie jak dzialajaca
 * synchronizacja - do momentu, gdy druga osoba niczego nie widzi.
 */
export function useCloud() {
  const [state, setState] = useState<CloudState>(
    configured ? { kind: 'checking' } : { kind: 'local' },
  )

  useEffect(() => {
    if (!configured) return
    let alive = true

    const check = async () => {
      try {
        const { supabase } = await import('./supabase')
        if (!supabase) throw new Error('brak klienta')

        const probe = supabase.from('flowers').select('id', { head: true, count: 'exact' })
        const timeout = new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error('baza nie odpowiedziała w 8 s')), TIMEOUT),
        )
        const { error } = await Promise.race([probe, timeout])
        if (!alive) return
        setState(error ? { kind: 'error', message: error.message } : { kind: 'ok' })
      } catch (e) {
        if (!alive) return
        setState({ kind: 'error', message: e instanceof Error ? e.message : 'brak połączenia' })
      }
    }

    check()
    return () => {
      alive = false
    }
  }, [])

  return state
}
