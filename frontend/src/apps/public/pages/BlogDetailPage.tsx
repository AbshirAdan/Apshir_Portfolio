import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { FiArrowLeft, FiClock } from 'react-icons/fi'
import { getPublicBlog } from '../../../shared/services/publicApi'
import type { Blog } from '../../../shared/types/cms.types'
import { SEO } from '../components/SEO'
import { formatDate } from '../../../shared/utils/cn'
import { markdownToHtml } from '../../../shared/utils/blogEditor'

export default function BlogDetailPage() {
  const { slug } = useParams()
  const [blog, setBlog] = useState<Blog | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  useEffect(() => {
    if (!slug) return
    getPublicBlog(slug)
      .then(setBlog)
      .catch(() => setError(true))
      .finally(() => setLoading(false))
  }, [slug])

  if (loading) return <div className="section-container py-32"><div className="glass-card h-96 animate-pulse" /></div>
  if (error || !blog) return (
    <div className="section-container py-32 text-center">
      <p className="text-brand-muted">Blog post not found.</p>
      <Link to="/blog" className="btn-outline mt-4 inline-flex">Back to Blog</Link>
    </div>
  )

  return (
    <article className="section-container py-28">
      <SEO title={blog.seo_title || blog.title} description={blog.seo_description || blog.excerpt || blog.content.slice(0, 160)} />
      <Link to="/blog" className="mb-8 inline-flex items-center gap-2 text-sm text-brand-secondary hover:underline">
        <FiArrowLeft /> Back to Blog
      </Link>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        {blog.cover_image && (
          <img src={blog.cover_image} alt="" className="mb-8 aspect-[21/9] w-full rounded-2xl object-cover" loading="lazy" />
        )}
        <h1 className="text-3xl font-bold md:text-4xl">{blog.title}</h1>
        <p className="mt-3 flex gap-4 text-sm text-brand-muted">
          <span className="rounded-full bg-brand-primary/10 px-2 py-1 font-semibold text-brand-primary dark:bg-brand-primary/20 dark:text-brand-secondary">{blog.category}</span>
          <span>{formatDate(blog.created_at)}</span>
          <span className="flex items-center gap-1"><FiClock size={14} /> {blog.reading_time} min read</span>
        </p>
        {blog.tags && blog.tags.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-2">
            {blog.tags.map((tag) => (
              <span key={tag} className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                #{tag}
              </span>
            ))}
          </div>
        )}
        <div
          className="prose prose-invert mt-8 max-w-none whitespace-pre-wrap leading-relaxed text-brand-muted light:prose-slate light:text-slate-700"
          dangerouslySetInnerHTML={{ __html: markdownToHtml(blog.content) }}
        />
      </motion.div>
    </article>
  )
}
