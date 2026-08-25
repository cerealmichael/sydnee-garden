import { useCallback, useEffect, useState } from 'react'
import { letterApi, type Letter } from './api'
import { shrinkImage } from '../lib/image'

export function useLetter() {
  const [letter, setLetter] = useState<Letter>({ body: '', photo: null, updated_at: null })
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const refresh = useCallback(async () => {
    try {
      setLetter(await letterApi.get())
      setError(null)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Nie udało się wczytać listu')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    refresh()
    return letterApi.subscribe(refresh)
  }, [refresh])

  const save = useCallback(
    async (body: string, photo: string | null) => {
      setBusy(true)
      try {
        await letterApi.save({ body, photo })
        await refresh()
        return true
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Nie udało się zapisać')
        return false
      } finally {
        setBusy(false)
      }
    },
    [refresh],
  )

  /** zmniejsza zdjecie i wysyla - zwraca adres do podgladu */
  const upload = useCallback(async (file: File) => {
    setBusy(true)
    try {
      return await letterApi.uploadPhoto(await shrinkImage(file))
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Nie udało się wgrać zdjęcia')
      return null
    } finally {
      setBusy(false)
    }
  }, [])

  return { letter, loading, busy, error, save, upload }
}
