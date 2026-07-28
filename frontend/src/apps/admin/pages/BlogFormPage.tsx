import { useEffect, useMemo, useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { motion } from 'framer-motion'
import { FormField, formInputClass, formTextareaClass } from '../../../shared/components/admin/FormField'
import { PageHeader } from '../../../shared/components/admin/PageHeader'
import { Button, Card, PageLoader } from '../../../shared/components/ui'
import { BlogEditor } from '../../../shared/components/admin/BlogEditor'
import { useToast } from '../../../shared/context/ToastContext'
import { createBlog, getBlog, updateBlog } from '../../../shared/services/cmsApi'
import type { Blog } from '../../../shared/types/cms.types'
import { estimateReadingTime, slugifyInput, stripMarkdown } from '../../../shared/utils/blogEditor'

const schema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters').max(150, 'Title must be at most 150 characters'),
  slug: z.string().min(1, 'Slug is required'),
  category: z.string().min(1, 'Category is required'),
  cover_image: z.string().optional(),
  excerpt: z.string().optional(),
  content: z.string().min(50, 'Content must be at least 50 characters'),
  tags: z.string().optional(),
  status: z.enum(['draft', 'published']),
  reading_time: z.coerce.number().min(1).max(120),
  seo_title: z.string().max(150, 'SEO title must be at most 150 characters').optional(),
  seo_description: z.string().max(300, 'SEO description must be at most 300 characters').optional(),
  featured: z.boolean().optional(),
})

type FormData = z.infer<typeof schema>

export default function BlogFormPage() {
  const { id } = useParams()
  const location = useLocation()
  const navigate = useNavigate()
  const { success, error } = useToast()
  const isNew = useMemo(() => !id || location.pathname.endsWith('/blogs/new'), [id, location.pathname])
  const [loading, setLoading] = useState(!isNew)
  const [coverFile, setCoverFile] = useState<File | null>(null)
  const [existingCover, setExistingCover] = useState<string | null>(null)

  const { register, handleSubmit, reset, watch, setValue, control, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      slug: '',
      category: '',
      content: '',
      tags: '',
      status: 'draft',
      reading_time: 1,
      featured: false,
    },
  })

  const title = watch('title')
  const content = watch('content')
  const status = watch('status')

  useEffect(() => {
    if (!isNew || !title) return
    setValue('slug', slugifyInput(title), { shouldValidate: true })
  }, [isNew, title, setValue])

  useEffect(() => {
    if (!content) return
    setValue('reading_time', estimateReadingTime(content), { shouldValidate: true })
    if (!watch('excerpt')) {
      setValue('excerpt', stripMarkdown(content).slice(0, 180), { shouldValidate: false })
    }
    if (!watch('seo_description')) {
      setValue('seo_description', stripMarkdown(content).slice(0, 160), { shouldValidate: false })
    }
  }, [content, setValue, watch])

  useEffect(() => {
    if (!isNew && id) {
      getBlog(id)
        .then((data: Blog) => {
          setExistingCover(data.cover_image || null)
          reset({
            title: data.title,
            slug: data.slug,
            category: data.category || '',
            cover_image: data.cover_image || '',
            excerpt: data.excerpt || '',
            content: data.content,
            tags: data.tags?.join(', ') || '',
            status: data.status || (data.published ? 'published' : 'draft'),
            reading_time: data.reading_time || estimateReadingTime(data.content),
            seo_title: data.seo_title || '',
            seo_description: data.seo_description || '',
            featured: data.featured,
          })
        })
        .catch(() => error('Failed to load blog post'))
        .finally(() => setLoading(false))
    } else {
      setLoading(false)
    }
  }, [id, isNew, reset, error])

  const onSubmit = async (data: FormData) => {
    if (!coverFile && !data.cover_image && !existingCover) {
      error('Cover image is required')
      return
    }

    const payload = {
      title: data.title,
      slug: slugifyInput(data.slug),
      category: data.category,
      cover_image: data.cover_image || null,
      excerpt: data.excerpt || null,
      content: data.content,
      tags: data.tags ? data.tags.split(',').map((tag) => tag.trim()).filter(Boolean) : [],
      status: data.status,
      published: data.status === 'published',
      reading_time: data.reading_time,
      seo_title: data.seo_title || null,
      seo_description: data.seo_description || null,
      featured: Boolean(data.featured),
    }
    try {
      if (isNew) {
        await createBlog(payload, coverFile)
        success('Blog post created')
      } else if (id) {
        await updateBlog(id, payload, coverFile)
        success('Blog post updated')
      }
      navigate('/admin/blogs')
    } catch {
      error('Failed to save blog post')
    }
  }

  if (loading) return <PageLoader />

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <PageHeader
        title={isNew ? 'New Blog Post' : 'Edit Blog Post'}
        description={isNew ? 'Create and publish a new article.' : 'Update your article metadata and content.'}
      />

      <Card>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            <FormField label="Title" required error={errors.title?.message}>
              <input className={formInputClass} {...register('title')} />
            </FormField>
            <FormField label="Slug" required error={errors.slug?.message}>
              <input className={formInputClass} {...register('slug')} />
            </FormField>
            <FormField label="Category" required error={errors.category?.message}>
              <input className={formInputClass} {...register('category')} placeholder="Engineering, Backend, React..." />
            </FormField>
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            <FormField label="Cover Image Upload" required>
              <input
                type="file"
                accept="image/*"
                className={formInputClass}
                onChange={(e) => setCoverFile(e.target.files?.[0] ?? null)}
              />
            </FormField>
            <FormField label="Cover Image URL" hint="Optional existing image URL">
              <input className={formInputClass} {...register('cover_image')} />
            </FormField>
          </div>

          {(existingCover || watch('cover_image')) && (
            <div className="overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-700">
              <img src={coverFile ? URL.createObjectURL(coverFile) : (watch('cover_image') || existingCover || '')} alt="" className="h-48 w-full object-cover" />
            </div>
          )}

          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
            <FormField label="Tags" hint="Comma separated">
              <input className={formInputClass} {...register('tags')} placeholder="postgres, nodejs, react" />
            </FormField>
            <FormField label="Status">
              <select className={formInputClass} {...register('status')}>
                <option value="draft">Draft</option>
                <option value="published">Published</option>
              </select>
            </FormField>
            <FormField label="Reading Time (minutes)" error={errors.reading_time?.message}>
              <input type="number" min={1} max={120} className={formInputClass} {...register('reading_time')} />
            </FormField>
            <label className="flex items-center gap-2 self-end rounded-xl border border-slate-200 px-4 py-3 text-sm text-slate-700 dark:border-slate-700 dark:text-slate-300">
              <input type="checkbox" className="rounded" {...register('featured')} />
              Featured post
            </label>
          </div>

          <FormField label="Excerpt">
            <textarea className={formTextareaClass} rows={3} {...register('excerpt')} />
          </FormField>

          <FormField label="Content" required error={errors.content?.message}>
            <Controller
              control={control}
              name="content"
              render={({ field }) => (
                <BlogEditor value={field.value} onChange={field.onChange} error={errors.content?.message} />
              )}
            />
          </FormField>

          <div className="grid gap-5 md:grid-cols-2">
            <FormField label="SEO Title" error={errors.seo_title?.message}>
              <input className={formInputClass} {...register('seo_title')} />
            </FormField>
            <FormField label="SEO Description" error={errors.seo_description?.message}>
              <textarea className={formTextareaClass} rows={3} {...register('seo_description')} />
            </FormField>
          </div>

          <div className="rounded-xl bg-slate-50 px-4 py-3 text-sm text-slate-600 dark:bg-slate-800/60 dark:text-slate-300">
            Status: <span className="font-semibold">{status === 'published' ? 'Published' : 'Draft'}</span>
          </div>

          <div className="flex gap-3">
            <Button type="submit" disabled={isSubmitting}>{isSubmitting ? 'Saving...' : 'Save'}</Button>
            <Button type="button" variant="secondary" onClick={() => navigate('/admin/blogs')}>Cancel</Button>
          </div>
        </form>
      </Card>
    </motion.div>
  )
}
