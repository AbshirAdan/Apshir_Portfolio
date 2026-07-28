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
      <div className="relative mx-auto max-w-3xl">
        <div className="absolute bottom-0 left-4 top-0 w-0.5 bg-gradient-to-b from-brand-primary via-brand-secondary to-brand-accent md:left-1/2 md:-translate-x-px" />
        {items.map((edu, i) => (
          <motion.div
            key={edu.id}
            initial={{ opacity: 0, x: i % 2 === 0 ? -20 : 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className={`relative mb-10 flex ${i % 2 === 0 ? 'md:justify-start' : 'md:justify-end'}`}
          >
            <div className="glass-card relative ml-10 w-full p-6 md:ml-0 md:w-[calc(50%-2rem)]">
              <span className="absolute -left-[2.35rem] top-6 flex h-4 w-4 rounded-full bg-brand-primary ring-4 ring-brand-bg md:left-auto md:-right-[2.35rem] md:top-6" />
              <p className="text-sm font-semibold text-brand-secondary">
                {edu.start_date ? formatDate(edu.start_date) : '—'} – {edu.end_date ? formatDate(edu.end_date) : 'Present'}
              </p>
              <h3 className="mt-1 text-lg font-bold">{edu.school}</h3>
              <p className="text-brand-muted">{edu.degree}{edu.field ? ` in ${edu.field}` : ''}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </Section>
  )
}
