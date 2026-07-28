import { useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { FiAward, FiBookOpen, FiCode, FiDownload, FiLayers, FiMail, FiArrowRight } from 'react-icons/fi'
import { getPublicResume, getPublicSkills, getPublicStats } from '../../../shared/services/publicApi'
import { usePublicSite } from '../context/PublicSiteContext'
import { HeroBackground } from './HeroBackground'
import { ProfileAvatar } from './ProfileAvatar'
import { StatCounter } from './StatCounter'
import { TechStrip } from './TechStrip'
import { TypingTitle, parseTypingTitles } from './TypingTitle'

export function HeroSection() {
  const { settings, profile } = usePublicSite()
  const [stats, setStats] = useState({ projects: 0, skills: 0, certificates: 0, yearsLearning: 1 })
  const [resumeUrl, setResumeUrl] = useState<string | null>(null)
  const [skillNames, setSkillNames] = useState<string[]>([])
  const [resumeLoading, setResumeLoading] = useState(true)

  useEffect(() => {
    getPublicStats().then(setStats).catch(() => {})
    getPublicSkills().then((s) => setSkillNames(s.map((x) => x.name))).catch(() => {})
    getPublicResume()
      .then((r) => setResumeUrl(r?.file_url ?? null))
      .catch(() => {})
      .finally(() => setResumeLoading(false))
  }, [])

  const typingTitles = useMemo(
    () => parseTypingTitles(settings?.hero_subtitle, skillNames),
    [settings?.hero_subtitle, skillNames]
  )

  const displayName = profile?.full_name || 'Developer'
  const overline = settings?.hero_title || 'Welcome to my portfolio'
  const bio = settings?.hero_description || profile?.bio

  return (
    <section id="home" className="relative min-h-screen scroll-mt-24 overflow-hidden pt-20">
      <HeroBackground />

      <div className="section-container relative z-10 py-12 md:py-16">
        <div className="grid min-h-[calc(100vh-8rem)] items-center gap-12 lg:grid-cols-2 lg:gap-16">
          <motion.div
            initial={{ opacity: 0, y: 32 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          >
            <p className="mb-4 text-xs font-bold uppercase tracking-[0.25em] text-brand-primary md:text-sm">
              {overline}
            </p>

            <h1 className="text-4xl font-extrabold leading-[1.1] tracking-tight text-slate-900 dark:text-white md:text-5xl lg:text-6xl">
              Hi, I&apos;m{' '}
              <span className="gradient-text">{displayName}</span>
            </h1>

            <p className="mt-4 min-h-[2.5rem] text-xl md:text-2xl lg:text-3xl">
              <TypingTitle titles={typingTitles} />
            </p>

            {bio && (
              <p className="mt-6 max-w-xl text-base leading-relaxed text-brand-muted md:text-lg">
                {bio}
              </p>
            )}

            <div className="mt-8 flex flex-wrap gap-3 md:gap-4">
              {resumeUrl ? (
                <a href={resumeUrl} target="_blank" rel="noopener noreferrer" className="btn-primary btn-premium">
                  <FiDownload /> Download Resume
                </a>
              ) : resumeLoading ? (
                <span className="btn-primary btn-premium pointer-events-none opacity-60">
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                  Loading…
                </span>
              ) : null}
              <a href="#projects" className="btn-outline btn-premium">
                View Projects <FiArrowRight />
              </a>
              <a href="#contact" className="btn-outline btn-premium">
                <FiMail /> Hire Me
              </a>
            </div>

            <div className="mt-10 grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
              <StatCounter
                end={stats.yearsLearning}
                suffix="+"
                label="Years Learning"
                icon={<FiBookOpen size={20} />}
                colorClass="from-blue-500/15 to-sky-400/15"
              />
              <StatCounter
                end={stats.projects}
                label="Projects Completed"
                icon={<FiLayers size={20} />}
                colorClass="from-emerald-500/15 to-teal-400/15"
              />
              <StatCounter
                end={stats.skills}
                suffix="+"
                label="Technologies Mastered"
                icon={<FiCode size={20} />}
                colorClass="from-violet-500/15 to-purple-400/15"
              />
              <StatCounter
                end={stats.certificates}
                label="Certificates Earned"
                icon={<FiAward size={20} />}
                colorClass="from-amber-500/15 to-orange-400/15"
              />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: 24 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
            className="relative mx-auto flex max-w-md justify-center lg:max-w-none"
          >
            <motion.div
              animate={{ y: [0, -10, 0] }}
              transition={{ repeat: Infinity, duration: 5, ease: 'easeInOut' }}
              className="relative"
            >
              <ProfileAvatar src={profile?.avatar} name={displayName} />

              <motion.div
                animate={{ y: [0, -6, 0] }}
                transition={{ repeat: Infinity, duration: 3.5, ease: 'easeInOut' }}
                className="absolute -right-2 top-6 md:-right-4 md:top-10"
              >
                <div className="flex items-center gap-2 rounded-full border border-white/60 bg-white/80 px-4 py-2 text-sm font-semibold text-slate-800 shadow-lg backdrop-blur-xl dark:border-white/10 dark:bg-slate-800/70 dark:text-white">
                  <span className="relative flex h-2.5 w-2.5">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60" />
                    <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-500" />
                  </span>
                  Available for hire
                </div>
              </motion.div>
            </motion.div>
          </motion.div>
        </div>

        <TechStrip />
      </div>
    </section>
  )
}
