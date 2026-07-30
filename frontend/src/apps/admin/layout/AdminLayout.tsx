import { useState } from 'react'
import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  FiAward,
  FiBookOpen,
  FiBriefcase,
  FiChevronDown,
  FiFileText,
  FiGrid,
  FiLayers,
  FiLink,
  FiLogOut,
  FiMail,
  FiMenu,
  FiMoon,
  FiSettings,
  FiSun,
  FiUser,
  FiUsers,
  FiX,
} from 'react-icons/fi'
import { useAuth } from '../../../shared/context/AuthContext'
import { useTheme } from '../../../shared/context/ThemeContext'
import { NotificationBell } from '../../../shared/components/NotificationBell'
import { cn } from '../../../shared/utils/cn'

const navItems = [
  { to: '/admin/dashboard', label: 'Dashboard', icon: FiGrid, end: true },
  { to: '/admin/users', label: 'Users', icon: FiUsers },
  { to: '/admin/projects', label: 'Projects', icon: FiLayers },
  { to: '/admin/skills', label: 'Skills', icon: FiBookOpen },
  { to: '/admin/certificates', label: 'Certificates', icon: FiAward },
  { to: '/admin/education', label: 'Education', icon: FiBookOpen },
  { to: '/admin/experience', label: 'Experience', icon: FiBriefcase },
  { to: '/admin/blogs', label: 'Blogs', icon: FiFileText },
  { to: '/admin/messages', label: 'Communication Center', icon: FiMail },
  { to: '/admin/resume', label: 'Resume', icon: FiFileText },
  { to: '/admin/social-links', label: 'Social Links', icon: FiLink },
  { to: '/admin/settings', label: 'Settings', icon: FiSettings },
  { to: '/admin/profile', label: 'Profile', icon: FiUser },
]

const breadcrumbLabels: Record<string, string> = {
  admin: 'Dashboard',
  dashboard: 'Dashboard',
  users: 'Users',
  projects: 'Projects',
  skills: 'Skills',
  certificates: 'Certificates',
  education: 'Education',
  experience: 'Experience',
  blogs: 'Blogs',
  messages: 'Communication Center',
  resume: 'Resume',
  'social-links': 'Social Links',
  settings: 'Settings',
  profile: 'Profile',
  new: 'New',
}

export function AdminLayout() {
  const { user, logout } = useAuth()
  const { theme, toggleTheme } = useTheme()
  const location = useLocation()
  const navigate = useNavigate()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)

  const segments = location.pathname.split('/').filter(Boolean)
  const crumbs = segments.slice(1).map((seg, i) => ({
    label: breadcrumbLabels[seg] || seg,
    path: '/admin/' + segments.slice(1, i + 2).join('/'),
    isLast: i === segments.length - 2,
  }))

  const handleLogout = async () => {
    await logout()
    navigate('/', { replace: true })
  }

  const sidebar = (
    <div className="flex h-full flex-col">
      <div className="flex h-16 items-center gap-3 border-b border-brand-border px-5 justify-center lg:justify-start">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-indigo-600 text-sm font-bold text-white shadow-sm">
          P
        </div>
        <div className="lg:block hidden truncate">
          <p className="font-semibold text-brand-text text-sm">Portfolio CMS</p>
          <p className="text-[10px] text-brand-muted">Admin Dashboard</p>
        </div>
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto p-3">
        {navItems.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            onClick={() => setSidebarOpen(false)}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition justify-center lg:justify-start',
                isActive
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-brand-secondaryText hover:bg-brand-surface'
              )
            }
            title={label}
          >
            <Icon size={18} className="shrink-0" />
            <span className="lg:block hidden truncate">{label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="border-t border-brand-border p-3 flex justify-center lg:justify-start">
        <Link
          to="/"
          className="block rounded-xl px-3 py-2 text-sm text-brand-muted hover:bg-brand-surface truncate"
          title="View public site"
        >
          <span className="lg:inline hidden">← View public site</span>
          <span className="lg:hidden inline text-base">←</span>
        </Link>
      </div>
    </div>
  )

  return (
    <div className="flex min-h-screen bg-brand-surface text-brand-text transition-colors duration-300">
      {/* Desktop & Tablet Sidebar */}
      <aside className="hidden md:block md:w-20 lg:w-64 shrink-0 border-r border-brand-border bg-brand-sidebar transition-all duration-300">
        {sidebar}
      </aside>

      {/* Mobile sidebar overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-slate-950/50 md:hidden"
              onClick={() => setSidebarOpen(false)}
            />
            <motion.aside
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed inset-y-0 left-0 z-50 w-64 border-r border-brand-border bg-brand-sidebar md:hidden"
            >
              <button
                onClick={() => setSidebarOpen(false)}
                className="absolute right-3 top-4 rounded-lg p-2 text-brand-muted hover:bg-brand-surface min-h-[44px] min-w-[44px] flex items-center justify-center"
                aria-label="Close menu"
              >
                <FiX size={18} />
              </button>
              {sidebar}
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      <div className="flex min-w-0 flex-1 flex-col">
        {/* Top nav */}
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between gap-4 border-b border-brand-border bg-brand-card/90 px-4 backdrop-blur transition-colors duration-300 lg:px-6">
          <div className="flex min-w-0 items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="rounded-lg p-2 text-brand-icon hover:bg-brand-surface md:hidden min-h-[44px] min-w-[44px] flex items-center justify-center"
              aria-label="Open menu"
            >
              <FiMenu size={20} />
            </button>
            <nav className="hidden min-w-0 truncate text-sm text-brand-muted sm:block">
              <Link to="/admin" className="hover:text-indigo-600 font-semibold">
                Admin
              </Link>
              {crumbs.map((crumb) => (
                <span key={crumb.path}>
                  <span className="mx-2">/</span>
                  {crumb.isLast ? (
                    <span className="font-semibold text-brand-text">{crumb.label}</span>
                  ) : (
                    <Link to={crumb.path} className="hover:text-indigo-600">
                      {crumb.label}
                    </Link>
                  )}
                </span>
              ))}
            </nav>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={toggleTheme}
              className="rounded-xl p-2.5 text-brand-icon transition hover:bg-brand-surface min-h-[44px]"
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? <FiSun size={18} /> : <FiMoon size={18} />}
            </button>

            <NotificationBell messagesPath="/admin/messages" />

            <div className="relative">
              <button
                onClick={() => setProfileOpen(!profileOpen)}
                className="flex items-center gap-2 rounded-xl px-2 py-1.5 transition hover:bg-brand-surface min-h-[44px]"
              >
                {user?.avatar ? (
                  <img src={user.avatar} alt="" className="h-8 w-8 rounded-full object-cover" />
                ) : (
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-100 text-sm font-semibold text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300">
                    {user?.full_name?.charAt(0) || 'A'}
                  </div>
                )}
                <span className="hidden max-w-[120px] truncate text-sm font-medium text-brand-secondaryText md:block">
                  {user?.full_name}
                </span>
                <FiChevronDown className="hidden text-brand-muted sm:block" size={14} />
              </button>

              <AnimatePresence>
                {profileOpen && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setProfileOpen(false)} />
                    <motion.div
                      initial={{ opacity: 0, y: 4 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 4 }}
                      className="absolute right-0 z-50 mt-2 w-56 rounded-xl border border-brand-border bg-brand-card py-1 shadow-lg"
                    >
                      <div className="border-b border-brand-border px-4 py-3">
                        <p className="truncate text-sm font-medium text-brand-text">
                          {user?.full_name}
                        </p>
                        <p className="truncate text-xs text-brand-muted">{user?.email}</p>
                      </div>
                      <Link
                        to="/admin/profile"
                        onClick={() => setProfileOpen(false)}
                        className="flex items-center gap-2 px-4 py-2.5 text-sm text-brand-secondaryText hover:bg-brand-surface"
                      >
                        <FiUser size={16} /> Profile
                      </Link>
                      <button
                        onClick={handleLogout}
                        className="flex w-full items-center gap-2 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30"
                      >
                        <FiLogOut size={16} /> Logout
                      </button>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>
          </div>
        </header>

        <main className="flex-1 p-4 lg:p-6 overflow-x-hidden">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
