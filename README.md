# Ogródek

Prywatna apka-prezent. PWA otwierana w Safari na iPhonie (Dodaj do ekranu początkowego).

## Stack

Vite + React + TypeScript. Routing: react-router-dom. Docelowo: matter.js (Merge), Supabase (dane), deploy na Vercel.

## Zasady

- mobile-first, tylko portret, `100dvh` zamiast `100vh`
- touch-first: zero `:hover`, stany przez `:active`
- pastele, zaokrąglenia 20px+, font Baloo 2
- małe pliki, jeden komponent = jeden plik (`.tsx` + `.module.css` obok)
- nowe biblioteki tylko po ustaleniu

## Uruchomienie

```bash
npm install
npm run dev        # --host jest włączony, więc wchodzisz z iPhone'a po LAN
npm run build
npm run preview
```

## Struktura

```
public/
  manifest.webmanifest   # PWA
  sw.js                  # minimalny service worker (rejestrowany tylko na prod)
  icons/                 # generowane skryptem, nie ruszać ręcznie
  cats/                  # grafiki kotków (PNG z alfą)
scripts/pngkit.py        # mini-toolkit PNG (czysty Python, bez zależności)
scripts/prep-cats.py     # obróbka nowych grafik kotków
scripts/gen-icons.py     # składanie ikon PWA
supabase/schema.sql      # tabela flowers + RLS + realtime
src/
  garden/                # Ogrodek: DrawPad, Meadow, api, hook, strokes, spot
  game/merge/            # gra: levels, engine (matter.js), render, hook, UI
  screens/               # Hub, Garden, Merge, Letter
  components/            # Screen, TopBar, Tile, Cat, CatBadge, Placeholder, RotateNotice
  lib/cats.ts            # katalog grafik kotków
  lib/person.ts          # kto sadzi (Tomek/Sydney)
  lib/supabase.ts        # klient albo null, gdy brak env
  lib/registerSW.ts
  index.css              # tokeny palety + reset + safe-area
```

Ikony przegenerujesz przez `npm run icons` (wymaga `python3`).

## Ogródek (Supabase)

Rysujesz kwiatka palcem i sadzisz go na wspólnej łące. Kwiatki obu osób stoją obok siebie,
tapnięcie pokazuje, kto i kiedy zasadził. Druga osoba widzi nowy kwiatek na żywo (realtime).

Rysunek trzymamy **wektorowo**, nie jako obrazek: każda kreska to kolor, grubość i punkty
znormalizowane do 0..1 (`src/garden/strokes.ts`). Dzięki temu jeden kwiatek waży ~700 bajtów
w bazie i skaluje się ostro na każdym ekranie — od miniatury na łące po podgląd.

Miejsce na łące wybiera `spot.ts`: losuje kilkunastu kandydatów wewnątrz elipsy trawy
i bierze tego najdalszego od już zasadzonych. Pozycja zapisuje się razem z kwiatkiem,
więc potem już się nie rusza.

Włączenie:

1. Nowy projekt na supabase.com → SQL Editor → wklej `supabase/schema.sql` → Run
2. Project Settings → API: skopiuj URL i klucz `anon`
3. Vercel → Settings → Environment Variables:
   `VITE_SUPABASE_URL` i `VITE_SUPABASE_ANON_KEY` → redeploy

**Bez tych zmiennych apka nadal działa** — Ogródek chodzi wtedy na localStorage
(wygodne w dev, ale każda przeglądarka ma swój własny ogródek).

Kto jest kim siedzi w `PEOPLE` w `src/lib/person.ts`. Wybór osoby zapisuje się
w localStorage, więc pytanie pada raz na telefon.

## Pusheen Merge

Suika-like na matter.js. Logika siedzi w `src/game/merge/`:

- `levels.ts` — drabinka 11 kotków (promień jako ułamek szerokości planszy + punkty)
- `engine.ts` — świat matter.js, stały krok 1/60, łączenie par po `collisionStart`,
  wykrywanie przegranej (kotek ponad linią, wyhamowany, przez 900 ms)
- `render.ts` — rysowanie na canvasie (plansza, linia, celownik, kotki, iskierki)
- `useMergeGame.ts` — spina to z Reactem: rozmiar (ResizeObserver + dpr), pętla rAF,
  pointer events, kolejka 3 następnych, wynik i rekord w localStorage

Dwa jednorożce znikają i dają bonus — jak dwa arbuzy w oryginale.

## Grafika

Kotki to PNG-8 z paletą w `public/cats/` (tło wycięte, przycięte, dłuższy bok 448 px,
128 kolorów — przy płaskich grafikach niewidoczne, a plik schodzi z ~190 kB do ~35 kB).
Katalog nazw trzyma `src/lib/cats.ts`, wyświetla je `Cat.tsx`, a `CatBadge.tsx` wsadza w kółko.

Dodanie nowego kotka:

```bash
python3 scripts/prep-cats.py ~/Downloads/nowy.png:sleepy   # -> public/cats/sleepy.png
# potem dopisz 'sleepy' do CATS w src/lib/cats.ts
npm run icons                                              # opcjonalnie, jeśli ma być ikoną appki
```

`prep-cats.py` wycina czarne tło flood-fillem od krawędzi, przycina marginesy i skaluje.
`gen-icons.py` składa ikonę PWA: wybrany kotek na pastelowym gradiencie (domyślnie `classic`).
