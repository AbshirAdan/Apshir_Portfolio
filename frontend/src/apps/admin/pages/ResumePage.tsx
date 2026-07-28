import { useEffect, useState, useRef } from 'react'
import { FiDownload, FiFileText, FiTrash2, FiUpload, FiEdit2, FiCalendar } from 'react-icons/fi'
import { motion, AnimatePresence } from 'framer-motion'
import { ConfirmModal } from '../../../shared/components/admin/ConfirmModal'
import { EmptyState } from '../../../shared/components/admin/EmptyState'
import { PageHeader } from '../../../shared/components/admin/PageHeader'
import { Badge, Button, Card, PageLoader, Input, Textarea } from '../../../shared/components/ui'
import { useToast } from '../../../shared/context/ToastContext'
import { deleteResume, getResumes, uploadResume, updateResume } from '../../../shared/services/cmsApi'
import type { Resume } from '../../../shared/types/cms.types'
import { formatDate } from '../../../shared/utils/cn'

export default function ResumePage() {
  const { success, error } = useToast()
  const [resumes, setResumes] = useState<Resume[]>([])
  const [loading, setLoading] = useState(true)
  
  // Upload Form State
  const [uploading, setUploading] = useState(false)
  const [version, setVersion] = useState('1.0')
  const [description, setDescription] = useState('')
  const [file, setFile] = useState<File | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Edit Form State
  const [editResume, setEditResume] = useState<Resume | null>(null)
  const [editVersion, setEditVersion] = useState('')
  const [editDescription, setEditDescription] = useState('')
  const [savingEdit, setSavingEdit] = useState(false)

  // Delete State
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [deleting, setDeleting] = useState(false)

  const load = () => {
    setLoading(true)
    getResumes()
      .then(setResumes)
      .catch(() => error('Failed to load resumes'))
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [error])

  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!file) {
      error('Please select a PDF file first.')
      return
    }
    setUploading(true)
    try {
      await uploadResume(file, version, description)
      success('Resume uploaded and set active')
      setFile(null)
      setVersion('1.0')
      setDescription('')
      if (fileInputRef.current) fileInputRef.current.value = ''
      load()
    } catch {
      error('Failed to upload resume')
    } finally {
      setUploading(false)
    }
  }

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editResume) return
    setSavingEdit(true)
    try {
      await updateResume(editResume.id, {
        version: editVersion,
        description: editDescription,
      })
      success('Resume updated')
      setEditResume(null)
      load()
    } catch {
      error('Failed to update resume details')
    } finally {
      setSavingEdit(false)
    }
  }

  const handleDelete = async () => {
    if (!deleteId) return
    setDeleting(true)
    try {
      await deleteResume(deleteId)
      success('Resume deleted')
      setDeleteId(null)
      load()
    } catch {
      error('Failed to delete resume')
    } finally {
      setDeleting(false)
    }
  }

  const formatBytes = (bytes?: number | null) => {
    if (bytes === undefined || bytes === null) return 'N/A'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i]
  }

  if (loading) return <PageLoader />

  return (
    <div>
      <PageHeader title="Resume Management" description="Upload new resume versions (PDFs) and manage their details." />

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left Form: Upload New Resume */}
        <Card className="lg:col-span-1 h-fit">
          <h2 className="mb-4 text-lg font-semibold text-slate-900 dark:text-white flex items-center gap-2">
            <FiUpload className="text-indigo-600 dark:text-indigo-400" />
            Upload New Resume
          </h2>
          <form onSubmit={handleUploadSubmit} className="space-y-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">
                Resume PDF File
              </label>
              <div 
                onClick={() => fileInputRef.current?.click()}
                className={`flex h-32 cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-300 bg-slate-50 transition hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:hover:bg-slate-700/50 ${file ? 'border-green-500 dark:border-green-500 bg-green-50/50 dark:bg-green-950/20' : ''}`}
              >
                <FiUpload className={`mb-2 text-2xl ${file ? 'text-green-500' : 'text-slate-400'}`} />
                <span className="text-center text-xs text-slate-600 dark:text-slate-300 px-2 truncate max-w-full">
                  {file ? file.name : 'Click to browse for a PDF resume'}
                </span>
                <span className="mt-1 text-[10px] text-slate-400">PDF only, max 10MB</span>
                <input 
                  type="file" 
                  ref={fileInputRef}
                  accept="application/pdf" 
                  className="hidden" 
                  onChange={(e) => setFile(e.target.files?.[0] || null)}
                />
              </div>
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">
                Version Number
              </label>
              <Input 
                type="text" 
                placeholder="e.g. 1.0, 1.1, 2.0" 
                value={version} 
                onChange={(e) => setVersion(e.target.value)} 
                required
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">
                Description / Release Notes (Optional)
              </label>
              <Textarea 
                placeholder="Describe what changed in this version..." 
                value={description} 
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
              />
            </div>

            <Button 
              type="submit" 
              className="w-full gap-2" 
              disabled={uploading || !file}
            >
              {uploading ? 'Uploading...' : 'Upload & Set Active'}
            </Button>
          </form>
        </Card>

        {/* Right Section: Resume Files List */}
        <div className="lg:col-span-2 space-y-4">
          <Card>
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white flex items-center gap-2">
              <FiFileText className="text-indigo-600 dark:text-indigo-400" />
              Resume Versions
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              All uploaded resume versions. The currently active resume is dynamically embedded in the public website.
            </p>
          </Card>

          {resumes.length === 0 ? (
            <EmptyState icon={FiFileText} title="No resume uploaded" message="Upload a PDF resume to populate this section." />
          ) : (
            <div className="space-y-4">
              {resumes.map((r) => (
                <Card key={r.id} className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5">
                  <div className="space-y-2 flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-semibold text-slate-900 dark:text-white text-base">Version {r.version}</h3>
                      {r.is_active ? (
                        <Badge color="green">Active</Badge>
                      ) : (
                        <Badge color="slate">Inactive</Badge>
                      )}
                    </div>
                    
                    {r.description && (
                      <p className="text-sm text-slate-600 dark:text-slate-300 italic line-clamp-2">
                        "{r.description}"
                      </p>
                    )}

                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500 dark:text-slate-400">
                      <span className="flex items-center gap-1">
                        <FiCalendar className="shrink-0" />
                        Uploaded: {formatDate(r.created_at)}
                      </span>
                      {r.file_size && (
                        <span>Size: {formatBytes(r.file_size)}</span>
                      )}
                      {r.page_count && (
                        <span>Pages: {r.page_count}</span>
                      )}
                    </div>

                    <p className="text-xs text-slate-400 truncate" title={r.file_name || r.file_url}>
                      File: {r.file_name || r.file_url.split('/').pop()}
                    </p>
                  </div>

                  <div className="flex gap-2 shrink-0 self-end md:self-center">
                    <Button 
                      variant="secondary" 
                      size="sm" 
                      onClick={() => {
                        setEditResume(r)
                        setEditVersion(r.version)
                        setEditDescription(r.description || '')
                      }}
                      className="gap-1.5"
                    >
                      <FiEdit2 size={14} /> Edit
                    </Button>
                    <a href={r.file_url} target="_blank" rel="noreferrer">
                      <Button variant="secondary" size="sm" className="gap-1.5">
                        <FiDownload size={14} /> Download
                      </Button>
                    </a>
                    <Button variant="ghost" size="sm" onClick={() => setDeleteId(r.id)}>
                      <FiTrash2 size={16} className="text-red-500" />
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Edit Resume Details Modal */}
      <AnimatePresence>
        {editResume && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm"
              onClick={() => setEditResume(null)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 8 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 8 }}
              className="relative w-full max-w-md rounded-2xl border border-brand-border bg-brand-card p-6 text-brand-text shadow-2xl transition-colors duration-300"
            >
              <div className="mb-4 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-100 text-indigo-600 dark:bg-indigo-950 dark:text-indigo-400">
                  <FiEdit2 />
                </div>
                <h3 className="text-lg font-semibold text-brand-text">Edit Resume Details</h3>
              </div>
              <form onSubmit={handleEditSubmit} className="space-y-4">
                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">
                    Version Number
                  </label>
                  <Input 
                    type="text" 
                    value={editVersion} 
                    onChange={(e) => setEditVersion(e.target.value)} 
                    required
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">
                    Description / Release Notes (Optional)
                  </label>
                  <Textarea 
                    value={editDescription} 
                    onChange={(e) => setEditDescription(e.target.value)}
                    rows={4}
                  />
                </div>
                <div className="flex justify-end gap-3 pt-2">
                  <Button variant="secondary" onClick={() => setEditResume(null)} disabled={savingEdit}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={savingEdit}>
                    {savingEdit ? 'Saving...' : 'Save Changes'}
                  </Button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <ConfirmModal 
        open={!!deleteId} 
        loading={deleting} 
        message="Are you sure you want to delete this resume? If you delete the currently active resume, the latest remaining resume will automatically become active." 
        onConfirm={handleDelete} 
        onCancel={() => setDeleteId(null)} 
      />
    </div>
  )
}
