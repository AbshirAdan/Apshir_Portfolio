import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { FiEdit, FiPlus, FiTrash2 } from 'react-icons/fi'
import { ConfirmModal } from '../../../shared/components/admin/ConfirmModal'
import { DataTable } from '../../../shared/components/admin/DataTable'
import { FormField, formInputClass, formTextareaClass } from '../../../shared/components/admin/FormField'
import { PageHeader } from '../../../shared/components/admin/PageHeader'
import { Button, Card } from '../../../shared/components/ui'
import { useToast } from '../../../shared/context/ToastContext'
import { createExperience, deleteExperience, getExperience, updateExperience } from '../../../shared/services/cmsApi'
import type { Experience } from '../../../shared/types/cms.types'

const schema = z.object({
  company: z.string().min(1, 'Company is required'),
  position: z.string().optional(),
  start_date: z.string().optional(),
  end_date: z.string().optional(),
  description: z.string().optional(),
})

type FormData = z.infer<typeof schema>

export default function ExperiencePage() {
  const { success, error } = useToast()
  const [items, setItems] = useState<Experience[]>([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState<Experience | null>(null)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [deleting, setDeleting] = useState(false)

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
  })

  const load = () => {
    setLoading(true)
    getExperience()
      .then(setItems)
      .catch(() => error('Failed to load experience'))
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [error])

  const onSubmit = async (data: FormData) => {
    const payload = { ...data, start_date: data.start_date || null, end_date: data.end_date || null }
    try {
      if (editing) {
        await updateExperience(editing.id, payload)
        success('Experience updated')
      } else {
        await createExperience(payload)
        success('Experience added')
      }
      reset()
      setEditing(null)
      load()
    } catch {
      error('Failed to save experience')
    }
  }

  const handleDelete = async () => {
    if (!deleteId) return
    setDeleting(true)
    try {
      await deleteExperience(deleteId)
      success('Experience deleted')
      setDeleteId(null)
      load()
    } catch {
      error('Failed to delete experience')
    } finally {
      setDeleting(false)
    }
  }

  return (
    <div>
      <PageHeader title="Experience" description="Manage your work experience." />

      <Card className="mb-6">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <FormField label="Company" required error={errors.company?.message}>
              <input className={formInputClass} {...register('company')} />
            </FormField>
            <FormField label="Position">
              <input className={formInputClass} {...register('position')} />
            </FormField>
            <FormField label="Start Date">
              <input type="date" className={formInputClass} {...register('start_date')} />
            </FormField>
            <FormField label="End Date">
              <input type="date" className={formInputClass} {...register('end_date')} />
            </FormField>
          </div>
          <FormField label="Description">
            <textarea className={formTextareaClass} rows={4} {...register('description')} />
          </FormField>
          <div className="flex gap-2">
            <Button type="submit" disabled={isSubmitting} className="gap-2">
              <FiPlus /> {editing ? 'Update' : 'Add'} Experience
            </Button>
            {editing && (
              <Button type="button" variant="secondary" onClick={() => { setEditing(null); reset() }}>Cancel</Button>
            )}
          </div>
        </form>
      </Card>

      <DataTable
        loading={loading}
        data={items}
        keyExtractor={(e) => e.id}
        columns={[
          { key: 'company', header: 'Company', render: (e) => <span className="font-medium">{e.company}</span> },
          { key: 'position', header: 'Position', render: (e) => e.position || '—' },
          {
            key: 'dates',
            header: 'Period',
            render: (e) => `${e.start_date?.slice(0, 4) || '?'} – ${e.end_date?.slice(0, 4) || 'Present'}`,
          },
          {
            key: 'actions',
            header: '',
            className: 'w-24',
            render: (e) => (
              <div className="flex justify-end gap-1">
                <Button variant="ghost" size="sm" onClick={() => { setEditing(e); reset({ company: e.company, position: e.position || '', start_date: e.start_date?.slice(0, 10) || '', end_date: e.end_date?.slice(0, 10) || '', description: e.description || '' }) }}><FiEdit /></Button>
                <Button variant="ghost" size="sm" onClick={() => setDeleteId(e.id)}><FiTrash2 className="text-red-500" /></Button>
              </div>
            ),
          },
        ]}
      />

      <ConfirmModal open={!!deleteId} loading={deleting} message="Delete this experience entry?" onConfirm={handleDelete} onCancel={() => setDeleteId(null)} />
    </div>
  )
}
