import { useCallback, useEffect, useMemo, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  FiEdit2,
  FiEye,
  FiSlash,
  FiTrash2,
  FiUserCheck,
  FiUsers,
  FiX,
} from 'react-icons/fi'
import { ConfirmModal } from '../../../shared/components/admin/ConfirmModal'
import { DataTable } from '../../../shared/components/admin/DataTable'
import { PageHeader } from '../../../shared/components/admin/PageHeader'
import { SearchBar } from '../../../shared/components/admin/SearchBar'
import { Badge, Button, Input, Textarea } from '../../../shared/components/ui'
import { useToast } from '../../../shared/context/ToastContext'
import { useAuth } from '../../../shared/context/AuthContext'
import {
  deleteAdminUser,
  getAdminUsers,
  updateAdminUser,
  updateAdminUserRole,
  updateAdminUserStatus,
} from '../../../shared/services/cmsApi'
import type { ManagedUser, UserManagementStats } from '../../../shared/types/cms.types'
import { formatDate } from '../../../shared/utils/cn'
import { toUploadSrc } from '../../../shared/utils/uploadUrl'

const PAGE_SIZE = 10

const emptyStats: UserManagementStats = {
  totalUsers: 0,
  activeUsers: 0,
  inactiveUsers: 0,
  blockedUsers: 0,
  administrators: 0,
  newUsersThisMonth: 0,
}

type ViewMode = 'view' | 'edit' | null

export default function UsersPage() {
  const { success, error } = useToast()
  const { user: me } = useAuth()

  const [users, setUsers] = useState<ManagedUser[]>([])
  const [stats, setStats] = useState<UserManagementStats>(emptyStats)
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [role, setRole] = useState('')
  const [status, setStatus] = useState('')
  const [sortBy, setSortBy] = useState('created_at')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState('')

  const [selected, setSelected] = useState<ManagedUser | null>(null)
  const [mode, setMode] = useState<ViewMode>(null)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  const [editForm, setEditForm] = useState({
    full_name: '',
    email: '',
    phone: '',
    bio: '',
    role: 'user',
    status: 'active',
  })
  const [avatarFile, setAvatarFile] = useState<File | null>(null)
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null)

  useEffect(() => {
    const t = setTimeout(() => {
      setDebouncedSearch(search)
      setPage(1)
    }, 300)
    return () => clearTimeout(t)
  }, [search])

  const load = useCallback(() => {
    setLoading(true)
    setLoadError('')
    getAdminUsers({
      page,
      limit: PAGE_SIZE,
      search: debouncedSearch || undefined,
      role: role || undefined,
      status: status || undefined,
      sortBy,
      sortOrder,
    })
      .then((res) => {
        setUsers(res.items)
        setTotal(res.total)
        setStats(res.stats)
      })
      .catch(() => {
        setLoadError('Failed to load users')
        error('Failed to load users')
      })
      .finally(() => setLoading(false))
  }, [page, debouncedSearch, role, status, sortBy, sortOrder, error])

  useEffect(() => {
    load()
  }, [load])

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE))
  const pageNumbers = useMemo(() => {
    const pages: number[] = []
    const start = Math.max(1, page - 2)
    const end = Math.min(totalPages, start + 4)
    for (let i = Math.max(1, end - 4); i <= end; i += 1) pages.push(i)
    return pages
  }, [page, totalPages])

  const openView = (u: ManagedUser) => {
    setSelected(u)
    setMode('view')
  }

  const openEdit = (u: ManagedUser) => {
    setSelected(u)
    setEditForm({
      full_name: u.full_name || '',
      email: u.email || '',
      phone: u.phone || '',
      bio: u.bio || '',
      role: u.role || 'user',
      status: u.status || 'active',
    })
    setAvatarFile(null)
    setAvatarPreview(toUploadSrc(u.avatar))
    setMode('edit')
  }

  const closeModal = () => {
    setMode(null)
    setSelected(null)
    setAvatarFile(null)
  }

  const handleSave = async () => {
    if (!selected) return
    setBusy(true)
    try {
      await updateAdminUser(
        selected.id,
        {
          full_name: editForm.full_name,
          email: editForm.email,
          phone: editForm.phone,
          bio: editForm.bio,
          role: editForm.role,
          status: editForm.status,
        },
        avatarFile || undefined
      )
      success('User updated')
      closeModal()
      load()
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        'Failed to update user'
      error(msg)
    } finally {
      setBusy(false)
    }
  }

  const handleDelete = async () => {
    if (!deleteId) return
    setBusy(true)
    try {
      await deleteAdminUser(deleteId)
      success('User deleted')
      setDeleteId(null)
      load()
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        'Failed to delete user'
      error(msg)
    } finally {
      setBusy(false)
    }
  }

  const setUserStatus = async (u: ManagedUser, next: string) => {
    try {
      await updateAdminUserStatus(u.id, next)
      success(`User marked ${next}`)
      load()
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        'Failed to update status'
      error(msg)
    }
  }

  const toggleRole = async (u: ManagedUser) => {
    const next = u.role === 'admin' ? 'user' : 'admin'
    try {
      await updateAdminUserRole(u.id, next)
      success(`Role changed to ${next}`)
      load()
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        'Failed to update role'
      error(msg)
    }
  }

  const statusBadge = (s: string) => {
    if (s === 'active') return <Badge color="green">Active</Badge>
    if (s === 'blocked') return <Badge color="red">Blocked</Badge>
    return <Badge color="slate">Inactive</Badge>
  }

  const roleBadge = (r: string) => (
    <Badge color={r === 'admin' ? 'indigo' : 'slate'}>{r}</Badge>
  )

  return (
    <div>
      <PageHeader title="Users" description="Manage registered users, roles, and account status." />

      <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <StatCard label="Total Users" value={stats.totalUsers} />
        <StatCard label="Active Users" value={stats.activeUsers} />
        <StatCard label="Inactive Users" value={stats.inactiveUsers} />
        <StatCard label="Administrators" value={stats.administrators} />
        <StatCard label="New This Month" value={stats.newUsersThisMonth} />
      </div>

      <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <div className="w-full max-w-md">
          <SearchBar value={search} onChange={setSearch} placeholder="Search name, email, phone…" />
        </div>
        <div className="flex flex-wrap gap-2">
          <select
            className="theme-input !w-auto !py-2 text-sm"
            value={role}
            onChange={(e) => {
              setRole(e.target.value)
              setPage(1)
            }}
          >
            <option value="">All roles</option>
            <option value="admin">Admin</option>
            <option value="user">User</option>
            <option value="editor">Editor</option>
          </select>
          <select
            className="theme-input !w-auto !py-2 text-sm"
            value={status}
            onChange={(e) => {
              setStatus(e.target.value)
              setPage(1)
            }}
          >
            <option value="">All statuses</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="blocked">Blocked</option>
          </select>
          <select
            className="theme-input !w-auto !py-2 text-sm"
            value={`${sortBy}:${sortOrder}`}
            onChange={(e) => {
              const [s, o] = e.target.value.split(':') as [string, 'asc' | 'desc']
              setSortBy(s)
              setSortOrder(o)
              setPage(1)
            }}
          >
            <option value="created_at:desc">Newest joined</option>
            <option value="created_at:asc">Oldest joined</option>
            <option value="name:asc">Name A–Z</option>
            <option value="name:desc">Name Z–A</option>
            <option value="email:asc">Email A–Z</option>
            <option value="last_login:desc">Last login (recent)</option>
            <option value="last_login:asc">Last login (oldest)</option>
          </select>
        </div>
      </div>

      {loadError && !loading ? (
        <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-8 text-center text-red-400">
          {loadError}
          <div className="mt-3">
            <Button size="sm" onClick={load}>
              Retry
            </Button>
          </div>
        </div>
      ) : (
        <DataTable
          loading={loading}
          data={users as Array<ManagedUser & Record<string, unknown>>}
          keyExtractor={(u) => u.id}
          emptyMessage="No users found."
          columns={[
            {
              key: 'avatar',
              header: 'Profile',
              render: (u) => {
                const src = toUploadSrc(u.avatar)
                return src ? (
                  <img src={src} alt="" className="h-10 w-10 rounded-full object-cover" />
                ) : (
                  <span className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-600 text-sm font-bold text-white">
                    {(u.full_name || 'U').charAt(0).toUpperCase()}
                  </span>
                )
              },
            },
            {
              key: 'full_name',
              header: 'Full Name',
              render: (u) => (
                <div>
                  <p className="font-medium text-brand-text">{u.full_name}</p>
                  {u.id === me?.id && <p className="text-xs text-brand-primary">You</p>}
                </div>
              ),
            },
            { key: 'email', header: 'Email' },
            {
              key: 'phone',
              header: 'Phone',
              render: (u) => u.phone || '—',
            },
            {
              key: 'role',
              header: 'Role',
              render: (u) => roleBadge(u.role),
            },
            {
              key: 'status',
              header: 'Status',
              render: (u) => statusBadge(u.status),
            },
            {
              key: 'created_at',
              header: 'Registered',
              render: (u) => formatDate(u.created_at),
            },
            {
              key: 'last_login',
              header: 'Last Login',
              render: (u) => (u.last_login ? formatDate(u.last_login) : 'Never'),
            },
            {
              key: 'actions',
              header: 'Actions',
              className: 'w-48',
              render: (u) => (
                <div className="flex flex-wrap justify-end gap-1" onClick={(e) => e.stopPropagation()}>
                  <Button variant="ghost" size="sm" title="View" onClick={() => openView(u)}>
                    <FiEye />
                  </Button>
                  <Button variant="ghost" size="sm" title="Edit" onClick={() => openEdit(u)}>
                    <FiEdit2 />
                  </Button>
                  {u.status === 'active' ? (
                    <Button
                      variant="ghost"
                      size="sm"
                      title="Deactivate"
                      onClick={() => setUserStatus(u, 'inactive')}
                    >
                      <FiSlash className="text-amber-500" />
                    </Button>
                  ) : (
                    <Button
                      variant="ghost"
                      size="sm"
                      title="Activate"
                      onClick={() => setUserStatus(u, 'active')}
                    >
                      <FiUserCheck className="text-green-500" />
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    title="Delete"
                    onClick={() => setDeleteId(u.id)}
                    disabled={u.id === me?.id}
                  >
                    <FiTrash2 className="text-red-500" />
                  </Button>
                </div>
              ),
            },
          ]}
        />
      )}

      {totalPages > 1 && (
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm text-brand-muted">
            Page {page} of {totalPages} ({total} total)
          </p>
          <div className="flex flex-wrap items-center gap-1">
            <Button variant="secondary" size="sm" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
              Previous
            </Button>
            {pageNumbers.map((n) => (
              <Button
                key={n}
                variant={n === page ? 'primary' : 'secondary'}
                size="sm"
                onClick={() => setPage(n)}
              >
                {n}
              </Button>
            ))}
            <Button
              variant="secondary"
              size="sm"
              disabled={page >= totalPages}
              onClick={() => setPage((p) => p + 1)}
            >
              Next
            </Button>
          </div>
        </div>
      )}

      <AnimatePresence>
        {mode && selected && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm"
              onClick={closeModal}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 8 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 8 }}
              className="relative max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl border border-brand-border bg-brand-card p-6 shadow-2xl"
            >
              <div className="mb-4 flex items-start justify-between gap-3">
                <div>
                  <h3 className="text-lg font-semibold text-brand-text">
                    {mode === 'view' ? 'User Details' : 'Edit User'}
                  </h3>
                  <p className="text-sm text-brand-muted">{selected.email}</p>
                </div>
                <button type="button" className="rounded-lg p-2 hover:bg-brand-surface" onClick={closeModal}>
                  <FiX />
                </button>
              </div>

              {mode === 'view' ? (
                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    {toUploadSrc(selected.avatar) ? (
                      <img
                        src={toUploadSrc(selected.avatar)!}
                        alt=""
                        className="h-16 w-16 rounded-full object-cover"
                      />
                    ) : (
                      <span className="flex h-16 w-16 items-center justify-center rounded-full bg-indigo-600 text-xl font-bold text-white">
                        {selected.full_name.charAt(0)}
                      </span>
                    )}
                    <div>
                      <p className="text-lg font-semibold text-brand-text">{selected.full_name}</p>
                      <div className="mt-1 flex gap-2">
                        {roleBadge(selected.role)}
                        {statusBadge(selected.status)}
                      </div>
                    </div>
                  </div>
                  <Detail label="Email" value={selected.email} />
                  <Detail label="Phone" value={selected.phone || '—'} />
                  <Detail label="Bio" value={selected.bio || '—'} />
                  <Detail label="Created At" value={formatDate(selected.created_at)} />
                  <Detail label="Updated At" value={formatDate(selected.updated_at)} />
                  <Detail
                    label="Last Login"
                    value={selected.last_login ? formatDate(selected.last_login) : 'Never'}
                  />
                  <div className="flex flex-wrap justify-end gap-2 pt-2">
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => toggleRole(selected)}
                    >
                      Make {selected.role === 'admin' ? 'User' : 'Admin'}
                    </Button>
                    {selected.status === 'active' ? (
                      <>
                        <Button variant="secondary" size="sm" onClick={() => setUserStatus(selected, 'inactive')}>
                          Deactivate
                        </Button>
                        <Button variant="danger" size="sm" onClick={() => setUserStatus(selected, 'blocked')}>
                          Block
                        </Button>
                      </>
                    ) : (
                      <Button variant="primary" size="sm" onClick={() => setUserStatus(selected, 'active')}>
                        Activate
                      </Button>
                    )}
                    <Button size="sm" onClick={() => openEdit(selected)}>
                      Edit
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    {avatarPreview ? (
                      <img src={avatarPreview} alt="" className="h-14 w-14 rounded-full object-cover" />
                    ) : (
                      <span className="flex h-14 w-14 items-center justify-center rounded-full bg-indigo-600 font-bold text-white">
                        {editForm.full_name.charAt(0) || 'U'}
                      </span>
                    )}
                    <label className="cursor-pointer rounded-full border border-brand-border px-3 py-1.5 text-sm hover:bg-brand-surface">
                      Change Avatar
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0] || null
                          setAvatarFile(file)
                          if (avatarPreview?.startsWith('blob:')) URL.revokeObjectURL(avatarPreview)
                          setAvatarPreview(file ? URL.createObjectURL(file) : toUploadSrc(selected.avatar))
                        }}
                      />
                    </label>
                  </div>
                  <Field label="Full Name">
                    <Input
                      value={editForm.full_name}
                      onChange={(e) => setEditForm((f) => ({ ...f, full_name: e.target.value }))}
                    />
                  </Field>
                  <Field label="Email">
                    <Input
                      type="email"
                      value={editForm.email}
                      onChange={(e) => setEditForm((f) => ({ ...f, email: e.target.value }))}
                    />
                  </Field>
                  <Field label="Phone">
                    <Input
                      value={editForm.phone}
                      onChange={(e) => setEditForm((f) => ({ ...f, phone: e.target.value }))}
                    />
                  </Field>
                  <Field label="Bio">
                    <Textarea
                      rows={3}
                      value={editForm.bio}
                      onChange={(e) => setEditForm((f) => ({ ...f, bio: e.target.value }))}
                    />
                  </Field>
                  <div className="grid grid-cols-2 gap-3">
                    <Field label="Role">
                      <select
                        className="theme-input w-full"
                        value={editForm.role}
                        onChange={(e) => setEditForm((f) => ({ ...f, role: e.target.value }))}
                      >
                        <option value="user">User</option>
                        <option value="admin">Admin</option>
                        <option value="editor">Editor</option>
                      </select>
                    </Field>
                    <Field label="Status">
                      <select
                        className="theme-input w-full"
                        value={editForm.status}
                        onChange={(e) => setEditForm((f) => ({ ...f, status: e.target.value }))}
                      >
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                        <option value="blocked">Blocked</option>
                      </select>
                    </Field>
                  </div>
                  <div className="flex justify-end gap-2 pt-2">
                    <Button variant="secondary" onClick={closeModal} disabled={busy}>
                      Cancel
                    </Button>
                    <Button onClick={handleSave} disabled={busy}>
                      {busy ? 'Saving…' : 'Save Changes'}
                    </Button>
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <ConfirmModal
        open={!!deleteId}
        title="Delete User"
        message="Are you sure you want to delete this user? This action cannot be undone."
        loading={busy}
        onConfirm={handleDelete}
        onCancel={() => setDeleteId(null)}
      />
    </div>
  )
}

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-xl border border-brand-border bg-brand-card p-4 shadow-sm">
      <div className="mb-2 flex items-center gap-2 text-brand-primary">
        <FiUsers size={16} />
        <p className="text-xs font-medium uppercase tracking-wide text-brand-muted">{label}</p>
      </div>
      <p className="text-2xl font-bold text-brand-text">{value}</p>
    </div>
  )
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs font-medium uppercase tracking-wide text-brand-muted">{label}</p>
      <p className="mt-0.5 text-sm text-brand-text whitespace-pre-wrap">{value}</p>
    </div>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="mb-1 block text-sm font-medium text-brand-text">{label}</label>
      {children}
    </div>
  )
}
