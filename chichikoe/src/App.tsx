import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Landing from './pages/Landing'
import Demo from './pages/Demo'
import Complete from './pages/Complete'

export default function App() {
  return (
    <BrowserRouter basename="/dentsu">
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/demo" element={<Demo />} />
        <Route path="/complete" element={<Complete />} />
      </Routes>
    </BrowserRouter>
  )
}
