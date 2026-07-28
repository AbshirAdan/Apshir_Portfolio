import { useEffect } from 'react'
import { usePublicSite } from '../context/PublicSiteContext'

type Props = {
  title?: string
  description?: string
  path?: string
}

export function SEO({ title, description, path = '' }: Props) {
  const { settings, profile } = usePublicSite()

  useEffect(() => {
    const siteTitle = settings?.site_title || profile?.full_name || 'Portfolio'
    const metaTitle = title || settings?.seo_meta_title || siteTitle
    const metaDesc =
      description ||
      settings?.seo_description ||
      settings?.hero_description ||
      profile?.bio ||
      'Professional portfolio'

    document.title = title ? `${title} | ${siteTitle}` : metaTitle

    const setMeta = (name: string, content: string, property = false) => {
      const attr = property ? 'property' : 'name'
      let el = document.querySelector(`meta[${attr}="${name}"]`) as HTMLMetaElement | null
      if (!el) {
        el = document.createElement('meta')
        el.setAttribute(attr, name)
        document.head.appendChild(el)
      }
      el.content = content
    }

    setMeta('description', metaDesc)
    setMeta('og:title', metaTitle, true)
    setMeta('og:description', metaDesc, true)
    setMeta('og:type', 'website', true)
    setMeta('twitter:card', 'summary_large_image')
    setMeta('twitter:title', metaTitle)
    setMeta('twitter:description', metaDesc)

    if (profile?.avatar) setMeta('og:image', profile.avatar, true)

    const jsonLd = {
      '@context': 'https://schema.org',
      '@type': 'Person',
      name: profile?.full_name || siteTitle,
      description: metaDesc,
      url: window.location.origin,
      image: profile?.avatar || undefined,
    }

    let script = document.getElementById('portfolio-jsonld') as HTMLScriptElement | null
    if (!script) {
      script = document.createElement('script')
      script.id = 'portfolio-jsonld'
      script.type = 'application/ld+json'
      document.head.appendChild(script)
    }
    script.textContent = JSON.stringify(jsonLd)
  }, [title, description, settings, profile, path])

  return null
}
