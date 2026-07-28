import { AnimatePresence, motion } from 'framer-motion'

type Props = {
  name: string
  label?: string
}

export function TypingIndicator({ name, label }: Props) {
  const text = label || `${name} is typing...`

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 4 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 4 }}
        className="flex items-center gap-2 px-1 py-1 text-xs text-brand-muted"
        aria-live="polite"
      >
        <span className="inline-flex items-center gap-1 rounded-full bg-brand-surface px-2.5 py-1.5 shadow-sm">
          <span className="typing-dot h-1.5 w-1.5 rounded-full bg-brand-muted" />
          <span className="typing-dot h-1.5 w-1.5 rounded-full bg-brand-muted [animation-delay:0.15s]" />
          <span className="typing-dot h-1.5 w-1.5 rounded-full bg-brand-muted [animation-delay:0.3s]" />
        </span>
        <span className="italic">{text}</span>
      </motion.div>
    </AnimatePresence>
  )
}
