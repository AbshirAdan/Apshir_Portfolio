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
import { createEducation, deleteEducation, getEducation, updateEducation } from '../../../shared/services/cmsApi'
import type { Education } from '../../../shared/types/cms.types'

const schema = z.object({
  school: z.string().min(1, 'School is required'),
  degree: z.string().optional(),
  field: z.string().optional(),
  start_date: z.string().optional(),
  end_date: z.string().optional(),
})

type FormData = z.infer<typeof schema>

export default function EducationPage() {
  const { success, error } = useToast()
  const [items, setItems] = useState<Education[]>([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState<Education | null>(null)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [deleting, setDeleting] = useState(false)

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
  })

  const load = () => {
    setLoading(true)
    getEducation()
      .then(setItems)
      .catch(() => error('Failed to load education'))
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [error])

  const onSubmit = async (data: FormData) => {
    const payload = { ...data, start_date: data.start_date || null, end_date: data.end_date || null }
    try {
      if (editing) {
        await updateEducation(editing.id, payload)
        success('Education updated')
      } else {
        await createEducation(payload)
        success('Education added')
      }
      reset()
      setEditing(null)
      load()
    } catch {
      error('Failed to save education')
    }
  }

  const handleDelete = async () => {
    if (!deleteId) return
    setDeleting(true)
    try {
      await deleteEducation(deleteId)
      success('Education deleted')
      setDeleteId(null)
      load()
    } catch {
      error('Failed to delete education')
    } finally {
      setDeleting(false)
    }
  }

  return (
    <div>
      <PageHeader title="Education" description="Manage your educational background." />

      <Card className="mb-6">
        <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4 md:grid-cols-2">
          <FormField label="School" required error={errors.school?.message}>
            <input className={formInputClass} {...register('school')} />
          </FormField>
          <FormField label="Degree">
            <input className={formInputClass} {...register('degree')} />
          </FormField>
          <FormField label="Field of Study">
            <input className={formInputClass} {...register('field')} />
          </FormField>
          <div />
          <FormField label="Start Date">
            <input type="date" className={formInputClass} {...register('start_date')} />
          </FormField>
          <FormField label="End Date">
            <input type="date" className={formInputClass} {...register('end_date')} />
          </FormField>
          <div className="flex gap-2 md:col-span-2">
            <Button type="submit" disabled={isSubmitting} className="gap-2">
              <FiPlus /> {editing ? 'Update' : 'Add'} Education
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
          { key: 'school', header: 'School', render: (e) => <span className="font-medium">{e.school}</span> },
          { key: 'degree', header: 'Degree', render: (e) => e.degree || '—' },
          { key: 'field', header: 'Field', render: (e) => e.field || '—' },
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
                <Button variant="ghost" size="sm" onClick={() => { setEditing(e); reset({ school: e.school, degree: e.degree || '', field: e.field || '', start_date: e.start_date?.slice(0, 10) || '', end_date: e.end_date?.slice(0, 10) || '' }) }}><FiEdit /></Button>
                <Button variant="ghost" size="sm" onClick={() => setDeleteId(e.id)}><FiTrash2 className="text-red-500" /></Button>
              </div>
            ),
          },
        ]}
      />

      <ConfirmModal open={!!deleteId} loading={deleting} message="Delete this education entry?" onConfirm={handleDelete} onCancel={() => setDeleteId(null)} />
    </div>
  )
}
