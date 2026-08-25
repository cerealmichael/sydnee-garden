import s from './GiftBox.module.css'

type Props = {
  phase: 'closed' | 'opening' | 'open'
  onOpen: () => void
}

const BOX = '#FF9FB6'
const BOX_D = '#F27E9B'
const RIBBON = '#FFF3F7'
const SPARKS = [0, 40, 80, 130, 175, 215, 260, 305, 340]

/** Zdjecie chowa sie w prezencie - tapniesz i wyskakuje. */
export default function GiftBox({ phase, onOpen }: Props) {
  return (
    <button
      className={`${s.gift} ${s[phase]}`}
      onClick={phase === 'closed' ? onOpen : undefined}
      aria-label="Otwórz prezent"
    >
      <span className={s.sparks} aria-hidden="true">
        {SPARKS.map((deg) => (
          <span key={deg} style={{ ['--deg' as string]: `${deg}deg` }} />
        ))}
      </span>

      <svg viewBox="0 0 120 120" className={s.art} aria-hidden="true">
        {/* wieczko - odlatuje przy otwieraniu */}
        <g className={s.lid}>
          <rect x="14" y="34" width="92" height="22" rx="8" fill={BOX} />
          <rect x="52" y="34" width="16" height="22" fill={RIBBON} />
          <path
            d="M60 34 C 44 34, 38 12, 52 12 C 60 12, 60 26, 60 34 Z"
            fill={BOX}
            stroke={BOX_D}
            strokeWidth="2"
          />
          <path
            d="M60 34 C 76 34, 82 12, 68 12 C 60 12, 60 26, 60 34 Z"
            fill={BOX}
            stroke={BOX_D}
            strokeWidth="2"
          />
          <circle cx="60" cy="32" r="6" fill={RIBBON} />
        </g>

        {/* pudełko */}
        <g className={s.base}>
          <rect x="20" y="54" width="80" height="54" rx="10" fill={BOX} />
          <rect x="52" y="54" width="16" height="54" fill={RIBBON} />
          <rect x="20" y="72" width="80" height="12" fill={RIBBON} opacity="0.85" />
        </g>
      </svg>

      {phase === 'closed' && <span className={s.hint}>Tapnij 🎁</span>}
    </button>
  )
}
