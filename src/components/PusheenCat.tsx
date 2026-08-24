type Item = 'sprout' | 'fruit' | 'letter'

type Props = {
  /** drobiazg, ktory kotek trzyma przed soba */
  item?: Item
  className?: string
  title?: string
}

const FUR = '#AC9C90'
const FUR_D = '#8D7A6E'
const LINE = '#5B4034'
const NOSE = '#F19BB8'

/** Pucaty kotek-bochenek. Jeden ksztalt na cala apke. */
export default function PusheenCat({ item, className, title }: Props) {
  return (
    <svg
      viewBox="0 0 210 165"
      className={className}
      role={title ? 'img' : 'presentation'}
      aria-label={title}
      aria-hidden={title ? undefined : true}
    >
      <g
        fill={FUR}
        stroke={LINE}
        strokeWidth="6"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        {/* ogon */}
        <path d="M164 122 C 186 124, 197 110, 192 90" fill="none" strokeWidth="17" />
        <path d="M164 122 C 186 124, 197 110, 192 90" fill="none" stroke={FUR} strokeWidth="11" />
        <path
          d="M164 122 C 186 124, 197 110, 192 90"
          fill="none"
          stroke={FUR_D}
          strokeWidth="11"
          strokeDasharray="7 11"
          strokeDashoffset="10"
        />

        {/* uszy */}
        <path d="M50 64 L 44 24 L 92 46 Z" />
        <path d="M152 64 L 158 24 L 110 46 Z" />

        {/* lapki */}
        <ellipse cx="52" cy="136" rx="12" ry="10" />
        <ellipse cx="84" cy="138" rx="12" ry="10" />
        <ellipse cx="118" cy="138" rx="12" ry="10" />
        <ellipse cx="150" cy="136" rx="12" ry="10" />

        {/* bochenek */}
        <ellipse cx="100" cy="88" rx="74" ry="50" />

        {/* paski na glowie */}
        <g stroke={FUR_D} strokeWidth="5">
          <path d="M88 42 H 112" />
          <path d="M84 52 H 116" />
          <path d="M88 62 H 112" />
        </g>

        {/* cetki na boku */}
        <ellipse cx="150" cy="92" rx="11" ry="9" fill={FUR_D} stroke="none" />
        <ellipse cx="144" cy="114" rx="9" ry="7" fill={FUR_D} stroke="none" />

        {/* wasy */}
        <g strokeWidth="4">
          <path d="M42 78 L 12 68" />
          <path d="M40 88 L 8 88" />
          <path d="M42 98 L 13 108" />
          <path d="M170 70 L 199 60" />
          <path d="M172 80 L 202 76" />
        </g>

        {/* buzka */}
        <ellipse cx="76" cy="78" rx="6" ry="7" fill={LINE} stroke="none" />
        <ellipse cx="124" cy="78" rx="6" ry="7" fill={LINE} stroke="none" />
        <path d="M96 88 L 104 88 L 100 94 Z" fill={NOSE} stroke="none" />
        <g fill="none" strokeWidth="4">
          <path d="M100 94 C 96 101, 90 100, 88 96" />
          <path d="M100 94 C 104 101, 110 100, 112 96" />
        </g>

        {item === 'sprout' && (
          <g transform="translate(100 126) scale(1.7)">
            <path d="M0 12 V -4" stroke="#5E8F5A" strokeWidth="5" fill="none" />
            <path d="M0 0 C -14 -4, -18 -14, -4 -12 C 2 -11, 2 -4, 0 0 Z" fill="#8FD08A" />
            <path d="M0 -2 C 14 -8, 18 -18, 4 -16 C -2 -15, -2 -6, 0 -2 Z" fill="#B6E5AE" />
          </g>
        )}

        {item === 'fruit' && (
          <g transform="translate(100 124) scale(1.5)">
            <circle cx="0" cy="2" r="15" fill="#FF9DB6" />
            <path d="M0 -12 C -6 -20, 2 -24, 6 -18" fill="none" stroke="#5E8F5A" strokeWidth="5" />
            <circle cx="-5" cy="0" r="2.5" fill={LINE} stroke="none" />
            <circle cx="5" cy="0" r="2.5" fill={LINE} stroke="none" />
          </g>
        )}

        {item === 'letter' && (
          <g transform="translate(100 126) scale(1.45)">
            <rect x="-22" y="-14" width="44" height="30" rx="6" fill="#FFF3F7" />
            <path d="M-22 -10 L 0 6 L 22 -10" fill="none" />
            <path d="M-2 -2 L 2 -2" stroke={NOSE} strokeWidth="8" />
          </g>
        )}
      </g>
    </svg>
  )
}
