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
scripts/gen-icons.py     # generator ikon (czysty Python, bez zależności)
src/
  screens/               # Hub, Garden, Merge, Letter
  components/            # Screen, TopBar, Tile, CatBadge, PusheenCat, Placeholder, RotateNotice
  lib/registerSW.ts
  index.css              # tokeny palety + reset + safe-area
```

Ikony przegenerujesz przez `npm run icons` (wymaga `python3`).

## Grafika

Kotki to własny rysunek SVG (`src/components/PusheenCat.tsx`) w stylu grubego kota-bochenka —
jeden komponent, warianty przez prop `item`. Kolory trzymane w jednym miejscu na górze pliku.
