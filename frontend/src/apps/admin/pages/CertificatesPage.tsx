import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { FiEdit, FiPlus, FiTrash2 } from 'react-icons/fi'
import { ConfirmModal } from '../../../shared/components/admin/ConfirmModal'
import { DataTable } from '../../../shared/components/admin/DataTable'
import { FormField, formInputClass } from '../../../shared/components/admin/FormField'
import { PageHeader } from '../../../shared/components/admin/PageHeader'
import { Button, Card } from '../../../shared/components/ui'
import { useToast } from '../../../shared/context/ToastContext'
import { createCertificate, deleteCertificate, getCertificates, updateCertificate } from '../../../shared/services/cmsApi'
import type { Certificate } from '../../../shared/types/cms.types'
import { formatDate } from '../../../shared/utils/cn'

const schema = z.object({
  title: z.string().min(1, 'Title is required'),
  organization: z.string().optional(),
  issue_date: z.string().optional(),
  credential_url: z.string().url('Invalid URL').optional().or(z.literal('')),
  image: z.string().optional(),
})

type FormData = z.infer<typeof schema>

export default function CertificatesPage() {
  const { success, error } = useToast()
  const [certs, setCerts] = useState<Certificate[]>([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState<Certificate | null>(null)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [deleting, setDeleting] = useState(false)
  const [imageFile, setImageFile] = useState<File | null>(null)

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
  })

  const load = () => {
    setLoading(true)
    getCertificates()
      .then(setCerts)
      .catch(() => error('Failed to load certificates'))
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [error])

  const onSubmit = async (data: FormData) => {
    const payload = { ...data, credential_url: data.credential_url || null, issue_date: data.issue_date || null, image: data.image || null }
    try {
      if (editing) {
        await updateCertificate(editing.id, payload, imageFile)
        success('Certificate updated')
      } else {
        await createCertificate(payload, imageFile)
        success('Certificate created')
      }
      reset()
      setImageFile(null)
      setEditing(null)
      load()
    } catch {
      error('Failed to save certificate')
    }
  }

  const handleDelete = async () => {
    if (!deleteId) return
    setDeleting(true)
    try {
      await deleteCertificate(deleteId)
      success('Certificate deleted')
      setDeleteId(null)
      load()
    } catch {
      error('Failed to delete certificate')
    } finally {
      setDeleting(false)
    }
  }

  return (
    <div>
      <PageHeader title="Certificates" description="Manage your certifications and credentials." />

      <Card className="mb-6">
        <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4 md:grid-cols-2">
          <FormField label="Title" required error={errors.title?.message}>
            <input className={formInputClass} {...register('title')} />
          </FormField>
          <FormField label="Organization">
            <input className={formInputClass} {...register('organization')} />
          </FormField>
          <FormField label="Issue Date">
            <input type="date" className={formInputClass} {...register('issue_date')} />
          </FormField>
          <FormField label="Credential URL" error={errors.credential_url?.message}>
            <input className={formInputClass} {...register('credential_url')} />
          </FormField>
          <FormField label="Image URL" hint="Or upload a file below">
            <input className={formInputClass} {...register('image')} />
          </FormField>
          <FormField label="Certificate Image" className="md:col-span-2">
            <input
              type="file"
              accept="image/*"
              className={formInputClass}
              onChange={(e) => setImageFile(e.target.files?.[0] ?? null)}
            />
          </FormField>
          <div className="flex gap-2 md:col-span-2">
            <Button type="submit" disabled={isSubmitting} className="gap-2">
              <FiPlus /> {editing ? 'Update' : 'Add'} Certificate
            </Button>
            {editing && (
              <Button type="button" variant="secondary" onClick={() => { setEditing(null); reset() }}>Cancel</Button>
            )}
          </div>
        </form>
      </Card>

      <DataTable
        loading={loading}
        data={certs}
        keyExtractor={(c) => c.id}
        columns={[
          { key: 'title', header: 'Title', render: (c) => <span className="font-medium">{c.title}</span> },
          { key: 'organization', header: 'Organization', render: (c) => c.organization || '—' },
          { key: 'issue_date', header: 'Issued', render: (c) => (c.issue_date ? formatDate(c.issue_date) : '—') },
          {
            key: 'actions',
            header: '',
            className: 'w-24',
            render: (c) => (
              <div className="flex justify-end gap-1">
                <Button type="button" variant="ghost" size="sm" onClick={() => { setEditing(c); setImageFile(null); reset({ title: c.title, organization: c.organization || '', issue_date: c.issue_date?.slice(0, 10) || '', credential_url: c.credential_url || '', image: c.image || '' }) }}><FiEdit /></Button>
                <Button type="button" variant="ghost" size="sm" onClick={() => setDeleteId(c.id)}><FiTrash2 className="text-red-500" /></Button>
              </div>
            ),
          },
        ]}
      />

      <ConfirmModal open={!!deleteId} loading={deleting} message="Delete this certificate?" onConfirm={handleDelete} onCancel={() => setDeleteId(null)} />
    </div>
  )
}
