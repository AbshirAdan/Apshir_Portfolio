import { Link, Outlet, NavLink, useNavigate } from 'react-router-dom'
import { FiLogOut, FiMail, FiSettings, FiUser } from 'react-icons/fi'
import { useAuth } from '../../../../shared/context/AuthContext'
import { useSocket } from '../../../../shared/context/SocketContext'
import { toUploadSrc } from '../../../../shared/utils/uploadUrl'
import { useToast } from '../../../../shared/context/ToastContext'

export default function AccountLayout() {
  const { user, logout } = useAuth()
  const { unreadReplies } = useSocket()
  const toast = useToast()
  const navigate = useNavigate()
  const avatar = toUploadSrc(user?.avatar)

  const onLogout = async () => {
    await logout()
    toast.success('Logged out')
    navigate('/', { replace: true })
  }

  return (
    <div className="section-container py-24 md:py-28">
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          {avatar ? (
            <img src={avatar} alt="" className="h-14 w-14 rounded-full object-cover ring-2 ring-brand-primary/30" />
          ) : (
            <span className="flex h-14 w-14 items-center justify-center rounded-full bg-brand-primary text-lg font-bold text-white">
              {(user?.full_name || 'U').charAt(0).toUpperCase()}
            </span>
          )}
          <div>
            <h1 className="text-2xl font-bold text-brand-text">Welcome, {user?.full_name}</h1>
            <p className="text-sm text-brand-muted">{user?.email}</p>
          </div>
        </div>
        <button
          type="button"
          onClick={onLogout}
          className="inline-flex items-center gap-2 rounded-full border border-brand-border px-4 py-2 text-sm text-brand-secondaryText hover:bg-brand-surface"
        >
          <FiLogOut /> Logout
        </button>
      </div>

      <div className="mb-6 flex flex-wrap gap-2 border-b border-brand-border pb-3">
        <Tab to="/account" end icon={<FiUser />} label="Dashboard" />
        <Tab
          to="/account/messages"
          icon={<FiMail />}
          label="Messages"
          badge={unreadReplies > 0 ? unreadReplies : undefined}
        />
        <Tab to="/account/profile" icon={<FiUser />} label="My Profile" />
        <Tab to="/account/settings" icon={<FiSettings />} label="My Settings" />
        <Link to="/" className="rounded-full px-4 py-2 text-sm text-brand-muted hover:text-brand-text">
          ← Portfolio
        </Link>
      </div>

      <Outlet />
    </div>
  )
}

function Tab({
  to,
  label,
  icon,
  end,
  badge,
}: {
  to: string
  label: string
  icon: React.ReactNode
  end?: boolean
  badge?: number
}) {
  return (
    <NavLink
      to={to}
      end={end}
      className={({ isActive }) =>
        [
          'inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition',
          isActive
            ? 'bg-brand-primary text-white shadow-md shadow-brand-primary/25'
            : 'text-brand-secondaryText hover:bg-brand-surface',
        ].join(' ')
      }
    >
      {icon}
      {label}
      {badge ? (
        <span className="ml-1 rounded-full bg-red-500 px-1.5 py-0.5 text-[10px] font-bold text-white">
          {badge}
        </span>
      ) : null}
    </NavLink>
  )
}
