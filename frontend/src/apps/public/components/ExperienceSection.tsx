import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { getPublicExperience } from '../../../shared/services/publicApi'
import type { Experience } from '../../../shared/types/cms.types'
import { Section } from './Section'
import { formatDate } from '../../../shared/utils/cn'

export function ExperienceSection() {
  const [items, setItems] = useState<Experience[]>([])

  useEffect(() => {
    getPublicExperience().then(setItems).catch(() => {})
  }, [])

  if (items.length === 0) return null

  return (
    <Section id="experience" title="Experience" subtitle="Professional journey and career milestones">
      <div className="relative mx-auto max-w-5xl">
        {/* Timeline Central Line */}
        <div className="absolute bottom-0 left-6 lg:left-1/2 top-0 w-0.5 bg-gradient-to-b from-brand-primary via-brand-secondary to-brand-accent lg:-translate-x-px" />
        
        <div className="space-y-12">
          {items.map((exp, i) => (
            <motion.div
              key={exp.id}
              initial={{ opacity: 0, x: i % 2 === 0 ? -24 : 24 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
              className={`relative flex items-center w-full justify-start ${
                i % 2 === 0 ? 'lg:justify-start' : 'lg:justify-end'
              }`}
            >
              {/* Bullet Point */}
              <span className="absolute left-6 lg:left-1/2 h-4.5 w-4.5 -translate-x-[9px] lg:-translate-x-[9px] rounded-full border-4 border-brand-bg bg-brand-primary shadow-sm z-10" />

              {/* Card Container */}
              <div className="glass-card relative ml-12 w-full p-6 sm:p-8 lg:ml-0 lg:w-[calc(50%-2.5rem)] hover:shadow-lg transition-all duration-300">
                <p className="text-xs sm:text-sm font-semibold text-brand-secondary">
                  {exp.start_date ? formatDate(exp.start_date) : '—'} – {exp.end_date ? formatDate(exp.end_date) : 'Present'}
                </p>
                <h3 className="mt-2 text-lg sm:text-xl font-bold text-brand-text leading-tight">{exp.position}</h3>
                <p className="font-semibold text-xs sm:text-sm text-brand-muted mt-1">{exp.company}</p>
                {exp.description && (
                  <p className="mt-4 whitespace-pre-wrap text-sm leading-relaxed text-brand-muted light:text-slate-600">
                    {exp.description}
                  </p>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </Section>
  )
}
