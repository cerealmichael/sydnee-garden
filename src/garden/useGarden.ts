import { useCallback, useEffect, useState } from 'react'
import { garden, type Flower } from './api'
import { freeSpot } from './spot'
import type { Stroke } from './strokes'
import type { Person } from '../lib/person'

export function useGarden() {
  const [flowers, setFlowers] = useState<Flower[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  const refresh = useCallback(async () => {
    try {
      setFlowers(await garden.list())
      setError(null)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Nie udało się wczytać ogródka')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    refresh()
    return garden.subscribe(refresh)
  }, [refresh])

  const plant = useCallback(
    async (author: Person, strokes: Stroke[], note: string) => {
      if (busy) return false
      setBusy(true)
      try {
        const { x, y } = freeSpot(flowers)
        await garden.plant({ author, strokes, note, x, y })
        await refresh()
        return true
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Nie udało się zasadzić')
        return false
      } finally {
        setBusy(false)
      }
    },
    [busy, flowers, refresh],
  )

  const remove = useCallback(
    async (id: string) => {
      // optymistycznie - kwiatek znika od razu spod palca
      setFlowers((all) => all.filter((f) => f.id !== id))
      try {
        await garden.remove(id)
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Nie udało się usunąć')
      }
      await refresh()
    },
    [refresh],
  )

  const mine = (person: Person | null) =>
    person ? flowers.filter((f) => f.author === person).length : 0

  return { flowers, loading, error, busy, plant, remove, mine }
}
