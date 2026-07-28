import { motion } from 'framer-motion'
import type { ReactNode } from 'react'

type Props = {
  id?: string
  title: string
  subtitle?: string
  children: ReactNode
  className?: string
}

export function Section({ id, title, subtitle, children, className = '' }: Props) {
  return (
    <section id={id} className={`scroll-mt-24 py-20 md:scroll-mt-28 md:py-28 ${className}`}>
      <div className="section-container">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.5 }}
          className="mb-12 text-center md:mb-16"
        >
          <p className="mb-2 text-sm font-semibold uppercase tracking-widest text-brand-secondary">Section</p>
          <h2 className="text-3xl font-bold text-brand-text md:text-4xl lg:text-5xl">{title}</h2>
          {subtitle && (
            <p className="mx-auto mt-4 max-w-2xl text-brand-muted">{subtitle}</p>
          )}
        </motion.div>
        {children}
      </div>
    </section>
  )
}
