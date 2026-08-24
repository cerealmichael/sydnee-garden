import { Navigate, Route, Routes } from 'react-router-dom'
import Hub from './screens/Hub'
import Garden from './screens/Garden'
import Merge from './screens/Merge'
import Letter from './screens/Letter'
import RotateNotice from './components/RotateNotice'

export default function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<Hub />} />
        <Route path="/ogrodek" element={<Garden />} />
        <Route path="/merge" element={<Merge />} />
        <Route path="/list" element={<Letter />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <RotateNotice />
    </>
  )
}
