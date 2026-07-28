import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import type { IconType } from 'react-icons'
import { cn } from '../../utils/cn'

type StatCardProps = {
  label: string
  value: number | string
  icon: IconType
  href?: string
  color?: 'indigo' | 'emerald' | 'amber' | 'rose' | 'sky' | 'violet'
}

const colorMap = {
  indigo: 'bg-indigo-50 text-indigo-600 dark:bg-indigo-950 dark:text-indigo-400',
  emerald: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400',
  amber: 'bg-amber-50 text-amber-600 dark:bg-amber-950 dark:text-amber-400',
  rose: 'bg-rose-50 text-rose-600 dark:bg-rose-950 dark:text-rose-400',
  sky: 'bg-sky-50 text-sky-600 dark:bg-sky-950 dark:text-sky-400',
  violet: 'bg-violet-50 text-violet-600 dark:bg-violet-950 dark:text-violet-400',
}

export function StatCard({ label, value, icon: Icon, href, color = 'indigo' }: StatCardProps) {
  const content = (
    <motion.div
      whileHover={{ y: -2 }}
      className="theme-card rounded-xl p-5 transition hover:shadow-md"
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-brand-muted">{label}</p>
          <p className="mt-2 text-3xl font-bold text-brand-text">{value}</p>
        </div>
        <div className={cn('flex h-11 w-11 items-center justify-center rounded-xl', colorMap[color])}>
          <Icon size={20} />
        </div>
      </div>
    </motion.div>
  )

  if (href) {
    return (
      <Link to={href} className="block">
        {content}
      </Link>
    )
  }

  return content
}
