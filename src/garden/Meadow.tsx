import FlowerSvg from './FlowerSvg'
import { usePanZoom } from './usePanZoom'
import { worldSize } from './spot'
import type { Flower } from './api'
import s from './Meadow.module.css'

type Props = {
  flowers: Flower[]
  selected: string | null
  onSelect: (id: string | null) => void
}

/** Bazowy rozmiar laki w px przy jednym "ekranie" - reszta to zoom. */
const BASE = 900

/** Wspolna laka - kwiatki stoja tam, gdzie je zasadzono. Palec przesuwa, dwa palce skaluja. */
export default function Meadow({ flowers, selected, onSelect }: Props) {
  const grow = worldSize(flowers.length)
  const world = { w: BASE * grow, h: BASE * 0.76 * grow }
  const { viewportRef, worldRef, fit, wasTap } = usePanZoom({ world })

  return (
    <div className={s.viewport} ref={viewportRef} onPointerUp={() => wasTap() && onSelect(null)}>
      <div
        className={s.world}
        ref={worldRef}
        style={{ width: world.w, height: world.h }}
      >
        <svg
          viewBox="0 0 100 76"
          preserveAspectRatio="none"
          className={s.ground}
          aria-hidden="true"
        >
          <ellipse cx="50" cy="46" rx="47" ry="27" fill="#7FBF7A" />
          <ellipse cx="50" cy="42" rx="47" ry="27" fill="#A7DDA0" />
          <ellipse cx="50" cy="40" rx="40" ry="22" fill="#B6E5AE" opacity="0.7" />
        </svg>

        {flowers.map((flower) => (
          <button
            key={flower.id}
            className={selected === flower.id ? `${s.flower} ${s.on}` : s.flower}
            style={{
              left: `${flower.x * 100}%`,
              top: `${flower.y * 100}%`,
              width: `${22 / grow}%`,
              zIndex: Math.round(flower.y * 1000),
            }}
            onPointerUp={(e) => {
              if (!wasTap()) return
              e.stopPropagation()
              onSelect(selected === flower.id ? null : flower.id)
            }}
          >
            <FlowerSvg strokes={flower.strokes} className={s.art} />
          </button>
        ))}
      </div>

      {flowers.length === 0 && <p className={s.empty}>Pusto. Zasadź pierwszego kwiatka 🌱</p>}

      <button className={s.reset} onClick={fit} aria-label="Pokaż całą łąkę">
        ⤢
      </button>
    </div>
  )
}
