import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { getPublicSkills } from '../../../shared/services/publicApi'
import type { Skill } from '../../../shared/types/cms.types'
import { SkillIcon } from './SkillIcon'

export function TechStrip() {
  const [skills, setSkills] = useState<Skill[]>([])

  useEffect(() => {
    getPublicSkills()
      .then((data) => setSkills(data.slice(0, 12)))
      .catch(() => {})
  }, [])

  if (skills.length === 0) return null

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5, duration: 0.6 }}
      className="mt-16 border-t border-slate-200/60 pt-10 dark:border-white/10"
    >
      <p className="mb-6 text-center text-xs font-semibold uppercase tracking-[0.2em] text-brand-muted">
        Trusted by Technologies
      </p>
      <div className="flex flex-wrap items-center justify-center gap-6 md:gap-10">
        {skills.map((skill, i) => (
          <motion.div
            key={skill.id}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.05 * i }}
            whileHover={{ y: -4, scale: 1.08 }}
            className="flex flex-col items-center gap-1.5"
            title={skill.name}
          >
            <SkillIcon name={skill.icon || skill.name} className="h-9 w-9 md:h-10 md:w-10" />
            <span className="hidden text-[10px] font-medium text-brand-muted sm:block">{skill.name}</span>
          </motion.div>
        ))}
      </div>
    </motion.div>
  )
}
