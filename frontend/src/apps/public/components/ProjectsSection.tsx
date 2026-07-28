import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FiExternalLink, FiGithub, FiStar, FiX } from 'react-icons/fi'
import { Swiper, SwiperSlide } from 'swiper/react'
import { Pagination, Autoplay } from 'swiper/modules'
import 'swiper/css'
import 'swiper/css/pagination'
import { getPublicProjects, getPublicProject } from '../../../shared/services/publicApi'
import type { Project } from '../../../shared/types/cms.types'
import { Section } from './Section'

export function ProjectsSection() {
  const [projects, setProjects] = useState<Project[]>([])
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('All')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [selected, setSelected] = useState<Project | null>(null)
  const [loading, setLoading] = useState(true)

  const categories = ['All', ...new Set(projects.map((p) => p.category).filter(Boolean) as string[])]

  useEffect(() => {
    setLoading(true)
    getPublicProjects({
      page,
      limit: 6,
      search: search || undefined,
      category: category !== 'All' ? category : undefined,
    })
      .then((res) => {
        setProjects(res.items)
        setTotalPages(res.totalPages)
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [page, search, category])

  return (
    <Section id="projects" title="Featured Projects" subtitle="Real-world applications built with modern technologies">
      <div className="mb-8 flex flex-col gap-4 sm:flex-row">
        <input
          type="search"
          placeholder="Search projects..."
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1) }}
          className="glass-card flex-1 px-4 py-3 text-sm outline-none light:bg-white"
        />
        <select
          value={category}
          onChange={(e) => { setCategory(e.target.value); setPage(1) }}
          className="glass-card px-4 py-3 text-sm light:bg-white"
        >
          {categories.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>

      {loading ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => <div key={i} className="glass-card h-72 animate-pulse" />)}
        </div>
      ) : projects.length === 0 ? (
        <p className="text-center text-brand-muted">No published projects yet.</p>
      ) : (
        <>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {projects.map((project, i) => (
              <motion.article
                key={project.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                whileHover={{ y: -6 }}
                className="glass-card group cursor-pointer overflow-hidden"
                onClick={() => {
                  getPublicProject(project.slug).then(setSelected).catch(() => setSelected(project))
                }}
              >
                <div className="relative aspect-video overflow-hidden bg-brand-primary/10">
                  {project.thumbnail ? (
                    <img src={project.thumbnail} alt="" className="h-full w-full object-cover transition group-hover:scale-105" loading="lazy" />
                  ) : (
                    <div className="flex h-full items-center justify-center text-brand-muted">No image</div>
                  )}
                  {project.featured && (
                    <span className="absolute left-3 top-3 flex items-center gap-1 rounded-full bg-brand-accent px-2 py-1 text-xs font-semibold text-slate-900">
                      <FiStar size={12} /> Featured
                    </span>
                  )}
                </div>
                <div className="p-5">
                  <h3 className="text-lg font-semibold">{project.title}</h3>
                  <p className="mt-2 line-clamp-2 text-sm text-brand-muted">{project.short_description}</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {(project.technologies || []).slice(0, 4).map((t) => (
                      <span key={t} className="rounded-lg bg-brand-primary/20 px-2 py-1 text-xs text-brand-secondary">{t}</span>
                    ))}
                  </div>
                </div>
              </motion.article>
            ))}
          </div>

          {totalPages > 1 && (
            <div className="mt-8 flex justify-center gap-2">
              <button type="button" disabled={page <= 1} onClick={() => setPage((p) => p - 1)} className="btn-outline disabled:opacity-40">Prev</button>
              <span className="flex items-center px-4 text-sm text-brand-muted">{page} / {totalPages}</span>
              <button type="button" disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)} className="btn-outline disabled:opacity-40">Next</button>
            </div>
          )}
        </>
      )}

      <AnimatePresence>
        {selected && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
            onClick={() => setSelected(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="glass-card max-h-[90vh] w-full max-w-3xl overflow-y-auto p-6"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="mb-4 flex items-start justify-between">
                <h3 className="text-2xl font-bold">{selected.title}</h3>
                <button type="button" onClick={() => setSelected(null)} aria-label="Close"><FiX size={24} /></button>
              </div>
              {selected.images && selected.images.length > 0 && (
                <Swiper modules={[Pagination, Autoplay]} pagination autoplay={{ delay: 4000 }} className="mb-6 rounded-xl">
                  {selected.images.map((img) => (
                    <SwiperSlide key={img.id}>
                      <img src={img.image} alt="" className="aspect-video w-full object-cover" loading="lazy" />
                    </SwiperSlide>
                  ))}
                </Swiper>
              )}
              <p className="text-brand-muted">{selected.full_description || selected.short_description}</p>
              <div className="mt-4 flex flex-wrap gap-2">
                {(selected.technologies || []).map((t) => (
                  <span key={t} className="rounded-lg bg-brand-primary/20 px-3 py-1 text-sm">{t}</span>
                ))}
              </div>
              <div className="mt-6 flex gap-3">
                {selected.github_url && (
                  <a href={selected.github_url} target="_blank" rel="noopener noreferrer" className="btn-outline"><FiGithub /> GitHub</a>
                )}
                {selected.live_demo_url && (
                  <a href={selected.live_demo_url} target="_blank" rel="noopener noreferrer" className="btn-primary"><FiExternalLink /> Live Demo</a>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </Section>
  )
}
