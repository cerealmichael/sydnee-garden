import Cat from '../../components/Cat'
import { LEVELS } from './levels'
import s from './NextQueue.module.css'

type Props = { levels: number[] }

/** Podglad trzech kolejnych kotkow - pierwszy spadnie jako nastepny. */
export default function NextQueue({ levels }: Props) {
  return (
    <div className={s.queue}>
      {levels.map((level, i) => (
        <span key={i} className={i === 0 ? `${s.slot} ${s.first}` : s.slot}>
          <Cat name={LEVELS[level].cat} className={s.cat} />
        </span>
      ))}
    </div>
  )
}
