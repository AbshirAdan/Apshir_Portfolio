import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { FiEdit, FiExternalLink, FiPlus, FiTrash2 } from 'react-icons/fi'
import { ConfirmModal } from '../../../shared/components/admin/ConfirmModal'
import { DataTable } from '../../../shared/components/admin/DataTable'
import { PageHeader } from '../../../shared/components/admin/PageHeader'
import { SearchBar } from '../../../shared/components/admin/SearchBar'
import { Badge, Button } from '../../../shared/components/ui'
import { useToast } from '../../../shared/context/ToastContext'
import { deleteBlog, getBlogs } from '../../../shared/services/cmsApi'
import type { Blog } from '../../../shared/types/cms.types'
import { formatDate } from '../../../shared/utils/cn'

const PAGE_SIZE = 10

export default function BlogsPage() {
  const { success, error } = useToast()
  const [blogs, setBlogs] = useState<Blog[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    const t = setTimeout(() => { setDebouncedSearch(search); setPage(1) }, 300)
    return () => clearTimeout(t)
  }, [search])

  const load = useCallback(() => {
    setLoading(true)
    getBlogs({ page, limit: PAGE_SIZE, search: debouncedSearch || undefined })
      .then((res) => {
        setBlogs(res.items ?? (res as unknown as Blog[]))
        setTotal(res.total ?? (Array.isArray(res) ? (res as unknown as Blog[]).length : 0))
      })
      .catch(() => error('Failed to load blogs'))
      .finally(() => setLoading(false))
  }, [page, debouncedSearch, error])

  useEffect(() => { load() }, [load])

  const handleDelete = async () => {
    if (!deleteId) return
    setDeleting(true)
    try {
      await deleteBlog(deleteId)
      success('Blog post deleted')
      setDeleteId(null)
      load()
    } catch {
      error('Failed to delete blog post')
    } finally {
      setDeleting(false)
    }
  }

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE))

  return (
    <div>
      <PageHeader
        title="Blog Posts"
        description="Manage your blog content."
        actions={
          <Link to="/admin/blogs/new">
            <Button className="gap-2"><FiPlus /> New Post</Button>
          </Link>
        }
      />

      <div className="mb-4">
        <SearchBar value={search} onChange={setSearch} placeholder="Search blog posts..." />
      </div>

      <DataTable
        loading={loading}
        data={blogs}
        keyExtractor={(b) => b.id}
        columns={[
          {
            key: 'image',
            header: 'Image',
            className: 'w-24',
            render: (b) => (
              b.cover_image ? <img src={b.cover_image} alt="" className="h-12 w-16 rounded-lg object-cover" /> : '—'
            ),
          },
          {
            key: 'title',
            header: 'Title',
            render: (b) => (
              <div>
                <p className="font-medium text-slate-900 dark:text-white">{b.title}</p>
                <p className="text-xs text-slate-500">{b.slug}</p>
              </div>
            ),
          },
          { key: 'category', header: 'Category', render: (b) => b.category || '—' },
          {
            key: 'status',
            header: 'Status',
            render: (b) => (
              <Badge color={b.status === 'published' ? 'green' : 'slate'}>{b.status}</Badge>
            ),
          },
          { key: 'created_at', header: 'Created', render: (b) => formatDate(b.created_at) },
          {
            key: 'actions',
            header: '',
            className: 'w-32',
            render: (b) => (
              <div className="flex justify-end gap-1">
                <a href={`/blog/${b.slug}`} target="_blank" rel="noreferrer"><Button variant="ghost" size="sm"><FiExternalLink /></Button></a>
                <Link to={`/admin/blogs/${b.id}`}><Button variant="ghost" size="sm"><FiEdit /></Button></Link>
                <Button variant="ghost" size="sm" onClick={() => setDeleteId(b.id)}><FiTrash2 className="text-red-500" /></Button>
              </div>
            ),
          },
        ]}
      />

      {totalPages > 1 && (
        <div className="mt-4 flex items-center justify-between">
          <p className="text-sm text-slate-500">Page {page} of {totalPages}</p>
          <div className="flex gap-2">
            <Button variant="secondary" size="sm" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>Previous</Button>
            <Button variant="secondary" size="sm" disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)}>Next</Button>
          </div>
        </div>
      )}

      <ConfirmModal open={!!deleteId} loading={deleting} message="Delete this blog post?" onConfirm={handleDelete} onCancel={() => setDeleteId(null)} />
    </div>
  )
}
