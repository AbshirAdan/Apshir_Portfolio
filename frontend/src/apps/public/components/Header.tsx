import { useEffect, useRef, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  FiChevronDown,
  FiLogOut,
  FiMenu,
  FiSettings,
  FiUser,
  FiX,
} from 'react-icons/fi'
import { usePublicSite } from '../context/PublicSiteContext'
import { useActiveSection } from '../hooks/useActiveSection'
import { ThemeToggle } from './ThemeToggle'
import { toUploadSrc } from '../../../shared/utils/uploadUrl'
import { scrollToSection } from '../utils/scrollToSection'
import { useAuth } from '../../../shared/context/AuthContext'
import { useToast } from '../../../shared/context/ToastContext'
import { NotificationBell } from '../../../shared/components/NotificationBell'

const NAV = [
  { label: 'Home', href: '#home', id: 'home' },
  { label: 'About', href: '#about', id: 'about' },
  { label: 'Skills', href: '#skills', id: 'skills' },
  { label: 'Projects', href: '#projects', id: 'projects' },
  { label: 'Experience', href: '#experience', id: 'experience' },
  { label: 'Blog', href: '#blog', id: 'blog' },
  { label: 'Contact', href: '#contact', id: 'contact' },
]

export function Header() {
  const { settings, profile } = usePublicSite()
  const { user, isAuthenticated, isAdmin, logout } = useAuth()
  const toast = useToast()
  const location = useLocation()
  const navigate = useNavigate()
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)
  const isHome = location.pathname === '/'
  const activeSection = useActiveSection(isHome)

  const siteTitle = settings?.site_title || profile?.full_name || 'Portfolio'
  const logoLetter = (settings?.site_title || profile?.full_name || 'P').charAt(0).toUpperCase()
  const siteAvatarSrc = toUploadSrc(profile?.avatar)
  const userAvatarSrc = toUploadSrc(user?.avatar)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 48)
    window.addEventListener('scroll', onScroll, { passive: true })
    onScroll()
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', onDoc)
    return () => document.removeEventListener('mousedown', onDoc)
  }, [])

  const scrollTo = (href: string) => {
    setMobileOpen(false)
    if (href.startsWith('#') && isHome) {
      scrollToSection(href.slice(1))
    }
  }

  const navLinkClass = (id: string) => {
    const active =
      (isHome && activeSection === id) || (id === 'blog' && location.pathname.startsWith('/blog'))
    return [
      'relative rounded-lg px-3 py-2 text-sm font-medium transition-colors',
      active
        ? 'text-brand-primary dark:text-brand-secondary'
        : 'text-brand-secondaryText hover:text-brand-text',
    ].join(' ')
  }

  const onLogout = async () => {
    setMenuOpen(false)
    setMobileOpen(false)
    await logout()
    toast.success('Logged out')
    navigate('/', { replace: true })
  }

  const showGuestAuth = !isAuthenticated

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'border-b border-brand-border bg-brand-card/90 shadow-sm backdrop-blur-xl'
          : 'bg-transparent'
      }`}
    >
      <div className="section-container flex h-16 items-center justify-between md:h-[4.5rem]">
        <Link to="/#home" className="group flex items-center gap-3" onClick={() => isHome && scrollTo('#home')}>
          {settings?.logo ? (
            <img src={settings.logo} alt="" className="h-10 w-10 rounded-full object-cover ring-2 ring-brand-primary/20" />
          ) : siteAvatarSrc ? (
            <img
              src={siteAvatarSrc}
              alt={profile?.full_name || siteTitle}
              className="h-10 w-10 rounded-full object-cover object-top ring-2 ring-brand-primary/20 shadow-md transition group-hover:scale-105"
            />
          ) : (
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-primary text-base font-bold text-white shadow-md shadow-brand-primary/30 transition group-hover:scale-105">
              {logoLetter}
            </span>
          )}
          <span className="hidden font-bold text-brand-text sm:inline md:text-lg">{siteTitle}</span>
        </Link>

        <nav className="hidden items-center gap-0.5 lg:flex" aria-label="Main navigation">
          {NAV.map((item) => (
            <a
              key={item.href}
              href={isHome ? item.href : `/${item.href}`}
              onClick={(e) => {
                e.preventDefault()
                if (isHome) {
                  scrollTo(item.href)
                } else {
                  navigate(`/${item.href}`)
                }
              }}
              className={navLinkClass(item.id)}
            >
              {item.label}
              {((isHome && activeSection === item.id) ||
                (item.id === 'blog' && location.pathname.startsWith('/blog'))) && (
                <motion.span
                  layoutId="nav-indicator"
                  className="absolute inset-x-2 -bottom-0.5 h-0.5 rounded-full bg-brand-primary"
                />
              )}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-2 md:gap-3">
          <ThemeToggle />

          {isAuthenticated && isAdmin ? (
            <Link
              to="/admin/dashboard"
              className="hidden rounded-full bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-md sm:inline-flex"
            >
              Admin Dashboard
            </Link>
          ) : isAuthenticated && !isAdmin ? (
            <div className="relative hidden items-center gap-2 sm:flex" ref={menuRef}>
              <NotificationBell messagesPath="/account/messages" />
              <button
                type="button"
                onClick={() => setMenuOpen((v) => !v)}
                className="flex items-center gap-2 rounded-full border border-brand-border bg-brand-card/80 py-1 pl-1 pr-3 transition hover:border-brand-primary/40"
              >
                {userAvatarSrc ? (
                  <img src={userAvatarSrc} alt="" className="h-8 w-8 rounded-full object-cover" />
                ) : (
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-primary text-xs font-bold text-white">
                    {(user?.full_name || 'U').charAt(0).toUpperCase()}
                  </span>
                )}
                <span className="hidden max-w-[8rem] truncate text-sm font-medium text-brand-text md:inline">
                  {user?.full_name}
                </span>
                <FiChevronDown size={14} className="text-brand-muted" />
              </button>

              <AnimatePresence>
                {menuOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 8 }}
                    className="absolute right-0 top-full mt-2 w-56 overflow-hidden rounded-2xl border border-brand-border bg-brand-card shadow-xl"
                  >
                    <Link
                      to="/account/messages"
                      onClick={() => setMenuOpen(false)}
                      className="flex items-center gap-2 px-4 py-3 text-sm text-brand-text hover:bg-brand-surface"
                    >
                      <FiUser /> Messages
                    </Link>
                    <Link
                      to="/account/profile"
                      onClick={() => setMenuOpen(false)}
                      className="flex items-center gap-2 px-4 py-3 text-sm text-brand-text hover:bg-brand-surface"
                    >
                      <FiUser /> My Profile
                    </Link>
                    <Link
                      to="/account/settings"
                      onClick={() => setMenuOpen(false)}
                      className="flex items-center gap-2 px-4 py-3 text-sm text-brand-text hover:bg-brand-surface"
                    >
                      <FiSettings /> Settings
                    </Link>
                    <button
                      type="button"
                      onClick={onLogout}
                      className="flex w-full items-center gap-2 border-t border-brand-border px-4 py-3 text-sm text-red-400 hover:bg-brand-surface"
                    >
                      <FiLogOut /> Logout
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ) : showGuestAuth ? (
            <div className="hidden items-center gap-2 sm:flex">
              <Link
                to="/signin"
                className="rounded-full border border-brand-border px-4 py-2 text-sm font-medium text-brand-text transition hover:bg-brand-surface"
              >
                Sign In
              </Link>
              <Link
                to="/signup"
                className="rounded-full bg-brand-primary px-4 py-2 text-sm font-semibold text-white shadow-md shadow-brand-primary/25 transition hover:opacity-90"
              >
                Sign Up
              </Link>
            </div>
          ) : null}

          <button
            type="button"
            className="rounded-xl p-2.5 text-brand-icon hover:bg-brand-surface lg:hidden"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle menu"
          >
            {mobileOpen ? <FiX size={22} /> : <FiMenu size={22} />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="border-t border-brand-border bg-brand-card/95 backdrop-blur-xl lg:hidden"
          >
            <nav className="section-container flex flex-col gap-1 py-4">
              {NAV.map((item) => (
                <a
                  key={item.href}
                  href={isHome ? item.href : `/${item.href}`}
                  onClick={(e) => {
                    e.preventDefault()
                    if (isHome) {
                      scrollTo(item.href)
                    } else {
                      setMobileOpen(false)
                      navigate(`/${item.href}`)
                    }
                  }}
                  className="rounded-lg px-3 py-3 text-sm font-medium text-brand-secondaryText"
                >
                  {item.label}
                </a>
              ))}

              <div className="mt-3 flex flex-col gap-2 border-t border-brand-border pt-3">
                {isAuthenticated && isAdmin ? (
                  <Link
                    to="/admin/dashboard"
                    onClick={() => setMobileOpen(false)}
                    className="rounded-full bg-indigo-600 px-4 py-2.5 text-center text-sm font-semibold text-white"
                  >
                    Admin Dashboard
                  </Link>
                ) : isAuthenticated && !isAdmin ? (
                  <>
                    <Link
                      to="/account/profile"
                      onClick={() => setMobileOpen(false)}
                      className="rounded-lg px-3 py-3 text-sm font-medium text-brand-text"
                    >
                      My Profile
                    </Link>
                    <Link
                      to="/account/settings"
                      onClick={() => setMobileOpen(false)}
                      className="rounded-lg px-3 py-3 text-sm font-medium text-brand-text"
                    >
                      Settings
                    </Link>
                    <button
                      type="button"
                      onClick={onLogout}
                      className="rounded-lg px-3 py-3 text-left text-sm font-medium text-red-400"
                    >
                      Logout
                    </button>
                  </>
                ) : (
                  <>
                    <Link
                      to="/signin"
                      onClick={() => setMobileOpen(false)}
                      className="rounded-full border border-brand-border px-4 py-2.5 text-center text-sm font-medium"
                    >
                      Sign In
                    </Link>
                    <Link
                      to="/signup"
                      onClick={() => setMobileOpen(false)}
                      className="rounded-full bg-brand-primary px-4 py-2.5 text-center text-sm font-semibold text-white"
                    >
                      Sign Up
                    </Link>
                  </>
                )}
              </div>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  )
}
