import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { FiMapPin, FiPhone, FiGlobe } from 'react-icons/fi'
import { getPublicEducation } from '../../../shared/services/publicApi'
import type { Education } from '../../../shared/types/cms.types'
import { usePublicSite } from '../context/PublicSiteContext'
import { Section } from './Section'
import { formatDate } from '../../../shared/utils/cn'
import { ProfileAvatar } from './ProfileAvatar'

export function AboutSection() {
  const { profile } = usePublicSite()
  const [education, setEducation] = useState<Education[]>([])

  useEffect(() => {
    getPublicEducation().then(setEducation).catch(() => {})
  }, [])

  const cards = [
    { icon: FiMapPin, label: 'Location', value: profile?.location || 'Available Worldwide' },
    { icon: FiPhone, label: 'Phone', value: profile?.phone || 'On request' },
    { icon: FiGlobe, label: 'Languages', value: 'English, Somali' },
  ]

  return (
    <Section id="about" title="About Me" subtitle="Professional background and personal journey">
      <div className="grid gap-10 grid-cols-1 lg:grid-cols-12 items-start">
        {/* Left column: Profile Avatar & Contact Info (5 cols on lg) */}
        <div className="lg:col-span-5 flex flex-col gap-6 items-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="w-full flex justify-center"
          >
            <ProfileAvatar src={profile?.avatar} name={profile?.full_name || 'Abshir Adan'} size="lg" />
          </motion.div>

          <div className="w-full space-y-4">
            {cards.map((card, i) => (
              <motion.div
                key={card.label}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                whileHover={{ scale: 1.01 }}
                className="glass-card flex items-center gap-4 p-5"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-primary/20 text-brand-secondary">
                  <card.icon size={22} />
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wider text-brand-muted">{card.label}</p>
                  <p className="font-medium text-sm sm:text-base">{card.value}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Right column: Biography & Education Summary (7 cols on lg) */}
        <div className="lg:col-span-7 flex flex-col gap-6">
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="glass-card p-6 sm:p-8"
          >
            <h3 className="mb-4 text-xl font-semibold">Biography</h3>
            <p className="whitespace-pre-wrap leading-relaxed text-sm sm:text-base text-brand-muted light:text-slate-600">
              {profile?.bio || 'Passionate software engineer dedicated to building impactful digital products with clean code and thoughtful design.'}
            </p>
            {profile?.career_objective && (
              <>
                <h3 className="mb-3 mt-8 text-lg font-semibold">Career Objective</h3>
                <p className="whitespace-pre-wrap leading-relaxed text-sm sm:text-base text-brand-muted light:text-slate-600">
                  {profile.career_objective}
                </p>
              </>
            )}
          </motion.div>

          {education.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="glass-card p-6 sm:p-8"
            >
              <h3 className="mb-4 font-semibold">Education Summary</h3>
              <ul className="space-y-4">
                {education.slice(0, 2).map((edu) => (
                  <li key={edu.id} className="border-l-2 border-brand-primary pl-4">
                    <p className="font-medium text-sm sm:text-base">{edu.degree} — {edu.field}</p>
                    <p className="text-xs sm:text-sm text-brand-muted">{edu.school}</p>
                    <p className="text-[10px] sm:text-xs text-brand-muted">
                      {edu.start_date ? formatDate(edu.start_date) : '—'} – {edu.end_date ? formatDate(edu.end_date) : 'Present'}
                    </p>
                  </li>
                ))}
              </ul>
            </motion.div>
          )}
        </div>
      </div>
    </Section>
  )
}
