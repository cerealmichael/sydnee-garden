import FlowerSvg from './FlowerSvg'
import type { Flower } from './api'
import s from './Meadow.module.css'

type Props = {
  flowers: Flower[]
  selected: string | null
  onSelect: (id: string | null) => void
}

/** Wspolna laka - kwiatki stoja tam, gdzie je zasadzono. */
export default function Meadow({ flowers, selected, onSelect }: Props) {
  return (
    <div className={s.meadow} onPointerDown={() => onSelect(null)}>
      {/* pole ma staly aspekt 100:76, wiec wspolrzedne kwiatkow (0..1)
          pokrywaja sie z elipsa trawy niezaleznie od wysokosci ekranu */}
      <div className={s.field}>
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
              zIndex: Math.round(flower.y * 1000),
            }}
            onPointerDown={(e) => {
              e.stopPropagation()
              onSelect(selected === flower.id ? null : flower.id)
            }}
          >
            <FlowerSvg strokes={flower.strokes} className={s.art} />
          </button>
        ))}

        {flowers.length === 0 && <p className={s.empty}>Pusto. Zasadź pierwszego kwiatka 🌱</p>}
      </div>
    </div>
  )
}
