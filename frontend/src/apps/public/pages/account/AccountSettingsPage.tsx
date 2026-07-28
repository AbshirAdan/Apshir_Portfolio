import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { motion } from 'framer-motion'
import { changeUserPassword } from '../../../../shared/services/authService'
import { useToast } from '../../../../shared/context/ToastContext'
import { Spinner } from '../../../../shared/components/ui'

const passwordRule =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#^()[\]{}|\\:;"'<>,.?/~`+=_-]).+$/

const schema = z
  .object({
    currentPassword: z.string().min(1, 'Current password is required'),
    newPassword: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .regex(passwordRule, 'Include uppercase, lowercase, number, and special character'),
    confirmPassword: z.string().min(1, 'Confirm password is required'),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  })

type FormData = z.infer<typeof schema>

export default function AccountSettingsPage() {
  const toast = useToast()
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({ resolver: zodResolver(schema) })

  const onSubmit = async (data: FormData) => {
    try {
      await changeUserPassword(data)
      reset()
      toast.success('Password changed successfully')
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        'Could not change password'
      toast.error(msg)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-lg rounded-3xl border border-brand-border bg-brand-card/70 p-8 backdrop-blur-xl"
    >
      <h2 className="text-xl font-semibold text-brand-text">My Settings</h2>
      <p className="mt-1 text-sm text-brand-muted">Change your password</p>

      <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-4" noValidate>
        <div>
          <label className="mb-1 block text-sm font-medium">Current Password</label>
          <input type="password" className="theme-input w-full" {...register('currentPassword')} />
          {errors.currentPassword && (
            <p className="mt-1 text-xs text-red-400">{errors.currentPassword.message}</p>
          )}
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">New Password</label>
          <input type="password" className="theme-input w-full" {...register('newPassword')} />
          {errors.newPassword && (
            <p className="mt-1 text-xs text-red-400">{errors.newPassword.message}</p>
          )}
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">Confirm Password</label>
          <input type="password" className="theme-input w-full" {...register('confirmPassword')} />
          {errors.confirmPassword && (
            <p className="mt-1 text-xs text-red-400">{errors.confirmPassword.message}</p>
          )}
        </div>
        <button
          type="submit"
          disabled={isSubmitting}
          className="btn-primary btn-premium inline-flex items-center gap-2 !rounded-full"
        >
          {isSubmitting ? <Spinner size="sm" /> : null}
          Update Password
        </button>
      </form>
    </motion.div>
  )
}
