import Screen from '../components/Screen'
import Tile from '../components/Tile'
import CatBadge from '../components/CatBadge'
import s from './Hub.module.css'

export default function Hub() {
  return (
    <Screen>
      <div className={s.hero}>
        <CatBadge cat="unicorn" color="var(--lilac)" size={132} />
        <h1 className={s.hello}>Cześć 🌸</h1>
      </div>

      <nav className={s.tiles}>
        <Tile
          to="/ogrodek"
          title="Ogródek"
          subtitle="Nasze rosnące coś"
          color="var(--mint)"
          cat="classic"
        />
        <Tile
          to="/merge"
          title="Pusheen Merge"
          subtitle="Łącz kotki"
          color="var(--peach)"
          cat="donut"
        />
        <Tile to="/list" title="List" subtitle="Do przeczytania" color="var(--pink)" cat="gift" />
      </nav>
    </Screen>
  )
}
