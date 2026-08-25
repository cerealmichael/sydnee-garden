import { Suspense, lazy } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import Hub from './screens/Hub'
import Loading from './components/Loading'
import RotateNotice from './components/RotateNotice'

// osobne chunki: matter.js i supabase nie musza blokowac wejscia na hub
const Garden = lazy(() => import('./screens/Garden'))
const Merge = lazy(() => import('./screens/Merge'))
const Letter = lazy(() => import('./screens/Letter'))

export default function App() {
  return (
    <>
      <Suspense fallback={<Loading />}>
        <Routes>
          <Route path="/" element={<Hub />} />
          <Route path="/ogrodek" element={<Garden />} />
          <Route path="/merge" element={<Merge />} />
          <Route path="/list" element={<Letter />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
      <RotateNotice />
    </>
  )
}
