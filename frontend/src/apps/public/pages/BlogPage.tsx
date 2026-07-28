import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { FiArrowRight, FiClock } from 'react-icons/fi'
import { getPublicBlogs } from '../../../shared/services/publicApi'
import type { Blog } from '../../../shared/types/cms.types'
import { SEO } from '../components/SEO'
import { formatDate } from '../../../shared/utils/cn'

export default function BlogPage() {
  const [blogs, setBlogs] = useState<Blog[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getPublicBlogs({ limit: 20 })
      .then((res) => setBlogs(res.items))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="section-container py-28">
      <SEO title="Blog" description="Articles and insights on software engineering" />
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-4xl font-bold gradient-text">Blog</h1>
        <p className="mt-2 text-brand-muted">Latest articles and technical insights</p>
      </motion.div>

      {loading ? (
        <div className="mt-12 grid gap-6 md:grid-cols-2">
          {Array.from({ length: 4 }).map((_, i) => <div key={i} className="glass-card h-64 animate-pulse" />)}
        </div>
      ) : blogs.length === 0 ? (
        <p className="mt-12 text-center text-brand-muted">No published blog posts yet.</p>
      ) : (
        <div className="mt-12 grid gap-8 md:grid-cols-2">
          {blogs.map((blog) => (
            <article key={blog.id} className="glass-card overflow-hidden">
              {blog.cover_image && <img src={blog.cover_image} alt="" className="aspect-video w-full object-cover" loading="lazy" />}
              <div className="p-6">
                <div className="flex gap-3 text-xs text-brand-muted">
                  <span className="rounded-full bg-brand-primary/10 px-2 py-1 font-semibold text-brand-primary dark:bg-brand-primary/20 dark:text-brand-secondary">{blog.category}</span>
                  <span>{formatDate(blog.created_at)}</span>
                  <span className="flex items-center gap-1"><FiClock size={12} /> {blog.reading_time} min</span>
                </div>
                <h2 className="mt-2 text-xl font-bold">{blog.title}</h2>
                <p className="mt-2 line-clamp-3 text-sm text-brand-muted">{blog.excerpt || blog.content.slice(0, 150)}</p>
                <Link to={`/blog/${blog.slug}`} className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-brand-secondary hover:underline">
                  Read More <FiArrowRight />
                </Link>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  )
}
