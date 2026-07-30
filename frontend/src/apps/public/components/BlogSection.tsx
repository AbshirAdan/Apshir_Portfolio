import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { FiArrowRight, FiClock } from 'react-icons/fi'
import { getPublicBlogs } from '../../../shared/services/publicApi'
import type { Blog } from '../../../shared/types/cms.types'
import { Section } from './Section'
import { formatDate } from '../../../shared/utils/cn'

export function BlogSection() {
  const [blogs, setBlogs] = useState<Blog[]>([])

  useEffect(() => {
    getPublicBlogs({ limit: 3 }).then((res) => setBlogs(res.items)).catch(() => {})
  }, [])

  if (blogs.length === 0) return null

  return (
    <Section id="blog" title="Latest Blog Posts" subtitle="Thoughts on software engineering and technology">
      <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
        {blogs.map((blog, i) => (
          <motion.article
            key={blog.id}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.1 }}
            className="glass-card group overflow-hidden flex flex-col h-full"
          >
            {blog.cover_image && (
              <img src={blog.cover_image} alt="" className="aspect-video w-full object-cover transition group-hover:scale-105 shrink-0" loading="lazy" />
            )}
            <div className="p-5 flex flex-col flex-1 justify-between">
              <div>
                <div className="flex items-center gap-3 text-xs text-brand-muted">
                  <span className="rounded-full bg-brand-primary/10 px-2 py-1 font-semibold text-brand-primary dark:bg-brand-primary/20 dark:text-brand-secondary">{blog.category}</span>
                  <span>{formatDate(blog.created_at)}</span>
                  <span className="flex items-center gap-1"><FiClock size={12} /> {blog.reading_time} min read</span>
                </div>
                <h3 className="mt-3 text-lg font-bold text-brand-text group-hover:text-brand-primary transition-colors leading-snug">{blog.title}</h3>
                <p className="mt-2 line-clamp-3 text-sm text-brand-muted leading-relaxed">{blog.excerpt || blog.content.slice(0, 120)}</p>
              </div>
              <div className="mt-4 flex items-center justify-start shrink-0">
                <Link to={`/blog/${blog.slug}`} className="inline-flex items-center gap-1 text-sm font-semibold text-brand-secondary hover:underline min-h-[44px] hover:text-brand-primary transition-colors">
                  Read More <FiArrowRight />
                </Link>
              </div>
            </div>
          </motion.article>
        ))}
      </div>
      <div className="mt-8 text-center">
        <Link to="/blog" className="btn-outline">View All Posts</Link>
      </div>
    </Section>
  )
}
