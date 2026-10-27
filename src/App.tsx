import { useEffect } from 'react'
import { BrowserRouter, Route, Routes, useLocation } from 'react-router-dom'
import { Layout, BootScreen } from './components/Layout'
import { ArchiveProvider, useArchive } from './lib/archive'
import { ModelProvider } from './lib/model'
import Landing from './pages/Landing'
import Studio from './pages/Studio'
import OfrendaPage from './pages/OfrendaPage'
import ArchivePage from './pages/ArchivePage'
import About from './pages/About'
import NotFound from './pages/NotFound'

function ScrollToTop() {
  const { pathname } = useLocation()
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])
  return null
}

function Shell() {
  const { ready } = useArchive()
  if (!ready) return <BootScreen />

  return (
    <>
      <ScrollToTop />
      <Routes>
        <Route element={<Layout />}>
          <Route index element={<Landing />} />
          <Route path="studio" element={<Studio />} />
          <Route path="studio/:id" element={<Studio />} />
          <Route path="ofrenda/:id" element={<OfrendaPage />} />
          <Route path="archive" element={<ArchivePage />} />
          <Route path="about" element={<About />} />
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </>
  )
}

export default function App() {
  return (
    <ArchiveProvider>
      <ModelProvider>
        <BrowserRouter>
          <Shell />
        </BrowserRouter>
      </ModelProvider>
    </ArchiveProvider>
  )
}
