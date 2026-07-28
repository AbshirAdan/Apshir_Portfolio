import { useMemo, useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import type { MessageReactionGroup } from '../../types/cms.types'
import { cn } from '../../utils/cn'

export const REACTION_EMOJIS = ['👍', '❤️', '😂', '🎉', '👏', '🔥', '😮', '😢'] as const

type Props = {
  reactions?: MessageReactionGroup[]
  onToggle: (reaction: string) => void
  disabled?: boolean
  align?: 'left' | 'right'
}

export function MessageReactions({
  reactions = [],
  onToggle,
  disabled,
  align = 'left',
}: Props) {
  const { user } = useAuth()
  const [open, setOpen] = useState(false)

  const mine = useMemo(
    () => new Set(reactions.flatMap((r) => (r.user_ids.includes(user?.id || '') ? [r.reaction] : []))),
    [reactions, user?.id]
  )

  return (
    <div className={cn('mt-1 flex flex-wrap items-center gap-1', align === 'right' && 'justify-end')}>
      {reactions.map((r) => {
        const names = r.users.map((u) => u.name).join(', ')
        return (
          <button
            key={r.reaction}
            type="button"
            title={names || r.reaction}
            disabled={disabled}
            onClick={() => onToggle(r.reaction)}
            className={cn(
              'inline-flex items-center gap-1 rounded-full border px-1.5 py-0.5 text-xs transition',
              mine.has(r.reaction)
                ? 'border-indigo-400 bg-indigo-50 dark:border-indigo-500 dark:bg-indigo-950/40'
                : 'border-brand-border bg-brand-card hover:bg-brand-surface'
            )}
          >
            <span>{r.reaction}</span>
            <span className="font-medium text-brand-muted">{r.count}</span>
          </button>
        )
      })}

      <div className="relative">
        <button
          type="button"
          disabled={disabled}
          onClick={() => setOpen((v) => !v)}
          className="rounded-full border border-dashed border-brand-border px-1.5 py-0.5 text-xs text-brand-muted hover:bg-brand-surface"
          aria-label="Add reaction"
        >
          🙂+
        </button>
        {open && (
          <div
            className={cn(
              'absolute z-20 mb-1 flex gap-0.5 rounded-xl border border-brand-border bg-brand-card p-1.5 shadow-lg',
              align === 'right' ? 'right-0 bottom-full' : 'left-0 bottom-full'
            )}
          >
            {REACTION_EMOJIS.map((emoji) => (
              <button
                key={emoji}
                type="button"
                className="rounded-lg p-1 text-base hover:bg-brand-surface"
                onClick={() => {
                  onToggle(emoji)
                  setOpen(false)
                }}
              >
                {emoji}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
