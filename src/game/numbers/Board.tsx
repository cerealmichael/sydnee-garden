import { useEffect, useRef } from 'react'
import { WIDTH, type Board as BoardModel, type Pair } from './rules'
import s from './Board.module.css'

type Props = {
  board: BoardModel
  selected: number | null
  hint: Pair | null
  flash: Pair | null
  /** od tego indeksu cyfry sa swiezo dosypane */
  freshFrom: number
  onTap: (i: number) => void
}

export default function Board({ board, selected, hint, flash, freshFrom, onTap }: Props) {
  const wrapRef = useRef<HTMLDivElement>(null)

  // po dosypaniu zjezdzamy do nowych cyfr, zeby nie szukac ich w dole planszy
  useEffect(() => {
    if (freshFrom < 0) return
    const wrap = wrapRef.current
    if (!wrap) return
    wrap.scrollTo({ top: wrap.scrollHeight, behavior: 'smooth' })
  }, [freshFrom])

  return (
    <div className={s.wrap} ref={wrapRef}>
      <div className={s.grid} style={{ gridTemplateColumns: `repeat(${WIDTH}, 1fr)` }}>
        {board.map((cell, i) => {
          const cls = [s.cell]
          if (cell.done) cls.push(s.done)
          if (i === selected) cls.push(s.sel)
          if (hint && (hint[0] === i || hint[1] === i)) cls.push(s.hint)
          if (flash && (flash[0] === i || flash[1] === i)) cls.push(s.flash)
          if (freshFrom >= 0 && i >= freshFrom) cls.push(s.new)

          return (
            <button
              key={i}
              className={cls.join(' ')}
              onClick={() => onTap(i)}
              disabled={cell.done}
              aria-label={cell.done ? undefined : String(cell.v)}
            >
              {cell.v}
            </button>
          )
        })}
      </div>
    </div>
  )
}
