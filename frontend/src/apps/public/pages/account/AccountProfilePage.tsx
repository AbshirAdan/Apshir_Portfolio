import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useState } from 'react'
import { motion } from 'framer-motion'
import { useAuth } from '../../../../shared/context/AuthContext'
import { updateUserProfile, uploadUserAvatar } from '../../../../shared/services/authService'
import { useToast } from '../../../../shared/context/ToastContext'
import { toUploadSrc } from '../../../../shared/utils/uploadUrl'
import { Spinner } from '../../../../shared/components/ui'

const schema = z.object({
  full_name: z.string().min(2, 'Full name is required'),
  email: z.string().email('Invalid email'),
  phone: z.string().optional(),
  bio: z.string().max(2000).optional(),
})

type FormData = z.infer<typeof schema>

export default function AccountProfilePage() {
  const { user, refreshUser } = useAuth()
  const toast = useToast()
  const [uploading, setUploading] = useState(false)
  const avatar = toUploadSrc(user?.avatar)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    values: {
      full_name: user?.full_name || '',
      email: user?.email || '',
      phone: user?.phone || '',
      bio: user?.bio || '',
    },
  })

  const onSubmit = async (data: FormData) => {
    try {
      await updateUserProfile({
        full_name: data.full_name,
        email: data.email,
        phone: data.phone || '',
        bio: data.bio || '',
      })
      await refreshUser()
      toast.success('Profile updated')
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        'Update failed'
      toast.error(msg)
    }
  }

  const onAvatar = async (file: File | undefined) => {
    if (!file) return
    setUploading(true)
    try {
      await uploadUserAvatar(file)
      await refreshUser()
      toast.success('Avatar updated')
    } catch {
      toast.error('Avatar upload failed')
    } finally {
      setUploading(false)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-2xl rounded-3xl border border-brand-border bg-brand-card/70 p-8 backdrop-blur-xl"
    >
      <h2 className="text-xl font-semibold text-brand-text">My Profile</h2>
      <p className="mt-1 text-sm text-brand-muted">Update your personal information</p>

      <div className="mt-6 flex items-center gap-4">
        {avatar ? (
          <img src={avatar} alt="" className="h-20 w-20 rounded-full object-cover" />
        ) : (
          <span className="flex h-20 w-20 items-center justify-center rounded-full bg-brand-primary text-2xl font-bold text-white">
            {(user?.full_name || 'U').charAt(0)}
          </span>
        )}
        <label className="cursor-pointer rounded-full border border-brand-border px-4 py-2 text-sm hover:bg-brand-surface">
          {uploading ? 'Uploading…' : 'Upload Avatar'}
          <input
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => onAvatar(e.target.files?.[0])}
          />
        </label>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-4" noValidate>
        <div>
          <label className="mb-1 block text-sm font-medium">Full Name</label>
          <input className="theme-input w-full" {...register('full_name')} />
          {errors.full_name && <p className="mt-1 text-xs text-red-400">{errors.full_name.message}</p>}
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">Email</label>
          <input type="email" className="theme-input w-full" {...register('email')} />
          {errors.email && <p className="mt-1 text-xs text-red-400">{errors.email.message}</p>}
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">Phone</label>
          <input className="theme-input w-full" {...register('phone')} />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">Bio</label>
          <textarea rows={4} className="theme-input w-full" {...register('bio')} />
        </div>
        <button
          type="submit"
          disabled={isSubmitting}
          className="btn-primary btn-premium inline-flex items-center gap-2 !rounded-full"
        >
          {isSubmitting ? <Spinner size="sm" /> : null}
          Save Changes
        </button>
      </form>
    </motion.div>
  )
}
