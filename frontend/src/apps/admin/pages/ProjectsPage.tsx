import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { FiEdit, FiPlus, FiTrash2 } from 'react-icons/fi'
import { ConfirmModal } from '../../../shared/components/admin/ConfirmModal'
import { DataTable } from '../../../shared/components/admin/DataTable'
import { PageHeader } from '../../../shared/components/admin/PageHeader'
import { SearchBar } from '../../../shared/components/admin/SearchBar'
import { Badge, Button } from '../../../shared/components/ui'
import { useToast } from '../../../shared/context/ToastContext'
import { deleteProject, getProjects } from '../../../shared/services/cmsApi'
import type { Project } from '../../../shared/types/cms.types'
import { formatDate } from '../../../shared/utils/cn'

const PAGE_SIZE = 10

export default function ProjectsPage() {
  const { success, error } = useToast()
  const [projects, setProjects] = useState<Project[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    const t = setTimeout(() => {
      setDebouncedSearch(search)
      setPage(1)
    }, 300)
    return () => clearTimeout(t)
  }, [search])

  const load = useCallback(() => {
    setLoading(true)
    getProjects({ page, limit: PAGE_SIZE, search: debouncedSearch || undefined })
      .then((res) => {
        setProjects(res.items ?? (res as unknown as Project[]))
        setTotal(res.total ?? (Array.isArray(res) ? (res as unknown as Project[]).length : 0))
      })
      .catch(() => error('Failed to load projects'))
      .finally(() => setLoading(false))
  }, [page, debouncedSearch, error])

  useEffect(() => {
    load()
  }, [load])

  const handleDelete = async () => {
    if (!deleteId) return
    setDeleting(true)
    try {
      await deleteProject(deleteId)
      success('Project deleted')
      setDeleteId(null)
      load()
    } catch {
      error('Failed to delete project')
    } finally {
      setDeleting(false)
    }
  }

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE))

  return (
    <div>
      <PageHeader
        title="Projects"
        description="Manage your portfolio projects."
        actions={
          <Link to="/admin/projects/new">
            <Button className="gap-2">
              <FiPlus /> Add Project
            </Button>
          </Link>
        }
      />

      <div className="mb-4">
        <SearchBar value={search} onChange={setSearch} placeholder="Search projects..." />
      </div>

      <DataTable
        loading={loading}
        data={projects}
        keyExtractor={(p) => p.id}
        emptyMessage="No projects found."
        columns={[
          {
            key: 'title',
            header: 'Title',
            render: (p) => (
              <div className="flex items-center gap-3">
                {p.thumbnail && (
                  <img src={p.thumbnail} alt="" className="h-10 w-10 rounded-lg object-cover" />
                )}
                <div>
                  <p className="font-medium text-slate-900 dark:text-white">{p.title}</p>
                  <p className="text-xs text-slate-500">{p.slug}</p>
                </div>
              </div>
            ),
          },
          {
            key: 'status',
            header: 'Status',
            render: (p) => (
              <Badge color={p.status === 'published' ? 'green' : p.status === 'archived' ? 'slate' : 'indigo'}>
                {p.status}
              </Badge>
            ),
          },
          {
            key: 'featured',
            header: 'Featured',
            render: (p) => (p.featured ? <Badge color="indigo">Yes</Badge> : '—'),
          },
          {
            key: 'created_at',
            header: 'Created',
            render: (p) => formatDate(p.created_at),
          },
          {
            key: 'actions',
            header: '',
            className: 'w-24',
            render: (p) => (
              <div className="flex justify-end gap-1">
                <Link to={`/admin/projects/${p.id}`}>
                  <Button variant="ghost" size="sm">
                    <FiEdit />
                  </Button>
                </Link>
                <Button variant="ghost" size="sm" onClick={() => setDeleteId(p.id)}>
                  <FiTrash2 className="text-red-500" />
                </Button>
              </div>
            ),
          },
        ]}
      />

      {totalPages > 1 && (
        <div className="mt-4 flex items-center justify-between">
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Page {page} of {totalPages} ({total} total)
          </p>
          <div className="flex gap-2">
            <Button variant="secondary" size="sm" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
              Previous
            </Button>
            <Button variant="secondary" size="sm" disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)}>
              Next
            </Button>
          </div>
        </div>
      )}

      <ConfirmModal
        open={!!deleteId}
        message="Are you sure you want to delete this project? This action cannot be undone."
        loading={deleting}
        onConfirm={handleDelete}
        onCancel={() => setDeleteId(null)}
      />
    </div>
  )
}
