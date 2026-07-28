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
import { createSkill, deleteSkill, getSkills, updateSkill } from '../../../shared/services/cmsApi'
import type { Skill } from '../../../shared/types/cms.types'

const schema = z.object({
  name: z.string().min(1, 'Name is required'),
  category: z.string().optional(),
  percentage: z.coerce.number().min(0).max(100),
  icon: z.string().optional(),
  display_order: z.coerce.number().optional(),
})

type FormData = z.infer<typeof schema>

export default function SkillsPage() {
  const { success, error } = useToast()
  const [skills, setSkills] = useState<Skill[]>([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState<Skill | null>(null)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [deleting, setDeleting] = useState(false)

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { percentage: 80, display_order: 0 },
  })

  const load = () => {
    setLoading(true)
    getSkills()
      .then(setSkills)
      .catch(() => error('Failed to load skills'))
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [error])

  const onSubmit = async (data: FormData) => {
    try {
      if (editing) {
        await updateSkill(editing.id, data)
        success('Skill updated')
      } else {
        await createSkill(data)
        success('Skill created')
      }
      reset({ name: '', category: '', percentage: 80, icon: '', display_order: 0 })
      setEditing(null)
      load()
    } catch {
      error('Failed to save skill')
    }
  }

  const startEdit = (skill: Skill) => {
    setEditing(skill)
    reset({
      name: skill.name,
      category: skill.category || '',
      percentage: skill.percentage,
      icon: skill.icon || '',
      display_order: skill.display_order,
    })
  }

  const handleDelete = async () => {
    if (!deleteId) return
    setDeleting(true)
    try {
      await deleteSkill(deleteId)
      success('Skill deleted')
      setDeleteId(null)
      load()
    } catch {
      error('Failed to delete skill')
    } finally {
      setDeleting(false)
    }
  }

  return (
    <div>
      <PageHeader title="Skills" description="Manage your technical skills." />

      <Card className="mb-6">
        <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4 md:grid-cols-6">
          <FormField label="Name" required error={errors.name?.message} className="md:col-span-2">
            <input className={formInputClass} {...register('name')} />
          </FormField>
          <FormField label="Category">
            <input className={formInputClass} {...register('category')} />
          </FormField>
          <FormField label="Proficiency %" error={errors.percentage?.message}>
            <input type="number" min={0} max={100} className={formInputClass} {...register('percentage')} />
          </FormField>
          <FormField label="Icon">
            <input className={formInputClass} placeholder="e.g. react" {...register('icon')} />
          </FormField>
          <div className="flex items-end gap-2 md:col-span-6">
            <Button type="submit" disabled={isSubmitting} className="gap-2">
              <FiPlus /> {editing ? 'Update' : 'Add'} Skill
            </Button>
            {editing && (
              <Button type="button" variant="secondary" onClick={() => { setEditing(null); reset({ name: '', category: '', percentage: 80, icon: '', display_order: 0 }) }}>
                Cancel Edit
              </Button>
            )}
          </div>
        </form>
      </Card>

      <DataTable
        loading={loading}
        data={skills}
        keyExtractor={(s) => s.id}
        columns={[
          { key: 'name', header: 'Name', render: (s) => <span className="font-medium">{s.name}</span> },
          { key: 'category', header: 'Category', render: (s) => s.category || '—' },
          { key: 'percentage', header: 'Proficiency', render: (s) => `${s.percentage}%` },
          {
            key: 'actions',
            header: '',
            className: 'w-24',
            render: (s) => (
              <div className="flex justify-end gap-1">
                <Button variant="ghost" size="sm" onClick={() => startEdit(s)}><FiEdit /></Button>
                <Button variant="ghost" size="sm" onClick={() => setDeleteId(s.id)}><FiTrash2 className="text-red-500" /></Button>
              </div>
            ),
          },
        ]}
      />

      <ConfirmModal open={!!deleteId} loading={deleting} message="Delete this skill?" onConfirm={handleDelete} onCancel={() => setDeleteId(null)} />
    </div>
  )
}
