/** Browser Notification helpers — request permission once, remember choice. */
const PERMISSION_KEY = 'browser_notif_permission_asked'

export function getNotificationPermission(): NotificationPermission | 'unsupported' {
  if (typeof window === 'undefined' || !('Notification' in window)) return 'unsupported'
  return Notification.permission
}

export function hasAskedNotificationPermission(): boolean {
  try {
    return localStorage.getItem(PERMISSION_KEY) === '1'
  } catch {
    return false
  }
}

export async function requestNotificationPermissionOnce(): Promise<NotificationPermission | 'unsupported'> {
  if (typeof window === 'undefined' || !('Notification' in window)) return 'unsupported'

  if (Notification.permission !== 'default') {
    try {
      localStorage.setItem(PERMISSION_KEY, '1')
    } catch {
      /* ignore */
    }
    return Notification.permission
  }

  if (hasAskedNotificationPermission()) {
    return Notification.permission
  }

  try {
    localStorage.setItem(PERMISSION_KEY, '1')
  } catch {
    /* ignore */
  }

  try {
    return await Notification.requestPermission()
  } catch {
    return Notification.permission
  }
}

export type BrowserNotifPayload = {
  title: string
  body?: string
  conversationId?: string
  tag?: string
  onClickPath?: string
}

export function showBrowserNotification(payload: BrowserNotifPayload) {
  if (typeof window === 'undefined' || !('Notification' in window)) return
  if (Notification.permission !== 'granted') return
  if (document.visibilityState === 'visible' && document.hasFocus()) return

  try {
    const n = new Notification(payload.title, {
      body: payload.body || '',
      tag: payload.tag || payload.conversationId || 'message',
    })

    n.onclick = () => {
      window.focus()
      const path = payload.onClickPath
      if (path) {
        window.location.assign(path)
      }
      n.close()
    }
  } catch {
    /* ignore */
  }
}
