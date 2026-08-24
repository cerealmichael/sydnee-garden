import Screen from '../components/Screen'
import Placeholder from '../components/Placeholder'

export default function Garden() {
  return (
    <Screen title="Ogródek" back>
      <Placeholder text="Tu wyrośnie ogródek." color="var(--mint)" cat="classic" />
    </Screen>
  )
}
