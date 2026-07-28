import { FiArrowUp, FiGithub, FiLinkedin, FiMail } from 'react-icons/fi'
import { FaFacebook, FaInstagram, FaWhatsapp } from 'react-icons/fa'
import { FaXTwitter } from 'react-icons/fa6'
import { Link } from 'react-router-dom'
import type { IconType } from 'react-icons'
import { usePublicSite } from '../context/PublicSiteContext'
import { scrollToSection } from '../utils/scrollToSection'

const PLATFORM_ICONS: Record<string, IconType> = {
  github: FiGithub,
  linkedin: FiLinkedin,
  facebook: FaFacebook,
  instagram: FaInstagram,
  twitter: FaXTwitter,
  x: FaXTwitter,
  email: FiMail,
  whatsapp: FaWhatsapp,
}

export function Footer() {
  const { settings, profile, socialLinks } = usePublicSite()
  const year = new Date().getFullYear()

  const quickLinks = [
    { label: 'About', href: '/#about' },
    { label: 'Skills', href: '/#skills' },
    { label: 'Projects', href: '/#projects' },
    { label: 'Contact', href: '/#contact' },
    { label: 'Blog', href: '/#blog' },
  ]

  return (
    <footer className="border-t border-brand-border bg-brand-footer/90 py-12 text-brand-text transition-colors duration-300">
      <div className="section-container">
        <div className="grid gap-10 md:grid-cols-3">
          <div>
            <h3 className="text-lg font-bold text-brand-text">
              {settings?.site_title || profile?.full_name}
            </h3>
            <p className="mt-2 text-sm text-brand-muted">
              {settings?.hero_subtitle || 'Building elegant digital experiences.'}
            </p>
          </div>

          <div>
            <h4 className="mb-3 text-sm font-semibold uppercase tracking-wider text-brand-secondary">Quick Links</h4>
            <ul className="space-y-2 text-sm text-brand-muted">
              {quickLinks.map((link) => (
                <li key={link.href}>
                  <Link to={link.href} className="transition hover:text-brand-text">{link.label}</Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="mb-3 text-sm font-semibold uppercase tracking-wider text-brand-secondary">Connect</h4>
            <div className="flex flex-wrap gap-3">
              {socialLinks.map((link) => {
                const Icon = PLATFORM_ICONS[link.platform.toLowerCase()] || FiMail
                return (
                  <a
                    key={link.id}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex h-10 w-10 items-center justify-center rounded-xl border border-brand-border bg-brand-card text-brand-icon transition hover:border-brand-primary hover:text-brand-secondary"
                    aria-label={link.platform}
                  >
                    <Icon size={18} />
                  </a>
                )
              })}
            </div>
          </div>
        </div>

        <div className="mt-10 flex flex-col items-center justify-between gap-4 border-t border-brand-border pt-8 sm:flex-row">
          <p className="text-sm text-brand-muted">
            © {year} {profile?.full_name || settings?.site_title}. All rights reserved.
          </p>
          <button type="button" onClick={() => scrollToSection('home')} className="btn-outline !px-4 !py-2 text-xs" aria-label="Back to top">
            <FiArrowUp /> Back to top
          </button>
        </div>
      </div>
    </footer>
  )
}
