/**
 * Katalog kotkow. Pliki leza w public/cats/ i sa robione skryptem:
 *   python3 scripts/prep-cats.py <plik.png>:<nazwa>
 * Po dodaniu nowego pliku dopisz go tutaj.
 */
export const CATS = {
  classic: 'Kotek',
  donut: 'Kotek z pączkiem',
  unicorn: 'Kotek jednorożec',
  pizza: 'Kotek z pizzą',
  gift: 'Kotek w kokardce',
} as const

export type CatName = keyof typeof CATS

export const catSrc = (name: CatName) => `/cats/${name}.png`
