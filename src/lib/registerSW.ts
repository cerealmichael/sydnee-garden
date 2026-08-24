/** Rejestruje service workera (tylko na produkcji - w dev tylko by przeszkadzal). */
export function registerSW() {
  if (!import.meta.env.PROD) return
  if (!('serviceWorker' in navigator)) return

  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch(() => {
      /* brak SW to nie koniec swiata */
    })
  })
}
