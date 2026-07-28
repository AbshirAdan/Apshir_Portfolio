import { Outlet, useLocation } from 'react-router-dom'
import { useEffect } from 'react'
import { PublicSiteProvider } from '../context/PublicSiteContext'
import { useVisitorTracking } from '../hooks/useVisitorTracking'
import { Header } from '../components/Header'
import { Footer } from '../components/Footer'
import { BackToTopButton } from '../components/BackToTopButton'
import { isSectionHash, scrollToSection } from '../utils/scrollToSection'

function PublicLayoutInner() {
  useVisitorTracking()
  const location = useLocation()

  useEffect(() => {
    if (location.pathname !== '/' || !location.hash || !isSectionHash(location.hash)) return

    const id = location.hash.slice(1)
    const attempt = () => {
      if (!scrollToSection(id)) {
        window.setTimeout(() => scrollToSection(id), 120)
      }
    }

    const frame = window.requestAnimationFrame(attempt)
    return () => window.cancelAnimationFrame(frame)
  }, [location.pathname, location.hash])

  return (
    <div className="min-h-screen bg-brand-bg text-brand-text transition-colors duration-300">
      <Header />
      <main>
        <Outlet />
      </main>
      <Footer />
      <BackToTopButton />
    </div>
  )
}

export function PublicLayout() {
  return (
    <PublicSiteProvider>
      <PublicLayoutInner />
    </PublicSiteProvider>
  )
}
