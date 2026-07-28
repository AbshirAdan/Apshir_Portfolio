import { useCallback, useEffect, useRef, useState } from 'react'
import type { Socket } from 'socket.io-client'

type TypingUser = {
  userId: string
  userName: string
  role?: string
}

/**
 * Emits typing:start / typing:stop and listens for peer typing in one conversation.
 * Auto-stops after 2s of inactivity. Scoped to conversationId.
 */
export function useTypingIndicator(
  socket: Socket | null,
  conversationId: string | null,
  selfUserId?: string | null
) {
  const [typingUser, setTypingUser] = useState<TypingUser | null>(null)
  const idleTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const peerTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const isTyping = useRef(false)

  useEffect(() => {
    setTypingUser(null)
    isTyping.current = false
    if (idleTimer.current) clearTimeout(idleTimer.current)
    if (peerTimer.current) clearTimeout(peerTimer.current)
  }, [conversationId])

  useEffect(() => {
    if (!socket || !conversationId) return

    const onStart = (payload: {
      conversationId?: string
      userId?: string
      userName?: string
      role?: string
    }) => {
      if (payload.conversationId !== conversationId) return
      if (!payload.userId || payload.userId === selfUserId) return
      setTypingUser({
        userId: payload.userId,
        userName: payload.userName || (payload.role === 'admin' ? 'Admin' : 'User'),
        role: payload.role,
      })
      if (peerTimer.current) clearTimeout(peerTimer.current)
      peerTimer.current = setTimeout(() => setTypingUser(null), 2200)
    }

    const onStop = (payload: { conversationId?: string; userId?: string }) => {
      if (payload.conversationId !== conversationId) return
      if (payload.userId && typingUser?.userId && payload.userId !== typingUser.userId) return
      setTypingUser(null)
    }

    socket.on('typing:start', onStart)
    socket.on('typing:stop', onStop)
    return () => {
      socket.off('typing:start', onStart)
      socket.off('typing:stop', onStop)
      if (peerTimer.current) clearTimeout(peerTimer.current)
    }
  }, [socket, conversationId, selfUserId, typingUser?.userId])

  const stopTyping = useCallback(() => {
    if (!socket || !conversationId || !isTyping.current) return
    isTyping.current = false
    if (idleTimer.current) clearTimeout(idleTimer.current)
    socket.emit('typing:stop', { conversationId })
  }, [socket, conversationId])

  const onInputTyping = useCallback(() => {
    if (!socket || !conversationId) return

    if (!isTyping.current) {
      isTyping.current = true
      socket.emit('typing:start', { conversationId })
    }

    if (idleTimer.current) clearTimeout(idleTimer.current)
    idleTimer.current = setTimeout(() => {
      stopTyping()
    }, 2000)
  }, [socket, conversationId, stopTyping])

  useEffect(() => () => stopTyping(), [stopTyping])

  return { typingUser, onInputTyping, stopTyping }
}
