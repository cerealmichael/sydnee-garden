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
src/
  screens/               # Hub, Garden, Merge, Letter
  components/            # Screen, TopBar, Tile, Cat, CatBadge, Placeholder, RotateNotice
  lib/cats.ts            # katalog grafik kotków
  lib/registerSW.ts
  index.css              # tokeny palety + reset + safe-area
```

Ikony przegenerujesz przez `npm run icons` (wymaga `python3`).

## Grafika

Kotki to PNG-i w `public/cats/` (tło wycięte, przycięte, dłuższy bok 512 px).
Katalog nazw trzyma `src/lib/cats.ts`, wyświetla je `Cat.tsx`, a `CatBadge.tsx` wsadza w kółko.

Dodanie nowego kotka:

```bash
python3 scripts/prep-cats.py ~/Downloads/nowy.png:sleepy   # -> public/cats/sleepy.png
# potem dopisz 'sleepy' do CATS w src/lib/cats.ts
npm run icons                                              # opcjonalnie, jeśli ma być ikoną appki
```

`prep-cats.py` wycina czarne tło flood-fillem od krawędzi, przycina marginesy i skaluje.
`gen-icons.py` składa ikonę PWA: wybrany kotek na pastelowym gradiencie (domyślnie `classic`).
