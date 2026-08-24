import { CATS, catSrc, type CatName } from '../lib/cats'

type Props = {
  name?: CatName
  className?: string
  /** true = ozdoba, czytnik ekranu ma ja pominac */
  decorative?: boolean
}

export default function Cat({ name = 'classic', className, decorative = true }: Props) {
  return (
    <img
      src={catSrc(name)}
      alt={decorative ? '' : CATS[name]}
      aria-hidden={decorative || undefined}
      className={className}
      draggable={false}
    />
  )
}
