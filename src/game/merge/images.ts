import { catSrc, type CatName } from '../../lib/cats'

export type CatImages = Partial<Record<CatName, HTMLImageElement>>

/** Wczytuje grafiki kotkow zanim odpalimy gre (zeby nic nie mrugalo). */
export function loadCats(names: readonly CatName[]): Promise<CatImages> {
  return Promise.all(
    names.map(
      (name) =>
        new Promise<[CatName, HTMLImageElement | null]>((resolve) => {
          const img = new Image()
          img.onload = () => resolve([name, img])
          img.onerror = () => resolve([name, null])
          img.src = catSrc(name)
        }),
    ),
  ).then((pairs) => {
    const out: CatImages = {}
    for (const [name, img] of pairs) if (img) out[name] = img
    return out
  })
}
