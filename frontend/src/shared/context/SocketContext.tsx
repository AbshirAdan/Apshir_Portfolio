import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react'
import { io, type Socket } from 'socket.io-client'
import { useAuth } from './AuthContext'
import { useToast } from './ToastContext'
import { getStoredToken } from '../services/authService'
import { getNotifications } from '../services/cmsApi'
import type { AppNotification } from '../types/cms.types'
import {
  requestNotificationPermissionOnce,
  showBrowserNotification,
} from '../utils/browserNotifications'

type SocketContextType = {
  socket: Socket | null
  connected: boolean
  unreadReplies: number
  setUnreadReplies: (n: number) => void
  bumpUnreadReplies: () => void
  notifications: AppNotification[]
  unreadNotifications: number
  refreshNotifications: () => Promise<void>
  markLocalNotificationRead: (id: string) => void
  clearLocalNotifications: () => void
}

const SocketContext = createContext<SocketContextType | null>(null)

const SOCKET_URL =
  import.meta.env.VITE_SOCKET_URL ||
  (typeof window !== 'undefined' ? window.location.origin : 'http://localhost:5173')

export function SocketProvider({ children }: { children: ReactNode }) {
  const { isAuthenticated, user } = useAuth()
  const toast = useToast()
  const [socket, setSocket] = useState<Socket | null>(null)
  const [connected, setConnected] = useState(false)
  const [unreadReplies, setUnreadReplies] = useState(0)
  const [notifications, setNotifications] = useState<AppNotification[]>([])
  const [unreadNotifications, setUnreadNotifications] = useState(0)
  const permissionAsked = useRef(false)

  const messagesPath = user?.role === 'admin' ? '/admin/messages' : '/account/messages'

  const refreshNotifications = useCallback(async () => {
    if (!isAuthenticated) return
    try {
      const data = await getNotifications()
      setNotifications(data.items || [])
      setUnreadNotifications(data.unread || 0)
      setUnreadReplies(data.unread || 0)
    } catch {
      /* ignore */
    }
  }, [isAuthenticated])

  useEffect(() => {
    if (isAuthenticated) {
      refreshNotifications()
      if (!permissionAsked.current) {
        permissionAsked.current = true
        requestNotificationPermissionOnce()
      }
    } else {
      setNotifications([])
      setUnreadNotifications(0)
      setUnreadReplies(0)
    }
  }, [isAuthenticated, refreshNotifications])

  useEffect(() => {
    if (!isAuthenticated) {
      socket?.disconnect()
      setSocket(null)
      setConnected(false)
      return
    }

    const token = getStoredToken()
    if (!token) return

    const next = io(SOCKET_URL, {
      auth: { token },
      transports: ['websocket', 'polling'],
    })

    next.on('connect', () => setConnected(true))
    next.on('disconnect', () => setConnected(false))

    next.on(
      'notification:new',
      (payload: {
        title?: string
        body?: string
        conversationId?: string
        referenceId?: string
        browser?: { title?: string; body?: string; conversationId?: string }
        type?: string
      }) => {
        setUnreadReplies((n) => n + 1)
        setUnreadNotifications((n) => n + 1)
        toast.success(payload?.title || 'New notification')
        refreshNotifications()

        const convId = payload.browser?.conversationId || payload.conversationId || payload.referenceId
        showBrowserNotification({
          title: payload.browser?.title || payload.title || 'New Message',
          body: payload.browser?.body || payload.body || '',
          conversationId: convId,
          tag: convId || 'notif',
          onClickPath: convId ? `${messagesPath}?c=${convId}` : messagesPath,
        })
      }
    )

    next.on('message:reply', (payload: { title?: string; conversationId?: string }) => {
      setUnreadReplies((n) => n + 1)
      toast.success(payload?.title || 'You received a new reply from Admin.')
      refreshNotifications()
      showBrowserNotification({
        title: 'New Reply',
        body: 'You received a reply from Admin.',
        conversationId: payload.conversationId,
        onClickPath: payload.conversationId
          ? `/account/messages?c=${payload.conversationId}`
          : '/account/messages',
      })
    })

    next.on('conversation:new', (payload: { conversation?: { id?: string; guest_name?: string; subject?: string } }) => {
      if (user?.role === 'admin') {
        toast.info('New contact message received')
        refreshNotifications()
        const c = payload?.conversation
        showBrowserNotification({
          title: 'New Message',
          body: c ? `${c.guest_name}\n${c.subject}` : 'New contact message',
          conversationId: c?.id,
          onClickPath: c?.id ? `/admin/messages?c=${c.id}` : '/admin/messages',
        })
      }
    })

    next.on('message:new', () => {
      refreshNotifications()
    })

    setSocket(next)

    return () => {
      next.disconnect()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, user?.id, user?.role, messagesPath])

  const markLocalNotificationRead = useCallback((id: string) => {
    setNotifications((list) =>
      list.map((n) => (n.id === id ? { ...n, is_read: true } : n))
    )
    setUnreadNotifications((n) => Math.max(0, n - 1))
    setUnreadReplies((n) => Math.max(0, n - 1))
  }, [])

  const clearLocalNotifications = useCallback(() => {
    setNotifications((list) => list.map((n) => ({ ...n, is_read: true })))
    setUnreadNotifications(0)
    setUnreadReplies(0)
  }, [])

  const value = useMemo(
    () => ({
      socket,
      connected,
      unreadReplies,
      setUnreadReplies,
      bumpUnreadReplies: () => setUnreadReplies((n) => n + 1),
      notifications,
      unreadNotifications,
      refreshNotifications,
      markLocalNotificationRead,
      clearLocalNotifications,
    }),
    [
      socket,
      connected,
      unreadReplies,
      notifications,
      unreadNotifications,
      refreshNotifications,
      markLocalNotificationRead,
      clearLocalNotifications,
    ]
  )

  return <SocketContext.Provider value={value}>{children}</SocketContext.Provider>
}

export function useSocket() {
  const ctx = useContext(SocketContext)
  if (!ctx) throw new Error('useSocket must be used within SocketProvider')
  return ctx
}
