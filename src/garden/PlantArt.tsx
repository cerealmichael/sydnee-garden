type Props = {
  /** 0 nasionko ... 4 kwiat */
  stage: number
  className?: string
}

const SOIL = '#C9A27E'
const SOIL_D = '#B08A66'
const STEM = '#6FA86A'
const LEAF = '#8FD08A'
const LEAF_D = '#6FA86A'
const PETAL = '#FFB7CE'
const PETAL_D = '#FF97B8'
const HEART = '#FFE08A'
const SEED = '#8C6A4A'

/** Rosnaca roslinka. Kazde stadium dokłada jeden element. */
export default function PlantArt({ stage, className }: Props) {
  const grown = Math.min(stage, 4)

  return (
    <svg viewBox="0 0 140 150" className={className} aria-hidden="true">
      {/* ziemia */}
      <ellipse cx="70" cy="132" rx="46" ry="13" fill={SOIL_D} />
      <ellipse cx="70" cy="128" rx="46" ry="13" fill={SOIL} />

      {grown === 0 && <ellipse cx="70" cy="124" rx="7" ry="9" fill={SEED} />}

      {grown >= 1 && (
        <g>
          {/* lodyga - rosnie z kazdym stadium */}
          <path
            d={`M70 126 C 68 ${110 - grown * 12}, 72 ${104 - grown * 14}, 70 ${
              98 - grown * 16
            }`}
            fill="none"
            stroke={STEM}
            strokeWidth="6"
            strokeLinecap="round"
          />
          {/* pierwsze listki */}
          <path d="M70 112 C 52 108, 46 96, 62 96 C 70 96, 72 106, 70 112 Z" fill={LEAF} />
          <path d="M70 110 C 88 104, 94 92, 78 92 C 70 92, 68 104, 70 110 Z" fill={LEAF_D} />
        </g>
      )}

      {grown >= 2 && (
        <path d="M70 86 C 50 82, 44 68, 62 68 C 71 68, 73 79, 70 86 Z" fill={LEAF} />
      )}

      {grown === 3 && (
        <g>
          {/* paczek */}
          <ellipse cx="70" cy="42" rx="13" ry="17" fill={PETAL_D} />
          <ellipse cx="70" cy="44" rx="8" ry="13" fill={PETAL} />
        </g>
      )}

      {grown >= 4 && (
        <g>
          {/* kwiat */}
          {[0, 72, 144, 216, 288].map((deg) => (
            <ellipse
              key={deg}
              cx="70"
              cy="24"
              rx="12"
              ry="18"
              fill={deg % 144 === 0 ? PETAL : PETAL_D}
              transform={`rotate(${deg} 70 42)`}
            />
          ))}
          <circle cx="70" cy="42" r="10" fill={HEART} />
        </g>
      )}
    </svg>
  )
}
