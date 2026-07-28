import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { trackVisit } from '../../../shared/services/publicApi'

function parseUserAgent() {
  const ua = navigator.userAgent
  let browser = 'Unknown'
  let os = 'Unknown'
  let device = 'Desktop'

  if (/Edg\//.test(ua)) browser = 'Edge'
  else if (/Chrome\//.test(ua)) browser = 'Chrome'
  else if (/Firefox\//.test(ua)) browser = 'Firefox'
  else if (/Safari\//.test(ua)) browser = 'Safari'

  if (/Windows/.test(ua)) os = 'Windows'
  else if (/Mac OS/.test(ua)) os = 'macOS'
  else if (/Android/.test(ua)) os = 'Android'
  else if (/iPhone|iPad/.test(ua)) os = 'iOS'
  else if (/Linux/.test(ua)) os = 'Linux'

  if (/Mobi|Android/i.test(ua)) device = 'Mobile'
  else if (/Tablet|iPad/i.test(ua)) device = 'Tablet'

  return { browser, os, device }
}

export function useVisitorTracking() {
  const location = useLocation()

  useEffect(() => {
    const { browser, os, device } = parseUserAgent()
    trackVisit({
      page: location.pathname + location.hash,
      browser,
      operating_system: os,
      device,
      referrer: document.referrer || undefined,
    }).catch(() => {
      // Silent fail — analytics should not block UX
    })
  }, [location.pathname, location.hash])
}
