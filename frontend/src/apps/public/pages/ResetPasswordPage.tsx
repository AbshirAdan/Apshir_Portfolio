import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { FiEye, FiEyeOff, FiLock } from 'react-icons/fi'
import { resetPassword } from '../../../shared/services/authService'
import { useToast } from '../../../shared/context/ToastContext'
import { Spinner } from '../../../shared/components/ui'

const passwordRule =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#^()[\]{}|\\:;"'<>,.?/~`+=_-]).+$/

const schema = z
  .object({
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

export default function ResetPasswordPage() {
  const [params] = useSearchParams()
  const token = params.get('token') || ''
  const toast = useToast()
  const navigate = useNavigate()
  const [show, setShow] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({ resolver: zodResolver(schema) })

  const onSubmit = async (data: FormData) => {
    if (!token) {
      toast.error('Missing reset token')
      return
    }
    try {
      await resetPassword({
        token,
        newPassword: data.newPassword,
        confirmPassword: data.confirmPassword,
      })
      toast.success('Password updated. Please sign in.')
      navigate('/signin', { replace: true })
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        'Reset failed'
      toast.error(msg)
    }
  }

  if (!token) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center px-4">
        <div className="rounded-2xl border border-brand-border bg-brand-card p-8 text-center">
          <p className="text-brand-text">Invalid or missing reset token.</p>
          <Link to="/forgot-password" className="mt-4 inline-block text-brand-primary hover:underline">
            Request a new link
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="relative flex min-h-[calc(100vh-4rem)] items-center justify-center px-4 py-16">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md rounded-3xl border border-brand-border/80 bg-brand-card/70 p-8 shadow-2xl backdrop-blur-xl"
      >
        <h1 className="text-2xl font-bold text-brand-text">Create New Password</h1>
        <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-4" noValidate>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-brand-text">New Password</label>
            <div className="relative">
              <FiLock className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-brand-muted" />
              <input
                type={show ? 'text' : 'password'}
                className="theme-input w-full !pl-10 !pr-11"
                {...register('newPassword')}
              />
              <button
                type="button"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-brand-muted"
                onClick={() => setShow((v) => !v)}
              >
                {show ? <FiEyeOff size={18} /> : <FiEye size={18} />}
              </button>
            </div>
            {errors.newPassword && (
              <p className="mt-1 text-xs text-red-400">{errors.newPassword.message}</p>
            )}
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-brand-text">Confirm Password</label>
            <input type="password" className="theme-input w-full" {...register('confirmPassword')} />
            {errors.confirmPassword && (
              <p className="mt-1 text-xs text-red-400">{errors.confirmPassword.message}</p>
            )}
          </div>
          <button
            type="submit"
            disabled={isSubmitting}
            className="btn-primary btn-premium flex w-full items-center justify-center gap-2 !rounded-full !py-3"
          >
            {isSubmitting ? <Spinner size="sm" /> : null}
            Update Password
          </button>
        </form>
      </motion.div>
    </div>
  )
}
