import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import {
  FiArchive,
  FiBookmark,
  FiEdit2,
  FiPaperclip,
  FiSearch,
  FiSend,
  FiSmile,
  FiTrash2,
  FiX,
} from 'react-icons/fi'
import { AnimatePresence, motion } from 'framer-motion'
import { ConfirmModal } from '../../../shared/components/admin/ConfirmModal'
import { PageHeader } from '../../../shared/components/admin/PageHeader'
import { MessageReactions } from '../../../shared/components/chat/MessageReactions'
import { ReadReceipt } from '../../../shared/components/chat/ReadReceipt'
import { TypingIndicator } from '../../../shared/components/chat/TypingIndicator'
import { Badge, Button } from '../../../shared/components/ui'
import { useAuth } from '../../../shared/context/AuthContext'
import { useToast } from '../../../shared/context/ToastContext'
import { useSocket } from '../../../shared/context/SocketContext'
import { useTypingIndicator } from '../../../shared/hooks/useTypingIndicator'
import {
  archiveConversation,
  deleteChatMessage,
  deleteConversation,
  editChatMessage,
  getAdminConversation,
  getAdminConversations,
  markConversationUnread,
  pinConversation,
  sendAdminChatMessage,
  toggleMessageReaction,
  unpinConversation,
} from '../../../shared/services/cmsApi'
import type { ChatMessage, Conversation, MessageStats } from '../../../shared/types/cms.types'
import { cn, formatDate } from '../../../shared/utils/cn'
import { toUploadSrc } from '../../../shared/utils/uploadUrl'

const EMOJIS = ['👍', '🙏', '😊', '🎉', '✅', '💡', '🔥', '👋']

const emptyStats: MessageStats = {
  unread: 0,
  read: 0,
  replied: 0,
  archived: 0,
  total: 0,
  open: 0,
}

function initials(name: string) {
  return (name || 'U')
    .split(' ')
    .map((p) => p[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()
}

export default function MessagesPage() {
  const { success, error } = useToast()
  const { socket } = useSocket()
  const { user } = useAuth()
  const [searchParams, setSearchParams] = useSearchParams()

  const [conversations, setConversations] = useState<Conversation[]>([])
  const [stats, setStats] = useState<MessageStats>(emptyStats)
  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [status, setStatus] = useState('')
  const [sort, setSort] = useState<'newest' | 'oldest'>('newest')
  const [loading, setLoading] = useState(true)

  const [selectedId, setSelectedId] = useState<string | null>(searchParams.get('c'))
  const [active, setActive] = useState<Conversation | null>(null)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [detailLoading, setDetailLoading] = useState(false)

  const [reply, setReply] = useState('')
  const [files, setFiles] = useState<File[]>([])
  const [sending, setSending] = useState(false)
  const [showEmoji, setShowEmoji] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editBody, setEditBody] = useState('')
  const [deleteConvId, setDeleteConvId] = useState<string | null>(null)
  const [mobileShowChat, setMobileShowChat] = useState(false)

  const bottomRef = useRef<HTMLDivElement>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  const { typingUser, onInputTyping, stopTyping } = useTypingIndicator(
    socket,
    selectedId,
    user?.id
  )

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 300)
    return () => clearTimeout(t)
  }, [search])

  const loadList = useCallback(() => {
    setLoading(true)
    getAdminConversations({
      page: 1,
      limit: 100,
      search: debouncedSearch || undefined,
      status: status || undefined,
      sort,
    })
      .then((res) => {
        setConversations(res.items)
        if (res.stats) setStats(res.stats)
      })
      .catch(() => error('Failed to load conversations'))
      .finally(() => setLoading(false))
  }, [debouncedSearch, status, sort, error])

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
      setDetailLoading(true)
      try {
        const data = await getAdminConversation(id)
        setActive(data.conversation)
        setMessages(data.messages)
        setConversations((list) =>
          list.map((c) => (c.id === id ? { ...c, admin_unread_count: 0 } : c))
        )
        socket?.emit('conversation:join', id)
      } catch {
        error('Failed to open conversation')
      } finally {
        setDetailLoading(false)
      }
    },
    [error, setSearchParams, socket, selectedId, stopTyping]
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

    const onNewConv = (payload: { conversation?: Conversation }) => {
      if (payload.conversation) {
        setConversations((list) => {
          const without = list.filter((c) => c.id !== payload.conversation!.id)
          return [payload.conversation!, ...without]
        })
      } else loadList()
    }

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

    const onUpdated = (payload: { conversation?: Conversation; conversationId?: string; message?: ChatMessage }) => {
      if (payload.conversation) {
        setConversations((list) =>
          list.map((c) => (c.id === payload.conversation!.id ? payload.conversation! : c))
        )
        if (payload.conversation.id === selectedId) setActive(payload.conversation)
      }
      if (payload.message && payload.message.conversation_id === selectedId) {
        setMessages((msgs) =>
          msgs.map((m) => (m.id === payload.message!.id ? payload.message! : m))
        )
      }
    }

    const onDeleted = (payload: { conversationId?: string }) => {
      if (!payload.conversationId) return
      setConversations((list) => list.filter((c) => c.id !== payload.conversationId))
      if (selectedId === payload.conversationId) {
        setSelectedId(null)
        setActive(null)
        setMessages([])
        setMobileShowChat(false)
      }
    }

    const onPresence = (payload: { userId: string; isOnline: boolean; lastSeen: string }) => {
      setConversations((list) =>
        list.map((c) =>
          c.user_id === payload.userId
            ? { ...c, is_online: payload.isOnline, last_seen: payload.lastSeen }
            : c
        )
      )
      setActive((cur) =>
        cur?.user_id === payload.userId
          ? { ...cur, is_online: payload.isOnline, last_seen: payload.lastSeen }
          : cur
      )
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

    const onDelivered = (payload: { conversationId?: string; message?: ChatMessage }) => {
      if (payload.conversationId !== selectedId || !payload.message) return
      setMessages((msgs) =>
        msgs.map((m) => (m.id === payload.message!.id ? { ...m, ...payload.message } : m))
      )
    }

    socket.on('conversation:new', onNewConv)
    socket.on('message:new', onMessage)
    socket.on('message:updated', onUpdated)
    socket.on('conversation:updated', onUpdated)
    socket.on('conversation:deleted', onDeleted)
    socket.on('presence:update', onPresence)
    socket.on('message_seen', onSeen)
    socket.on('conversation:read', onSeen)
    socket.on('reaction:update', onReaction)
    socket.on('message:delivered', onDelivered)

    return () => {
      socket.off('conversation:new', onNewConv)
      socket.off('message:new', onMessage)
      socket.off('message:updated', onUpdated)
      socket.off('conversation:updated', onUpdated)
      socket.off('conversation:deleted', onDeleted)
      socket.off('presence:update', onPresence)
      socket.off('message_seen', onSeen)
      socket.off('conversation:read', onSeen)
      socket.off('reaction:update', onReaction)
      socket.off('message:delivered', onDelivered)
    }
  }, [socket, selectedId, loadList])

  const onSend = async () => {
    if (!selectedId || (!reply.trim() && files.length === 0)) return
    stopTyping()
    setSending(true)
    try {
      const res = await sendAdminChatMessage(selectedId, reply.trim() || ' ', files)
      setMessages((msgs) => [...msgs.filter((m) => m.id !== res.message.id), res.message])
      setActive(res.conversation)
      setConversations((list) => {
        const without = list.filter((c) => c.id !== res.conversation.id)
        return [res.conversation, ...without]
      })
      setReply('')
      setFiles([])
      success('Reply sent')
    } catch {
      error('Failed to send reply')
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

  const onSaveEdit = async () => {
    if (!editingId || !editBody.trim()) return
    try {
      const updated = await editChatMessage(editingId, editBody.trim())
      setMessages((msgs) => msgs.map((m) => (m.id === updated.id ? updated : m)))
      setEditingId(null)
      success('Message updated')
    } catch {
      error('Failed to edit message')
    }
  }

  const onDeleteMsg = async (id: string) => {
    try {
      await deleteChatMessage(id)
      setMessages((msgs) =>
        msgs.map((m) =>
          m.id === id
            ? { ...m, deleted_at: new Date().toISOString(), status: 'deleted', body: m.body }
            : m
        )
      )
      success('Message deleted')
    } catch {
      error('Failed to delete message')
    }
  }

  const statsCards = useMemo(
    () => [
      { label: 'Total', value: stats.total },
      { label: 'Unread', value: stats.unread },
      { label: 'Open', value: stats.open ?? stats.read },
      { label: 'Archived', value: stats.archived },
    ],
    [stats]
  )

  return (
    <div className="space-y-4">
      <PageHeader
        title="Communication Center"
        description="Professional inbox for contact conversations and live chat with users."
      />

      <div className="grid gap-3 sm:grid-cols-4">
        {statsCards.map((s) => (
          <div
            key={s.label}
            className="rounded-2xl border border-brand-border bg-brand-card/80 p-4 shadow-sm backdrop-blur"
          >
            <p className="text-xs font-medium text-brand-muted">{s.label}</p>
            <p className="mt-1 text-2xl font-semibold text-brand-text">{s.value}</p>
          </div>
        ))}
      </div>

      <div className="flex h-[min(72vh,720px)] overflow-hidden rounded-2xl border border-brand-border bg-brand-card shadow-lg">
        {/* Left panel */}
        <aside
          className={cn(
            'flex w-full flex-col border-r border-brand-border md:w-[340px] md:shrink-0',
            mobileShowChat ? 'hidden md:flex' : 'flex'
          )}
        >
          <div className="space-y-2 border-b border-brand-border p-3">
            <div className="relative">
              <FiSearch className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-brand-muted" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search user, email, subject…"
                className="theme-input w-full py-2.5 pl-9 pr-3 text-sm"
              />
            </div>
            <div className="flex gap-2">
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="theme-input flex-1 py-2 text-xs"
              >
                <option value="">All</option>
                <option value="unread">Unread</option>
                <option value="read">Read</option>
                <option value="archived">Archived</option>
              </select>
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value as 'newest' | 'oldest')}
                className="theme-input flex-1 py-2 text-xs"
              >
                <option value="newest">Newest</option>
                <option value="oldest">Oldest</option>
              </select>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto">
            {loading ? (
              <p className="p-6 text-center text-sm text-brand-muted">Loading…</p>
            ) : conversations.length === 0 ? (
              <p className="p-6 text-center text-sm text-brand-muted">No conversations yet</p>
            ) : (
              conversations.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => openConversation(c.id)}
                  className={cn(
                    'flex w-full gap-3 border-b border-brand-border/50 px-3 py-3 text-left transition hover:bg-brand-surface',
                    selectedId === c.id && 'bg-indigo-50/80 dark:bg-indigo-950/30'
                  )}
                >
                  <div className="relative shrink-0">
                    {c.avatar ? (
                      <img
                        src={toUploadSrc(c.avatar) || undefined}
                        alt=""
                        className="h-11 w-11 rounded-full object-cover"
                      />
                    ) : (
                      <span className="flex h-11 w-11 items-center justify-center rounded-full bg-indigo-100 text-xs font-bold text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300">
                        {initials(c.guest_name)}
                      </span>
                    )}
                    <span
                      className={cn(
                        'absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-brand-card',
                        c.is_online ? 'bg-emerald-500' : 'bg-slate-400'
                      )}
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <p className="truncate text-sm font-semibold text-brand-text">
                        {c.is_pinned ? '📌 ' : ''}
                        {c.guest_name}
                      </p>
                      <span className="shrink-0 text-[10px] text-brand-muted">
                        {formatDate(c.last_message_at)}
                      </span>
                    </div>
                    <p className="truncate text-xs font-medium text-brand-secondaryText">{c.subject}</p>
                    <div className="mt-0.5 flex items-center justify-between gap-2">
                      <p className="truncate text-xs text-brand-muted">{c.last_message_preview}</p>
                      {c.admin_unread_count > 0 && (
                        <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-indigo-600 px-1.5 text-[10px] font-bold text-white">
                          {c.admin_unread_count}
                        </span>
                      )}
                    </div>
                  </div>
                </button>
              ))
            )}
          </div>
        </aside>

        {/* Right panel */}
        <section
          className={cn(
            'flex min-w-0 flex-1 flex-col',
            mobileShowChat ? 'flex' : 'hidden md:flex'
          )}
        >
          {!active ? (
            <div className="flex flex-1 flex-col items-center justify-center gap-2 p-8 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600 dark:bg-indigo-950 dark:text-indigo-300">
                <FiSend size={28} />
              </div>
              <p className="text-lg font-semibold text-brand-text">Select a conversation</p>
              <p className="max-w-sm text-sm text-brand-muted">
                Choose a thread from the inbox to reply in real time.
              </p>
            </div>
          ) : (
            <>
              <header className="flex items-center gap-3 border-b border-brand-border px-4 py-3">
                <button
                  type="button"
                  className="rounded-lg p-2 text-brand-muted hover:bg-brand-surface md:hidden"
                  onClick={() => setMobileShowChat(false)}
                  aria-label="Back"
                >
                  <FiX />
                </button>
                {active.avatar ? (
                  <img
                    src={toUploadSrc(active.avatar) || undefined}
                    alt=""
                    className="h-10 w-10 rounded-full object-cover"
                  />
                ) : (
                  <span className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-100 text-sm font-bold text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300">
                    {initials(active.guest_name)}
                  </span>
                )}
                <div className="min-w-0 flex-1">
                  <p className="truncate font-semibold text-brand-text">{active.guest_name}</p>
                  <p className="truncate text-xs text-brand-muted">
                    {active.guest_email} ·{' '}
                    {active.is_online
                      ? 'Online'
                      : active.last_seen
                        ? `Last seen ${formatDate(active.last_seen)}`
                        : 'Offline'}
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-1">
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={async () => {
                      try {
                        const updated = active.is_pinned
                          ? await unpinConversation(active.id)
                          : await pinConversation(active.id)
                        setActive(updated)
                        loadList()
                      } catch {
                        error('Pin failed')
                      }
                    }}
                  >
                    <FiBookmark size={14} />
                  </Button>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={async () => {
                      try {
                        await markConversationUnread(active.id)
                        success('Marked unread')
                        loadList()
                      } catch {
                        error('Failed')
                      }
                    }}
                  >
                    Unread
                  </Button>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={async () => {
                      try {
                        const updated = await archiveConversation(active.id)
                        setActive(updated)
                        success('Archived')
                        loadList()
                      } catch {
                        error('Archive failed')
                      }
                    }}
                  >
                    <FiArchive size={14} />
                  </Button>
                  <Button variant="danger" size="sm" onClick={() => setDeleteConvId(active.id)}>
                    <FiTrash2 size={14} />
                  </Button>
                </div>
              </header>

              <div className="border-b border-brand-border bg-brand-surface/50 px-4 py-2">
                <p className="text-xs font-medium text-brand-muted">Subject</p>
                <p className="text-sm font-semibold text-brand-text">{active.subject}</p>
                    <Badge>{active.status}</Badge>
              </div>

              <div className="flex-1 space-y-3 overflow-y-auto bg-gradient-to-b from-brand-surface/40 to-transparent p-4">
                {detailLoading ? (
                  <p className="text-center text-sm text-brand-muted">Loading messages…</p>
                ) : (
                  <AnimatePresence initial={false}>
                    {messages.map((m) => {
                      const isAdmin = m.sender_role === 'admin'
                      const deleted = Boolean(m.deleted_at)
                      return (
                        <motion.div
                          key={m.id}
                          initial={{ opacity: 0, y: 8 }}
                          animate={{ opacity: 1, y: 0 }}
                          className={cn('flex flex-col gap-0.5', isAdmin ? 'items-end' : 'items-start')}
                        >
                          <div
                            className={cn(
                              'max-w-[85%] rounded-2xl px-3.5 py-2.5 shadow-sm sm:max-w-[70%]',
                              isAdmin
                                ? 'rounded-br-md bg-indigo-600 text-white'
                                : 'rounded-bl-md bg-slate-200 text-slate-900 dark:bg-slate-700 dark:text-slate-100',
                              deleted && 'opacity-50'
                            )}
                          >
                            {editingId === m.id ? (
                              <div className="space-y-2">
                                <textarea
                                  value={editBody}
                                  onChange={(e) => setEditBody(e.target.value)}
                                  className="w-full rounded-lg border-0 bg-white/20 p-2 text-sm text-inherit"
                                  rows={3}
                                />
                                <div className="flex gap-2">
                                  <button type="button" className="text-xs underline" onClick={onSaveEdit}>
                                    Save
                                  </button>
                                  <button
                                    type="button"
                                    className="text-xs underline"
                                    onClick={() => setEditingId(null)}
                                  >
                                    Cancel
                                  </button>
                                </div>
                              </div>
                            ) : (
                              <>
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
                                        className="flex items-center gap-1 text-xs underline opacity-90"
                                      >
                                        <FiPaperclip size={12} />
                                        {a.file_name}
                                      </a>
                                    ))}
                                  </div>
                                )}
                              </>
                            )}
                            <div
                              className={cn(
                                'mt-1 flex items-center gap-2 text-[10px]',
                                isAdmin ? 'text-indigo-100' : 'text-slate-500 dark:text-slate-300'
                              )}
                            >
                              <span>{formatDate(m.created_at)}</span>
                              {m.edited_at && <span>· Edited</span>}
                              {isAdmin && !deleted && (
                                <ReadReceipt
                                  status={m.status}
                                  deliveredAt={m.delivered_at}
                                  seenAt={m.seen_at}
                                />
                              )}
                              {isAdmin && !deleted && (
                                <>
                                  <button
                                    type="button"
                                    className="opacity-80 hover:opacity-100"
                                    onClick={() => {
                                      setEditingId(m.id)
                                      setEditBody(m.body)
                                    }}
                                    aria-label="Edit"
                                  >
                                    <FiEdit2 size={11} />
                                  </button>
                                  <button
                                    type="button"
                                    className="opacity-80 hover:opacity-100"
                                    onClick={() => onDeleteMsg(m.id)}
                                    aria-label="Delete"
                                  >
                                    <FiTrash2 size={11} />
                                  </button>
                                </>
                              )}
                            </div>
                          </div>
                          {!deleted && (
                            <MessageReactions
                              reactions={m.reactions}
                              onToggle={(emoji) => onToggleReaction(m.id, emoji)}
                              align={isAdmin ? 'right' : 'left'}
                            />
                          )}
                        </motion.div>
                      )
                    })}
                  </AnimatePresence>
                )}
                <div ref={bottomRef} />
              </div>

              <div className="relative border-t border-brand-border p-3">
                {typingUser && (
                  <div className="mb-2">
                    <TypingIndicator
                      name={typingUser.userName}
                      label={
                        typingUser.role === 'admin'
                          ? 'Admin is typing...'
                          : `${typingUser.userName.split(' ')[0] || 'User'} is typing...`
                      }
                    />
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
                    aria-label="Emoji"
                  >
                    <FiSmile size={18} />
                  </button>
                  <button
                    type="button"
                    className="rounded-xl p-2.5 text-brand-muted hover:bg-brand-surface"
                    onClick={() => fileRef.current?.click()}
                    aria-label="Attach"
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
                      const oversized = next.find((f) => f.size > 10 * 1024 * 1024)
                      if (oversized) {
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
                    placeholder="Write a reply…"
                    rows={2}
                    className="theme-input max-h-32 flex-1 resize-none py-2.5 text-sm"
                  />
                  <Button onClick={onSend} disabled={sending || (!reply.trim() && files.length === 0)}>
                    <FiSend size={16} />
                  </Button>
                </div>
              </div>
            </>
          )}
        </section>
      </div>

      <ConfirmModal
        open={Boolean(deleteConvId)}
        title="Delete conversation?"
        message="This permanently removes the conversation and its messages."
        confirmLabel="Delete"
        loading={false}
        onCancel={() => setDeleteConvId(null)}
        onConfirm={async () => {
          if (!deleteConvId) return
          try {
            await deleteConversation(deleteConvId)
            setConversations((list) => list.filter((c) => c.id !== deleteConvId))
            if (selectedId === deleteConvId) {
              setSelectedId(null)
              setActive(null)
              setMessages([])
            }
            setDeleteConvId(null)
            success('Conversation deleted')
          } catch {
            error('Delete failed')
          }
        }}
      />
    </div>
  )
}
