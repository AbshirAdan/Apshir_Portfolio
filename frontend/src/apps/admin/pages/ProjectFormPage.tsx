import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { motion } from 'framer-motion'
import { FiTrash2, FiUpload } from 'react-icons/fi'
import { FormField, formInputClass, formTextareaClass } from '../../../shared/components/admin/FormField'
import { PageHeader } from '../../../shared/components/admin/PageHeader'
import { Button, Card, PageLoader } from '../../../shared/components/ui'
import { useToast } from '../../../shared/context/ToastContext'
import {
  createProject,
  deleteProjectImage,
  getProject,
  updateProject,
  uploadProjectImages,
} from '../../../shared/services/cmsApi'
import type { ProjectImage } from '../../../shared/types/cms.types'

const schema = z.object({
  title: z.string().min(1, 'Title is required'),
  slug: z.string().optional(),
  short_description: z.string().optional(),
  full_description: z.string().optional(),
  technologies: z.string().optional(),
  github_url: z.string().url('Invalid URL').optional().or(z.literal('')),
  live_demo_url: z.string().url('Invalid URL').optional().or(z.literal('')),
  thumbnail: z.string().optional(),
  category: z.string().optional(),
  featured: z.boolean().optional(),
  status: z.enum(['draft', 'published', 'archived']),
})

type FormData = z.infer<typeof schema>

export default function ProjectFormPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { success, error } = useToast()
  const isNew = id === 'new'
  const [loading, setLoading] = useState(!isNew)
  const [images, setImages] = useState<ProjectImage[]>([])
  const [uploading, setUploading] = useState(false)
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { status: 'published', featured: false },
  })

  useEffect(() => {
    if (!isNew && id) {
      getProject(id)
        .then((data) => {
          reset({
            title: data.title,
            slug: data.slug,
            short_description: data.short_description || '',
            full_description: data.full_description || '',
            technologies: Array.isArray(data.technologies) ? data.technologies.join(', ') : '',
            github_url: data.github_url || '',
            live_demo_url: data.live_demo_url || '',
            thumbnail: data.thumbnail || '',
            category: data.category || '',
            featured: data.featured,
            status: data.status,
          })
          setImages(data.images || [])
        })
        .catch(() => error('Failed to load project'))
        .finally(() => setLoading(false))
    }
  }, [id, isNew, reset, error])

  const onSubmit = async (data: FormData) => {
    const payload = {
      title: data.title,
      slug: data.slug || undefined,
      short_description: data.short_description || null,
      full_description: data.full_description || null,
      technologies: data.technologies
        ? data.technologies.split(',').map((s) => s.trim()).filter(Boolean)
        : [],
      github_url: data.github_url || null,
      live_demo_url: data.live_demo_url || null,
      thumbnail: data.thumbnail || null,
      category: data.category || null,
      featured: Boolean(data.featured),
      status: data.status,
    }

    try {
      if (isNew) {
        const created = await createProject(payload, thumbnailFile)
        success('Project created')
        navigate(`/admin/projects/${created.id}`)
      } else if (id) {
        await updateProject(id, payload, thumbnailFile)
        success('Project updated')
        navigate('/admin/projects')
      }
    } catch {
      error('Failed to save project')
    }
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files?.length || !id || id === 'new') return
    setUploading(true)
    try {
      const uploaded = await uploadProjectImages(id, Array.from(files))
      setImages((prev) => [...prev, ...uploaded])
      success('Images uploaded')
    } catch {
      error('Failed to upload images')
    } finally {
      setUploading(false)
      e.target.value = ''
    }
  }

  const handleRemoveImage = async (imageId: string) => {
    if (!id || id === 'new') return
    try {
      await deleteProjectImage(id, imageId)
      setImages((prev) => prev.filter((img) => img.id !== imageId))
      success('Image removed')
    } catch {
      error('Failed to remove image')
    }
  }

  if (loading) return <PageLoader />

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <PageHeader
        title={isNew ? 'New Project' : 'Edit Project'}
        description={isNew ? 'Create a new portfolio project.' : 'Update project details and images.'}
      />

      <Card>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <div className="grid gap-5 md:grid-cols-2">
            <FormField label="Title" required error={errors.title?.message}>
              <input className={formInputClass} {...register('title')} />
            </FormField>
            <FormField label="Slug" hint="Auto-generated if empty">
              <input className={formInputClass} {...register('slug')} />
            </FormField>
            <FormField label="Category">
              <input className={formInputClass} {...register('category')} />
            </FormField>
            <FormField label="Status">
              <select className={formInputClass} {...register('status')}>
                <option value="draft">Draft</option>
                <option value="published">Published</option>
                <option value="archived">Archived</option>
              </select>
            </FormField>
          </div>

          <FormField label="Short Description">
            <textarea className={formTextareaClass} rows={2} {...register('short_description')} />
          </FormField>

          <FormField label="Full Description">
            <textarea className={formTextareaClass} rows={6} {...register('full_description')} />
          </FormField>

          <div className="grid gap-5 md:grid-cols-2">
            <FormField label="Thumbnail">
              <input
                type="file"
                accept="image/*"
                className={formInputClass}
                onChange={(e) => setThumbnailFile(e.target.files?.[0] ?? null)}
              />
              {!thumbnailFile && (
                <input type="hidden" {...register('thumbnail')} />
              )}
            </FormField>
            <FormField label="Technologies" hint="Comma separated">
              <input className={formInputClass} {...register('technologies')} />
            </FormField>
            <FormField label="GitHub URL" error={errors.github_url?.message}>
              <input className={formInputClass} {...register('github_url')} />
            </FormField>
            <FormField label="Live Demo URL" error={errors.live_demo_url?.message}>
              <input className={formInputClass} {...register('live_demo_url')} />
            </FormField>
          </div>

          <label className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300">
            <input type="checkbox" className="rounded" {...register('featured')} />
            Featured project
          </label>

          {!isNew && (
            <div>
              <p className="mb-2 text-sm font-medium text-slate-700 dark:text-slate-300">Project Images</p>
              <div className="mb-3 flex flex-wrap gap-3">
                {images.map((img) => (
                  <div key={img.id} className="group relative">
                    <img src={img.image} alt="" className="h-24 w-24 rounded-lg object-cover" />
                    <button
                      type="button"
                      onClick={() => handleRemoveImage(img.id)}
                      className="absolute -right-2 -top-2 rounded-full bg-red-600 p-1 text-white opacity-0 transition group-hover:opacity-100"
                    >
                      <FiTrash2 size={12} />
                    </button>
                  </div>
                ))}
              </div>
              <label className="inline-flex cursor-pointer items-center gap-2 rounded-xl bg-slate-100 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700">
                <FiUpload /> {uploading ? 'Uploading...' : 'Upload Images'}
                <input type="file" multiple accept="image/*" className="hidden" onChange={handleImageUpload} disabled={uploading} />
              </label>
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Saving...' : 'Save Project'}
            </Button>
            <Button type="button" variant="secondary" onClick={() => navigate('/admin/projects')}>
              Cancel
            </Button>
          </div>
        </form>
      </Card>
    </motion.div>
  )
}
