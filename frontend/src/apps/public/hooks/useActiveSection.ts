import { useEffect, useState } from 'react'
import { NAV_SECTION_IDS } from '../utils/scrollToSection'

export function useActiveSection(enabled: boolean) {
  const [active, setActive] = useState('home')

  useEffect(() => {
    if (!enabled) return

    const onScroll = () => {
      const offset = window.scrollY + 120
      let current = 'home'

      for (const id of NAV_SECTION_IDS) {
        const el = document.getElementById(id)
        if (el && el.offsetTop <= offset) current = id
      }

      setActive(current)
    }

    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [enabled])

  return active
}
