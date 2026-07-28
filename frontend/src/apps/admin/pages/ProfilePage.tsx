import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { motion } from 'framer-motion'
import { FiUpload, FiUser } from 'react-icons/fi'
import { FormField, formInputClass, formTextareaClass } from '../../../shared/components/admin/FormField'
import { PageHeader } from '../../../shared/components/admin/PageHeader'
import { Button, Card, PageLoader } from '../../../shared/components/ui'
import { useAuth } from '../../../shared/context/AuthContext'
import { useToast } from '../../../shared/context/ToastContext'
import { changePassword, getProfile, updateProfile, uploadAvatar } from '../../../shared/services/cmsApi'

const profileSchema = z.object({
  full_name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email'),
  phone: z.string().optional(),
  bio: z.string().optional(),
})

const passwordSchema = z
  .object({
    currentPassword: z.string().min(1, 'Required'),
    newPassword: z.string().min(8, 'Min 8 characters'),
    confirmPassword: z.string().min(1, 'Required'),
  })
  .refine((d) => d.newPassword === d.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  })

type ProfileForm = z.infer<typeof profileSchema>
type PasswordForm = z.infer<typeof passwordSchema>

export default function ProfilePage() {
  const { user, refreshUser } = useAuth()
  const { success, error } = useToast()
  const [loading, setLoading] = useState(true)
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)

  const profileForm = useForm<ProfileForm>({ resolver: zodResolver(profileSchema) })
  const passwordForm = useForm<PasswordForm>({ resolver: zodResolver(passwordSchema) })

  useEffect(() => {
    getProfile()
      .then((data) => {
        profileForm.reset({
          full_name: data.full_name,
          email: data.email,
          phone: data.phone || '',
          bio: data.bio || '',
        })
        setAvatarUrl(data.avatar)
      })
      .catch(() => error('Failed to load profile'))
      .finally(() => setLoading(false))
  }, [profileForm, error])

  const onProfileSubmit = async (data: ProfileForm) => {
    try {
      const updated = await updateProfile(data)
      setAvatarUrl(updated.avatar)
      await refreshUser()
      success('Profile updated')
    } catch {
      error('Failed to update profile')
    }
  }

  const onPasswordSubmit = async (data: PasswordForm) => {
    try {
      await changePassword(data)
      success('Password changed successfully')
      passwordForm.reset()
    } catch {
      error('Failed to change password')
    }
  }

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    try {
      const updated = await uploadAvatar(file)
      setAvatarUrl(updated.avatar)
      await refreshUser()
      success('Avatar uploaded')
    } catch {
      error('Failed to upload avatar')
    } finally {
      setUploading(false)
      e.target.value = ''
    }
  }

  if (loading) return <PageLoader />

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <PageHeader title="Profile" description="Manage your account information and password." />

      <Card>
        <h2 className="mb-4 text-lg font-semibold text-slate-900 dark:text-white">Avatar</h2>
        <div className="flex items-center gap-4">
          {avatarUrl || user?.avatar ? (
            <img src={avatarUrl || user?.avatar || ''} alt="" className="h-20 w-20 rounded-full object-cover ring-2 ring-indigo-500/30" />
          ) : (
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-indigo-100 text-indigo-600 dark:bg-indigo-950 dark:text-indigo-400">
              <FiUser size={32} />
            </div>
          )}
          <label className="inline-flex cursor-pointer items-center gap-2 rounded-xl bg-slate-100 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700">
            <FiUpload /> {uploading ? 'Uploading...' : 'Change Avatar'}
            <input type="file" accept="image/*" className="hidden" onChange={handleAvatarUpload} disabled={uploading} />
          </label>
        </div>
      </Card>

      <Card>
        <h2 className="mb-4 text-lg font-semibold text-slate-900 dark:text-white">Personal Info</h2>
        <form onSubmit={profileForm.handleSubmit(onProfileSubmit)} className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <FormField label="Full Name" required error={profileForm.formState.errors.full_name?.message}>
              <input className={formInputClass} {...profileForm.register('full_name')} />
            </FormField>
            <FormField label="Email" required error={profileForm.formState.errors.email?.message}>
              <input type="email" className={formInputClass} {...profileForm.register('email')} />
            </FormField>
            <FormField label="Phone">
              <input className={formInputClass} {...profileForm.register('phone')} />
            </FormField>
          </div>
          <FormField label="Bio">
            <textarea className={formTextareaClass} rows={4} {...profileForm.register('bio')} />
          </FormField>
          <Button type="submit" disabled={profileForm.formState.isSubmitting}>
            {profileForm.formState.isSubmitting ? 'Saving...' : 'Save Profile'}
          </Button>
        </form>
      </Card>

      <Card>
        <h2 className="mb-4 text-lg font-semibold text-slate-900 dark:text-white">Change Password</h2>
        <form onSubmit={passwordForm.handleSubmit(onPasswordSubmit)} className="max-w-md space-y-4">
          <FormField label="Current Password" required error={passwordForm.formState.errors.currentPassword?.message}>
            <input type="password" className={formInputClass} {...passwordForm.register('currentPassword')} />
          </FormField>
          <FormField label="New Password" required error={passwordForm.formState.errors.newPassword?.message}>
            <input type="password" className={formInputClass} {...passwordForm.register('newPassword')} />
          </FormField>
          <FormField label="Confirm Password" required error={passwordForm.formState.errors.confirmPassword?.message}>
            <input type="password" className={formInputClass} {...passwordForm.register('confirmPassword')} />
          </FormField>
          <Button type="submit" disabled={passwordForm.formState.isSubmitting}>
            {passwordForm.formState.isSubmitting ? 'Updating...' : 'Change Password'}
          </Button>
        </form>
      </Card>
    </motion.div>
  )
}
