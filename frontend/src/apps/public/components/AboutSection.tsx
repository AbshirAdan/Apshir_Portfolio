import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { FiMapPin, FiPhone, FiGlobe } from 'react-icons/fi'
import { getPublicEducation } from '../../../shared/services/publicApi'
import type { Education } from '../../../shared/types/cms.types'
import { usePublicSite } from '../context/PublicSiteContext'
import { Section } from './Section'
import { formatDate } from '../../../shared/utils/cn'

export function AboutSection() {
  const { profile } = usePublicSite()
  const [education, setEducation] = useState<Education[]>([])

  useEffect(() => {
    getPublicEducation().then(setEducation).catch(() => {})
  }, [])

  const cards = [
    { icon: FiMapPin, label: 'Location', value: 'Available Worldwide' },
    { icon: FiPhone, label: 'Phone', value: profile?.phone || 'On request' },
    { icon: FiGlobe, label: 'Languages', value: 'English, Somali' },
  ]

  return (
    <Section id="about" title="About Me" subtitle="Professional background and personal journey">
      <div className="grid gap-10 lg:grid-cols-2">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          className="glass-card p-8"
        >
          <h3 className="mb-4 text-xl font-semibold">Biography</h3>
          <p className="whitespace-pre-wrap leading-relaxed text-brand-muted light:text-slate-600">
            {profile?.bio || 'Passionate software engineer dedicated to building impactful digital products with clean code and thoughtful design.'}
          </p>
          <h3 className="mb-3 mt-8 text-lg font-semibold">Career Objective</h3>
          <p className="text-brand-muted light:text-slate-600">
            To deliver high-quality software solutions that solve real problems while continuously learning and growing as an engineer.
          </p>
        </motion.div>

        <div className="space-y-4">
          {cards.map((card, i) => (
            <motion.div
              key={card.label}
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="glass-card flex items-center gap-4 p-5"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-primary/20 text-brand-secondary">
                <card.icon size={22} />
              </div>
              <div>
                <p className="text-xs uppercase tracking-wider text-brand-muted">{card.label}</p>
                <p className="font-medium">{card.value}</p>
              </div>
            </motion.div>
          ))}

          {education.length > 0 && (
            <div className="glass-card p-6">
              <h3 className="mb-4 font-semibold">Education Summary</h3>
              <ul className="space-y-3">
                {education.slice(0, 2).map((edu) => (
                  <li key={edu.id} className="border-l-2 border-brand-primary pl-4">
                    <p className="font-medium">{edu.degree} — {edu.field}</p>
                    <p className="text-sm text-brand-muted">{edu.school}</p>
                    <p className="text-xs text-brand-muted">
                      {edu.start_date ? formatDate(edu.start_date) : '—'} – {edu.end_date ? formatDate(edu.end_date) : 'Present'}
                    </p>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </Section>
  )
}
