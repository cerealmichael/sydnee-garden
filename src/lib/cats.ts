/**
 * Katalog kotkow. Pliki leza w public/cats/ i sa robione skryptem:
 *   python3 scripts/prep-cats.py <plik.png>:<nazwa>
 * Po dodaniu nowego pliku dopisz go tutaj.
 */
export const CATS = {
  classic: 'Kotek',
  donut: 'Kotek z pączkiem',
  pizza: 'Kotek z pizzą',
  watermelon: 'Kotek z arbuzem',
  unicorn: 'Kotek jednorożec',
  gift: 'Kotek w kokardce',
  mail: 'Kotek z listem',
  reading: 'Kotek z książką',
  guitar: 'Kotek z gitarą',
  cool: 'Kotek w okularach',
  fluffy: 'Puchaty kotek',
  mochi: 'Kotek z mochi',
  duo: 'Dwa kotki',
} as const

export type CatName = keyof typeof CATS

export const catSrc = (name: CatName) => `/cats/${name}.png`
