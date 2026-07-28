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
      <div className="relative mx-auto max-w-3xl space-y-8">
        <div className="absolute bottom-0 left-6 top-0 w-0.5 bg-brand-primary/30" />
        {items.map((exp, i) => (
          <motion.div
            key={exp.id}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.1 }}
            className="relative ml-12"
          >
            <span className="absolute -left-[2.1rem] top-2 h-4 w-4 rounded-full border-2 border-brand-primary bg-brand-bg" />
            <div className="glass-card p-6">
              <p className="text-sm text-brand-secondary">
                {exp.start_date ? formatDate(exp.start_date) : '—'} – {exp.end_date ? formatDate(exp.end_date) : 'Present'}
              </p>
              <h3 className="mt-1 text-xl font-bold">{exp.position}</h3>
              <p className="font-medium text-brand-muted">{exp.company}</p>
              {exp.description && (
                <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-brand-muted light:text-slate-600">
                  {exp.description}
                </p>
              )}
            </div>
          </motion.div>
        ))}
      </div>
    </Section>
  )
}
