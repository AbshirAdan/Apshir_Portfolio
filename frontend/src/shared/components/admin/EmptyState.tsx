import type { ReactNode } from 'react'
import type { IconType } from 'react-icons'
import { motion } from 'framer-motion'

type EmptyStateProps = {
  icon?: IconType
  title?: string
  message: string
  action?: ReactNode
}

export function EmptyState({ icon: Icon, title, message, action }: EmptyStateProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex flex-col items-center justify-center rounded-xl border border-dashed border-brand-border bg-brand-card px-6 py-16 text-center transition-colors duration-300"
    >
      {Icon && (
        <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-surface text-brand-muted">
          <Icon size={28} />
        </div>
      )}
      {title && <h3 className="mb-1 text-lg font-semibold text-brand-text">{title}</h3>}
      <p className="max-w-sm text-sm text-brand-muted">{message}</p>
      {action && <div className="mt-6">{action}</div>}
    </motion.div>
  )
}
