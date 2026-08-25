import s from './FlowerBed.module.css'

type Props = { count: number }

const MAX = 8

/** Rzadek zakwitnietych kwiatkow - kazdy to jeden ukonczony cykl podlewania. */
export default function FlowerBed({ count }: Props) {
  if (count === 0) return null
  const shown = Math.min(count, MAX)

  return (
    <div className={s.bed}>
      {Array.from({ length: shown }, (_, i) => (
        <svg key={i} viewBox="0 0 24 24" className={s.flower} aria-hidden="true">
          {[0, 72, 144, 216, 288].map((deg) => (
            <ellipse
              key={deg}
              cx="12"
              cy="6"
              rx="4"
              ry="6"
              fill={deg % 144 === 0 ? '#FFB7CE' : '#FF97B8'}
              transform={`rotate(${deg} 12 12)`}
            />
          ))}
          <circle cx="12" cy="12" r="3.4" fill="#FFE08A" />
        </svg>
      ))}
      {count > MAX && <span className={s.more}>+{count - MAX}</span>}
    </div>
  )
}
