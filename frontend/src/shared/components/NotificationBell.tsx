import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { FiBell, FiCheck } from 'react-icons/fi'
import { useSocket } from '../context/SocketContext'
import { markAllNotificationsRead, markNotificationRead } from '../services/cmsApi'
import { formatDate } from '../utils/cn'

type Props = {
  messagesPath: string
  className?: string
}

export function NotificationBell({ messagesPath, className = '' }: Props) {
  const {
    notifications,
    unreadNotifications,
    refreshNotifications,
    markLocalNotificationRead,
    clearLocalNotifications,
  } = useSocket()
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      if (!ref.current?.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', onDoc)
    return () => document.removeEventListener('mousedown', onDoc)
  }, [])

  const onOpen = () => {
    setOpen((v) => !v)
    if (!open) refreshNotifications()
  }

  const onMarkOne = async (id: string) => {
    try {
      await markNotificationRead(id)
      markLocalNotificationRead(id)
    } catch {
      /* ignore */
    }
  }

  const onMarkAll = async () => {
    try {
      await markAllNotificationsRead()
      clearLocalNotifications()
    } catch {
      /* ignore */
    }
  }

  return (
    <div className={`relative ${className}`} ref={ref}>
      <button
        type="button"
        onClick={onOpen}
        className="relative rounded-xl p-2.5 text-brand-icon transition hover:bg-brand-surface"
        aria-label="Notifications"
      >
        <FiBell size={18} />
        {unreadNotifications > 0 && (
          <span className="absolute right-1 top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white">
            {unreadNotifications > 99 ? '99+' : unreadNotifications}
          </span>
        )}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.98 }}
            className="absolute right-0 z-50 mt-2 w-[min(22rem,calc(100vw-2rem))] overflow-hidden rounded-2xl border border-brand-border bg-brand-card shadow-2xl"
          >
            <div className="flex items-center justify-between border-b border-brand-border px-4 py-3">
              <p className="text-sm font-semibold text-brand-text">Notifications</p>
              {unreadNotifications > 0 && (
                <button
                  type="button"
                  onClick={onMarkAll}
                  className="inline-flex items-center gap-1 text-xs font-medium text-indigo-600 hover:underline dark:text-indigo-400"
                >
                  <FiCheck size={12} /> Mark all read
                </button>
              )}
            </div>

            <div className="max-h-80 overflow-y-auto">
              {notifications.length === 0 ? (
                <p className="px-4 py-8 text-center text-sm text-brand-muted">No notifications yet</p>
              ) : (
                notifications.map((n) => (
                  <Link
                    key={n.id}
                    to={
                      n.reference_id || n.conversation_id
                        ? `${messagesPath}?c=${n.reference_id || n.conversation_id}`
                        : messagesPath
                    }
                    onClick={() => {
                      if (!n.is_read) onMarkOne(n.id)
                      setOpen(false)
                    }}
                    className={`block border-b border-brand-border/60 px-4 py-3 transition hover:bg-brand-surface ${
                      n.is_read ? 'opacity-70' : 'bg-indigo-50/50 dark:bg-indigo-950/20'
                    }`}
                  >
                    <p className="text-sm font-medium text-brand-text">{n.title}</p>
                    {n.body && (
                      <p className="mt-0.5 line-clamp-2 text-xs text-brand-muted">{n.body}</p>
                    )}
                    <p className="mt-1 text-[10px] text-brand-muted">{formatDate(n.created_at)}</p>
                  </Link>
                ))
              )}
            </div>

            <Link
              to={messagesPath}
              onClick={() => setOpen(false)}
              className="block border-t border-brand-border px-4 py-3 text-center text-sm font-medium text-indigo-600 hover:bg-brand-surface dark:text-indigo-400"
            >
              View all
            </Link>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
