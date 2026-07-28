import { useCallback, useEffect, useRef, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { FiDownload, FiPaperclip, FiSend, FiSmile, FiTrash2, FiX } from 'react-icons/fi'
import { AnimatePresence, motion } from 'framer-motion'
import { ConfirmModal } from '../../../../shared/components/admin/ConfirmModal'
import { MessageReactions } from '../../../../shared/components/chat/MessageReactions'
import { ReadReceipt } from '../../../../shared/components/chat/ReadReceipt'
import { TypingIndicator } from '../../../../shared/components/chat/TypingIndicator'
import { useAuth } from '../../../../shared/context/AuthContext'
import { useToast } from '../../../../shared/context/ToastContext'
import { useSocket } from '../../../../shared/context/SocketContext'
import { useTypingIndicator } from '../../../../shared/hooks/useTypingIndicator'
import {
  deleteUserConversation,
  getUserConversation,
  getUserConversations,
  sendUserChatMessage,
  toggleMessageReaction,
} from '../../../../shared/services/cmsApi'
import type { ChatMessage, Conversation } from '../../../../shared/types/cms.types'
import { cn, formatDate } from '../../../../shared/utils/cn'
import { toUploadSrc } from '../../../../shared/utils/uploadUrl'

const EMOJIS = ['👍', '🙏', '😊', '🎉', '✅', '💡', '🔥', '👋']

export default function AccountMessagesPage() {
  const { success, error } = useToast()
  const { socket, setUnreadReplies } = useSocket()
  const { user } = useAuth()
  const [searchParams, setSearchParams] = useSearchParams()

  const [conversations, setConversations] = useState<Conversation[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedId, setSelectedId] = useState<string | null>(searchParams.get('c'))
  const [active, setActive] = useState<Conversation | null>(null)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [reply, setReply] = useState('')
  const [files, setFiles] = useState<File[]>([])
  const [sending, setSending] = useState(false)
  const [showEmoji, setShowEmoji] = useState(false)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [mobileShowChat, setMobileShowChat] = useState(Boolean(searchParams.get('c')))

  const bottomRef = useRef<HTMLDivElement>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  const { typingUser, onInputTyping, stopTyping } = useTypingIndicator(
    socket,
    selectedId,
    user?.id
  )

  const loadList = useCallback(() => {
    setLoading(true)
    getUserConversations({ page: 1, limit: 100, sort: 'newest' })
      .then((res) => setConversations(res.items))
      .catch(() => error('Failed to load messages'))
      .finally(() => setLoading(false))
  }, [error])

  useEffect(() => {
    loadList()
  }, [loadList])

  const openConversation = useCallback(
    async (id: string) => {
      if (selectedId && selectedId !== id) {
        socket?.emit('conversation:leave', selectedId)
        stopTyping()
      }
      setSelectedId(id)
      setSearchParams({ c: id }, { replace: true })
      setMobileShowChat(true)
      try {
        const data = await getUserConversation(id)
        setActive(data.conversation)
        setMessages(data.messages)
        setConversations((list) =>
          list.map((c) => (c.id === id ? { ...c, user_unread_count: 0 } : c))
        )
        setUnreadReplies(0)
        socket?.emit('conversation:join', id)
      } catch {
        error('Failed to open conversation')
      }
    },
    [error, setSearchParams, setUnreadReplies, socket, selectedId, stopTyping]
  )

  useEffect(() => {
    const q = searchParams.get('c')
    if (q) openConversation(q)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  useEffect(() => {
    if (!socket) return

    const onMessage = (payload: { conversation?: Conversation; message?: ChatMessage }) => {
      if (payload.conversation) {
        setConversations((list) => {
          const without = list.filter((c) => c.id !== payload.conversation!.id)
          return [payload.conversation!, ...without]
        })
      }
      if (payload.message && payload.message.conversation_id === selectedId) {
        setMessages((msgs) => {
          if (msgs.some((m) => m.id === payload.message!.id)) return msgs
          return [...msgs, payload.message!]
        })
      }
    }

    const onSeen = (payload: {
      conversationId?: string
      messageIds?: string[]
      messages?: ChatMessage[]
    }) => {
      if (payload.conversationId !== selectedId) return
      if (payload.messages?.length) {
        setMessages((msgs) =>
          msgs.map((m) => {
            const updated = payload.messages!.find((u) => u.id === m.id)
            return updated || m
          })
        )
        return
      }
      if (payload.messageIds?.length) {
        setMessages((msgs) =>
          msgs.map((m) =>
            payload.messageIds!.includes(m.id)
              ? { ...m, status: 'seen', seen_at: m.seen_at || new Date().toISOString() }
              : m
          )
        )
      }
    }

    const onReaction = (payload: { conversationId?: string; message?: ChatMessage }) => {
      if (payload.conversationId !== selectedId || !payload.message) return
      setMessages((msgs) =>
        msgs.map((m) => (m.id === payload.message!.id ? payload.message! : m))
      )
    }

    socket.on('message:new', onMessage)
    socket.on('conversation:updated', onMessage)
    socket.on('message_seen', onSeen)
    socket.on('conversation:read', onSeen)
    socket.on('reaction:update', onReaction)
    return () => {
      socket.off('message:new', onMessage)
      socket.off('conversation:updated', onMessage)
      socket.off('message_seen', onSeen)
      socket.off('conversation:read', onSeen)
      socket.off('reaction:update', onReaction)
    }
  }, [socket, selectedId])

  const onSend = async () => {
    if (!selectedId || (!reply.trim() && files.length === 0)) return
    stopTyping()
    setSending(true)
    try {
      const res = await sendUserChatMessage(selectedId, reply.trim() || ' ', files)
      setMessages((msgs) => [...msgs.filter((m) => m.id !== res.message.id), res.message])
      setActive(res.conversation)
      setConversations((list) => {
        const without = list.filter((c) => c.id !== res.conversation.id)
        return [res.conversation, ...without]
      })
      setReply('')
      setFiles([])
      success('Message sent')
    } catch {
      error('Failed to send')
    } finally {
      setSending(false)
    }
  }

  const onToggleReaction = async (messageId: string, reaction: string) => {
    try {
      const updated = await toggleMessageReaction(messageId, reaction)
      setMessages((msgs) => msgs.map((m) => (m.id === updated.id ? updated : m)))
    } catch {
      error('Failed to update reaction')
    }
  }

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-xl font-semibold text-brand-text">Messages</h2>
        <p className="mt-1 text-sm text-brand-muted">
          Inbox-style conversations with Admin. Replies appear instantly.
        </p>
      </div>

      <div className="flex h-[min(70vh,680px)] overflow-hidden rounded-2xl border border-brand-border bg-brand-card/90 shadow-lg backdrop-blur">
        <aside
          className={cn(
            'flex w-full flex-col border-r border-brand-border md:w-80',
            mobileShowChat ? 'hidden md:flex' : 'flex'
          )}
        >
          <div className="flex-1 overflow-y-auto">
            {loading ? (
              <p className="p-6 text-center text-sm text-brand-muted">Loading…</p>
            ) : conversations.length === 0 ? (
              <p className="p-6 text-center text-sm text-brand-muted">
                No messages yet. Use the Contact form on the portfolio to send one.
              </p>
            ) : (
              conversations.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => openConversation(c.id)}
                  className={cn(
                    'flex w-full gap-3 border-b border-brand-border/50 px-3 py-3 text-left hover:bg-brand-surface',
                    selectedId === c.id && 'bg-indigo-50/70 dark:bg-indigo-950/25'
                  )}
                >
                  <span className="relative flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-indigo-600 text-sm font-bold text-white">
                    A
                    <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full border-2 border-brand-card bg-emerald-500" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex justify-between gap-2">
                      <p className="truncate text-sm font-semibold text-brand-text">Admin</p>
                      <span className="text-[10px] text-brand-muted">{formatDate(c.last_message_at)}</span>
                    </div>
                    <p className="truncate text-xs font-medium text-brand-secondaryText">{c.subject}</p>
                    <div className="mt-0.5 flex items-center justify-between gap-2">
                      <p className="truncate text-xs text-brand-muted">{c.last_message_preview}</p>
                      <div className="flex items-center gap-1">
                        {c.user_unread_count > 0 && (
                          <span className="rounded-full bg-red-500 px-1.5 text-[10px] font-bold text-white">
                            {c.user_unread_count}
                          </span>
                        )}
                        <span className="rounded-full bg-brand-surface px-1.5 text-[10px] capitalize text-brand-muted">
                          {c.status}
                        </span>
                      </div>
                    </div>
                  </div>
                </button>
              ))
            )}
          </div>
        </aside>

        <section
          className={cn(
            'flex min-w-0 flex-1 flex-col',
            mobileShowChat ? 'flex' : 'hidden md:flex'
          )}
        >
          {!active ? (
            <div className="flex flex-1 items-center justify-center p-8 text-center text-sm text-brand-muted">
              Select a conversation to chat with Admin
            </div>
          ) : (
            <>
              <header className="flex items-center gap-3 border-b border-brand-border px-4 py-3">
                <button
                  type="button"
                  className="rounded-lg p-2 md:hidden"
                  onClick={() => setMobileShowChat(false)}
                >
                  <FiX />
                </button>
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-600 font-bold text-white">
                  A
                </span>
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-brand-text">Admin</p>
                  <p className="truncate text-xs text-brand-muted">{active.subject}</p>
                </div>
                <button
                  type="button"
                  className="rounded-xl p-2 text-red-400 hover:bg-brand-surface"
                  onClick={() => setDeleteId(active.id)}
                  aria-label="Delete conversation"
                >
                  <FiTrash2 />
                </button>
              </header>

              <div className="flex-1 space-y-3 overflow-y-auto bg-gradient-to-b from-brand-surface/30 to-transparent p-4">
                <AnimatePresence initial={false}>
                  {messages.map((m) => {
                    const mine = m.sender_role === 'user' || m.sender_role === 'guest'
                    const deleted = Boolean(m.deleted_at)
                    return (
                      <motion.div
                        key={m.id}
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={cn('flex flex-col gap-0.5', mine ? 'items-end' : 'items-start')}
                      >
                        <div
                          className={cn(
                            'max-w-[85%] rounded-2xl px-3.5 py-2.5 shadow-sm sm:max-w-[70%]',
                            mine
                              ? 'rounded-br-md bg-blue-600 text-white'
                              : 'rounded-bl-md bg-slate-200 text-slate-900 dark:bg-slate-700 dark:text-slate-100',
                            deleted && 'opacity-50'
                          )}
                        >
                          <p className="whitespace-pre-wrap text-sm">
                            {deleted ? 'This message was deleted.' : m.body}
                          </p>
                          {m.attachments?.length > 0 && (
                            <div className="mt-2 space-y-1">
                              {m.attachments.map((a) => (
                                <a
                                  key={a.id}
                                  href={toUploadSrc(a.file_url || a.file_path) || undefined}
                                  target="_blank"
                                  rel="noreferrer"
                                  download={a.file_name}
                                  className="flex items-center gap-1 text-xs underline opacity-90"
                                >
                                  <FiDownload size={12} />
                                  {a.file_name}
                                </a>
                              ))}
                            </div>
                          )}
                          <div
                            className={cn(
                              'mt-1 flex gap-2 text-[10px]',
                              mine ? 'text-blue-100' : 'text-slate-500 dark:text-slate-300'
                            )}
                          >
                            <span>{formatDate(m.created_at)}</span>
                            {mine && !deleted && (
                              <ReadReceipt
                                status={m.status}
                                deliveredAt={m.delivered_at}
                                seenAt={m.seen_at}
                              />
                            )}
                          </div>
                        </div>
                        {!deleted && (
                          <MessageReactions
                            reactions={m.reactions}
                            onToggle={(emoji) => onToggleReaction(m.id, emoji)}
                            align={mine ? 'right' : 'left'}
                          />
                        )}
                      </motion.div>
                    )
                  })}
                </AnimatePresence>
                <div ref={bottomRef} />
              </div>

              <div className="relative border-t border-brand-border p-3">
                {typingUser && (
                  <div className="mb-2">
                    <TypingIndicator name="Admin" label="Admin is typing..." />
                  </div>
                )}
                {files.length > 0 && (
                  <div className="mb-2 flex flex-wrap gap-2">
                    {files.map((f, i) => (
                      <span
                        key={`${f.name}-${i}`}
                        className="inline-flex items-center gap-1 rounded-full bg-brand-surface px-2 py-1 text-xs"
                      >
                        {f.name}
                        <button type="button" onClick={() => setFiles((arr) => arr.filter((_, j) => j !== i))}>
                          <FiX size={12} />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
                {showEmoji && (
                  <div className="absolute bottom-full left-3 mb-2 flex gap-1 rounded-xl border border-brand-border bg-brand-card p-2 shadow-lg">
                    {EMOJIS.map((e) => (
                      <button
                        key={e}
                        type="button"
                        className="rounded-lg p-1.5 text-lg hover:bg-brand-surface"
                        onClick={() => {
                          setReply((r) => r + e)
                          setShowEmoji(false)
                        }}
                      >
                        {e}
                      </button>
                    ))}
                  </div>
                )}
                <div className="flex items-end gap-2">
                  <button
                    type="button"
                    className="rounded-xl p-2.5 text-brand-muted hover:bg-brand-surface"
                    onClick={() => setShowEmoji((v) => !v)}
                  >
                    <FiSmile size={18} />
                  </button>
                  <button
                    type="button"
                    className="rounded-xl p-2.5 text-brand-muted hover:bg-brand-surface"
                    onClick={() => fileRef.current?.click()}
                  >
                    <FiPaperclip size={18} />
                  </button>
                  <input
                    ref={fileRef}
                    type="file"
                    className="hidden"
                    multiple
                    accept="image/*,.pdf,.doc,.docx,.zip"
                    onChange={(e) => {
                      const next = Array.from(e.target.files || [])
                      if (next.some((f) => f.size > 10 * 1024 * 1024)) {
                        error('Each file must be under 10MB')
                        return
                      }
                      setFiles((prev) => [...prev, ...next].slice(0, 5))
                      e.target.value = ''
                    }}
                  />
                  <textarea
                    value={reply}
                    onChange={(e) => {
                      setReply(e.target.value)
                      onInputTyping()
                    }}
                    onBlur={stopTyping}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault()
                        onSend()
                      }
                    }}
                    placeholder="Write a message…"
                    rows={2}
                    className="theme-input max-h-32 flex-1 resize-none py-2.5 text-sm"
                  />
                  <button
                    type="button"
                    onClick={onSend}
                    disabled={sending || (!reply.trim() && files.length === 0)}
                    className="btn-primary shrink-0 px-3 py-2.5"
                  >
                    <FiSend size={16} />
                  </button>
                </div>
              </div>
            </>
          )}
        </section>
      </div>

      <ConfirmModal
        open={Boolean(deleteId)}
        title="Delete conversation?"
        message="This removes the conversation from your inbox."
        confirmLabel="Delete"
        loading={false}
        onCancel={() => setDeleteId(null)}
        onConfirm={async () => {
          if (!deleteId) return
          try {
            await deleteUserConversation(deleteId)
            setConversations((list) => list.filter((c) => c.id !== deleteId))
            if (selectedId === deleteId) {
              setSelectedId(null)
              setActive(null)
              setMessages([])
              setMobileShowChat(false)
            }
            setDeleteId(null)
            success('Conversation deleted')
          } catch {
            error('Delete failed')
          }
        }}
      />
    </div>
  )
}
