import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import {
  getPublicProfile,
  getPublicSettings,
  getPublicSocialLinks,
  type PublicProfile,
} from '../../../shared/services/publicApi'
import type { SiteSettings, SocialLink } from '../../../shared/types/cms.types'

type PublicSiteContextValue = {
  settings: SiteSettings | null
  profile: PublicProfile | null
  socialLinks: SocialLink[]
  loading: boolean
  error: string | null
}

const PublicSiteContext = createContext<PublicSiteContextValue | null>(null)

export function PublicSiteProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<SiteSettings | null>(null)
  const [profile, setProfile] = useState<PublicProfile | null>(null)
  const [socialLinks, setSocialLinks] = useState<SocialLink[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    Promise.all([getPublicSettings(), getPublicProfile(), getPublicSocialLinks()])
      .then(([s, p, links]) => {
        setSettings(s)
        setProfile(p)
        setSocialLinks(links)
        if (s.primary_color) document.documentElement.style.setProperty('--color-primary', s.primary_color)
        if (s.secondary_color) document.documentElement.style.setProperty('--color-secondary', s.secondary_color)
        if (s.favicon) {
          const link = document.querySelector("link[rel*='icon']") as HTMLLinkElement | null
          if (link) link.href = s.favicon
        }
      })
      .catch(() => setError('Failed to load site data'))
      .finally(() => setLoading(false))
  }, [])

  const value = useMemo(
    () => ({ settings, profile, socialLinks, loading, error }),
    [settings, profile, socialLinks, loading, error]
  )

  return <PublicSiteContext.Provider value={value}>{children}</PublicSiteContext.Provider>
}

export function usePublicSite() {
  const ctx = useContext(PublicSiteContext)
  if (!ctx) throw new Error('usePublicSite must be used within PublicSiteProvider')
  return ctx
}
