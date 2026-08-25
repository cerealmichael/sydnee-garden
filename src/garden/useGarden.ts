import { useCallback, useEffect, useMemo, useState } from 'react'
import { garden, type Watering } from './api'
import { PER_FLOWER, stageFor, streakOf } from './stages'
import { today, type Person } from '../lib/person'

export function useGarden(person: Person | null) {
  const [waterings, setWaterings] = useState<Watering[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  const refresh = useCallback(async () => {
    try {
      setWaterings(await garden.list())
      setError(null)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Nie udało się pobrać ogródka')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    refresh()
    return garden.subscribe(refresh)
  }, [refresh])

  const day = today()

  const state = useMemo(() => {
    const total = waterings.length
    const progress = total % PER_FLOWER
    const todayBy = new Set(waterings.filter((w) => w.day === day).map((w) => w.person))
    return {
      total,
      progress,
      flowers: Math.floor(total / PER_FLOWER),
      stage: stageFor(progress),
      streak: streakOf(waterings, day),
      todayBy,
      canWater: person !== null && !todayBy.has(person),
    }
  }, [waterings, day, person])

  const water = useCallback(async () => {
    if (!person || busy || !state.canWater) return
    setBusy(true)
    // optymistycznie - zeby kwiatek urosl od razu pod palcem
    setWaterings((all) => [...all, { person, day }])
    try {
      await garden.water(person, day)
      await refresh()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Podlewanie nie doszło')
      await refresh()
    } finally {
      setBusy(false)
    }
  }, [person, busy, state.canWater, day, refresh])

  return { ...state, loading, error, busy, water }
}
