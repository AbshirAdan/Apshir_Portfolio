import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { FiEdit, FiLink, FiPlus, FiTrash2 } from 'react-icons/fi'
import { ConfirmModal } from '../../../shared/components/admin/ConfirmModal'
import { DataTable } from '../../../shared/components/admin/DataTable'
import { FormField, formInputClass } from '../../../shared/components/admin/FormField'
import { PageHeader } from '../../../shared/components/admin/PageHeader'
import { Button, Card } from '../../../shared/components/ui'
import { useToast } from '../../../shared/context/ToastContext'
import { createSocialLink, deleteSocialLink, getSocialLinks, updateSocialLink } from '../../../shared/services/cmsApi'
import type { SocialLink } from '../../../shared/types/cms.types'

const schema = z.object({
  platform: z.string().min(1, 'Platform is required'),
  url: z.string().url('Invalid URL'),
  icon: z.string().optional(),
  display_order: z.coerce.number().optional(),
})

type FormData = z.infer<typeof schema>

export default function SocialLinksPage() {
  const { success, error } = useToast()
  const [links, setLinks] = useState<SocialLink[]>([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState<SocialLink | null>(null)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [deleting, setDeleting] = useState(false)

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { display_order: 0 },
  })

  const load = () => {
    setLoading(true)
    getSocialLinks()
      .then(setLinks)
      .catch(() => error('Failed to load social links'))
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [error])

  const onSubmit = async (data: FormData) => {
    try {
      if (editing) {
        await updateSocialLink(editing.id, data)
        success('Social link updated')
      } else {
        await createSocialLink(data)
        success('Social link added')
      }
      reset({ platform: '', url: '', icon: '', display_order: 0 })
      setEditing(null)
      load()
    } catch {
      error('Failed to save social link')
    }
  }

  const handleDelete = async () => {
    if (!deleteId) return
    setDeleting(true)
    try {
      await deleteSocialLink(deleteId)
      success('Social link deleted')
      setDeleteId(null)
      load()
    } catch {
      error('Failed to delete social link')
    } finally {
      setDeleting(false)
    }
  }

  return (
    <div>
      <PageHeader title="Social Links" description="Manage links to your social profiles." />

      <Card className="mb-6">
        <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4 md:grid-cols-4">
          <FormField label="Platform" required error={errors.platform?.message}>
            <input className={formInputClass} placeholder="GitHub" {...register('platform')} />
          </FormField>
          <FormField label="URL" required error={errors.url?.message}>
            <input className={formInputClass} placeholder="https://..." {...register('url')} />
          </FormField>
          <FormField label="Icon">
            <input className={formInputClass} placeholder="github" {...register('icon')} />
          </FormField>
          <FormField label="Order">
            <input type="number" className={formInputClass} {...register('display_order')} />
          </FormField>
          <div className="flex gap-2 md:col-span-4">
            <Button type="submit" disabled={isSubmitting} className="gap-2">
              <FiPlus /> {editing ? 'Update' : 'Add'} Link
            </Button>
            {editing && (
              <Button type="button" variant="secondary" onClick={() => { setEditing(null); reset({ platform: '', url: '', icon: '', display_order: 0 }) }}>Cancel</Button>
            )}
          </div>
        </form>
      </Card>

      <DataTable
        loading={loading}
        data={links}
        keyExtractor={(l) => l.id}
        emptyMessage="No social links yet."
        columns={[
          { key: 'platform', header: 'Platform', render: (l) => <span className="font-medium">{l.platform}</span> },
          {
            key: 'url',
            header: 'URL',
            render: (l) => (
              <a href={l.url} target="_blank" rel="noreferrer" className="flex items-center gap-1 text-indigo-600 hover:underline dark:text-indigo-400">
                <FiLink size={14} /> {l.url}
              </a>
            ),
          },
          { key: 'display_order', header: 'Order' },
          {
            key: 'actions',
            header: '',
            className: 'w-24',
            render: (l) => (
              <div className="flex justify-end gap-1">
                <Button variant="ghost" size="sm" onClick={() => { setEditing(l); reset({ platform: l.platform, url: l.url, icon: l.icon || '', display_order: l.display_order }) }}><FiEdit /></Button>
                <Button variant="ghost" size="sm" onClick={() => setDeleteId(l.id)}><FiTrash2 className="text-red-500" /></Button>
              </div>
            ),
          },
        ]}
      />

      <ConfirmModal open={!!deleteId} loading={deleting} message="Delete this social link?" onConfirm={handleDelete} onCancel={() => setDeleteId(null)} />
    </div>
  )
}
