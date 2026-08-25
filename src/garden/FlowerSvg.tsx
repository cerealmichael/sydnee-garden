import { toPolyline, type Stroke } from './strokes'

type Props = {
  strokes: Stroke[]
  className?: string
}

/** Narysowany kwiatek jako SVG - ten sam ksztalt na podgladzie i na lace. */
export default function FlowerSvg({ strokes, className }: Props) {
  return (
    <svg viewBox="0 0 1 1" className={className} aria-hidden="true">
      {strokes.map((stroke, i) => (
        <polyline
          key={i}
          points={toPolyline(stroke)}
          fill="none"
          stroke={stroke.c}
          strokeWidth={stroke.w}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      ))}
    </svg>
  )
}
