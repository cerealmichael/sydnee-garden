import { useCloud } from '../lib/cloud'
import s from './CloudBadge.module.css'

/**
 * Widoczne ostrzezenie, gdy dane NIE sa wspolne. Przy dzialajacej
 * synchronizacji nie pokazuje niczego.
 */
export default function CloudBadge() {
  const cloud = useCloud()

  if (cloud.kind === 'ok' || cloud.kind === 'checking') return null

  return (
    <p className={s.badge}>
      {cloud.kind === 'local' ? (
        <>
          <strong>Tryb lokalny</strong> — dane zostają tylko na tym urządzeniu.
          Brakuje kluczy Supabase w buildzie.
        </>
      ) : (
        <>
          <strong>Baza nie odpowiada</strong> — {cloud.message}
        </>
      )}
    </p>
  )
}
