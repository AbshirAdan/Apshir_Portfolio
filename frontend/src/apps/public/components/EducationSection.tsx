import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { getPublicEducation } from '../../../shared/services/publicApi'
import type { Education } from '../../../shared/types/cms.types'
import { Section } from './Section'
import { formatDate } from '../../../shared/utils/cn'

export function EducationSection() {
  const [items, setItems] = useState<Education[]>([])

  useEffect(() => {
    getPublicEducation().then(setItems).catch(() => {})
  }, [])

  if (items.length === 0) return null

  return (
    <Section id="education" title="Education" subtitle="Academic foundation and continuous learning">
      <div className="relative mx-auto max-w-5xl">
        {/* Timeline Central Line */}
        <div className="absolute bottom-0 left-6 lg:left-1/2 top-0 w-0.5 bg-gradient-to-b from-brand-primary via-brand-secondary to-brand-accent lg:-translate-x-px" />
        
        <div className="space-y-10">
          {items.map((edu, i) => (
            <motion.div
              key={edu.id}
              initial={{ opacity: 0, x: i % 2 === 0 ? -24 : 24 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
              className={`relative flex items-center w-full justify-start ${
                i % 2 === 0 ? 'lg:justify-start' : 'lg:justify-end'
              }`}
            >
              {/* Bullet Point */}
              <span className="absolute left-6 lg:left-1/2 h-4 w-4 -translate-x-2 lg:-translate-x-2 rounded-full bg-brand-primary ring-4 ring-brand-bg z-10" />

              {/* Card Container */}
              <div className="glass-card relative ml-12 w-full p-6 lg:ml-0 lg:w-[calc(50%-2.5rem)] hover:shadow-lg transition-all duration-300">
                <p className="text-xs sm:text-sm font-semibold text-brand-secondary">
                  {edu.start_date ? formatDate(edu.start_date) : '—'} – {edu.end_date ? formatDate(edu.end_date) : 'Present'}
                </p>
                <h3 className="mt-2 text-lg sm:text-xl font-bold text-brand-text leading-tight">{edu.school}</h3>
                <p className="text-sm text-brand-muted mt-1">{edu.degree}{edu.field ? ` in ${edu.field}` : ''}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </Section>
  )
}
