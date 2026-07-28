import { useEffect, useRef, useState, type ReactNode } from 'react'
import { motion, useInView } from 'framer-motion'

type Props = {
  end: number
  suffix?: string
  label: string
  icon: ReactNode
  colorClass?: string
}

function useAnimatedNumber(target: number, active: boolean, duration = 2000) {
  const [value, setValue] = useState(0)

  useEffect(() => {
    if (!active) {
      setValue(0)
      return
    }

    let startTime: number | null = null
    let frameId = 0

    const step = (timestamp: number) => {
      if (startTime === null) startTime = timestamp
      const progress = Math.min((timestamp - startTime) / duration, 1)
      setValue(Math.round(progress * target))
      if (progress < 1) frameId = requestAnimationFrame(step)
    }

    frameId = requestAnimationFrame(step)
    return () => cancelAnimationFrame(frameId)
  }, [target, active, duration])

  return value
}

export function StatCounter({ end, suffix = '', label, icon, colorClass = 'from-brand-primary/10 to-brand-secondary/10' }: Props) {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, margin: '-40px' })
  const value = useAnimatedNumber(end, inView)

  return (
    <motion.div
      ref={ref}
      whileHover={{ y: -4, scale: 1.02 }}
      transition={{ type: 'spring', stiffness: 300, damping: 22 }}
      className="stat-card group"
    >
      <div className={`mb-3 inline-flex rounded-xl bg-gradient-to-br ${colorClass} p-2.5 text-brand-primary dark:text-brand-secondary`}>
        {icon}
      </div>
      <p className="text-2xl font-bold text-slate-900 dark:text-white md:text-3xl">
        {value}
        {suffix}
      </p>
      <p className="mt-1 text-xs font-medium text-brand-muted md:text-sm">{label}</p>
    </motion.div>
  )
}
