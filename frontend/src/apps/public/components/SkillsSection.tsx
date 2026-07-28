import { useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { getPublicSkills } from '../../../shared/services/publicApi'
import type { Skill } from '../../../shared/types/cms.types'
import { Section } from './Section'
import { SkillIcon } from './SkillIcon'

const DEFAULT_CATEGORIES = [
  'Frontend',
  'Backend',
  'Programming Languages',
  'Database',
  'Mobile Development',
  'DevOps',
  'Tools',
  'Design',
]

export function SkillsSection() {
  const [skills, setSkills] = useState<Skill[]>([])
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('All')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getPublicSkills()
      .then(setSkills)
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const categories = useMemo(() => {
    const fromData = [...new Set(skills.map((s) => s.category).filter(Boolean))] as string[]
    return ['All', ...DEFAULT_CATEGORIES.filter((c) => fromData.includes(c) || c), ...fromData.filter((c) => !DEFAULT_CATEGORIES.includes(c))]
  }, [skills])

  const filtered = skills.filter((s) => {
    const matchSearch = s.name.toLowerCase().includes(search.toLowerCase())
    const matchCat = category === 'All' || s.category === category
    return matchSearch && matchCat
  })

  const grouped = useMemo(() => {
    const map = new Map<string, Skill[]>()
    filtered.forEach((s) => {
      const cat = s.category || 'Other'
      if (!map.has(cat)) map.set(cat, [])
      map.get(cat)!.push(s)
    })
    return map
  }, [filtered])

  return (
    <Section id="skills" title="Skills & Technologies" subtitle="Expertise across the modern development stack">
      <div className="mb-8 flex flex-col gap-4 sm:flex-row">
        <input
          type="search"
          placeholder="Search skills..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="glass-card flex-1 px-4 py-3 text-sm outline-none ring-brand-primary focus:ring-2 light:bg-white"
          aria-label="Search skills"
        />
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="glass-card px-4 py-3 text-sm outline-none light:bg-white"
          aria-label="Filter by category"
        >
          {categories.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
      </div>

      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="glass-card h-32 animate-pulse" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <p className="text-center text-brand-muted">No skills found. Add skills from the admin dashboard.</p>
      ) : (
        <div className="space-y-10">
          {[...grouped.entries()].map(([cat, items]) => (
            <div key={cat}>
              <h3 className="mb-4 text-lg font-semibold text-brand-secondary">{cat}</h3>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {items.map((skill, i) => (
                  <motion.div
                    key={skill.id}
                    initial={{ opacity: 0, y: 16 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.05 }}
                    whileHover={{ y: -4, scale: 1.02 }}
                    className="glass-card group p-5 transition-shadow hover:shadow-glow"
                  >
                    <div className="mb-3 flex items-center gap-3">
                      <SkillIcon name={skill.name} />
                      <div>
                        <p className="font-semibold">{skill.name}</p>
                        <p className="text-xs text-brand-muted">{skill.category}</p>
                      </div>
                      <span className="ml-auto text-sm font-bold text-brand-secondary">{skill.percentage}%</span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-white/10 light:bg-slate-200">
                      <motion.div
                        initial={{ width: 0 }}
                        whileInView={{ width: `${skill.percentage}%` }}
                        viewport={{ once: true }}
                        transition={{ duration: 1, delay: 0.2 }}
                        className="h-full rounded-full bg-gradient-to-r from-brand-primary to-brand-secondary"
                      />
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </Section>
  )
}
