import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { LuEye, LuEyeOff, LuLock, LuShieldAlert } from 'react-icons/lu'
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
  
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({ resolver: zodResolver(schema) })

  const onSubmit = async (data: FormData) => {
    if (!token) {
      toast.error('Reset link has expired or is invalid.')
      return
    }
    try {
      await resetPassword({
        token,
        newPassword: data.newPassword,
        confirmPassword: data.confirmPassword,
      })
      toast.success('Password changed successfully.')
      navigate('/signin', { replace: true })
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        'Reset link has expired.'
      toast.error(msg)
    }
  }

  if (!token) {
    return (
      <div className="relative flex min-h-[calc(100vh-4rem)] items-center justify-center overflow-hidden px-4 py-16 bg-[#F8FAFC] dark:bg-[#0F172A]">
        <div className="w-full max-w-md rounded-[24px] border border-red-200 bg-white/70 p-8 shadow-2xl backdrop-blur-[12px] dark:border-red-900/50 dark:bg-[#1E293B]/70 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-red-100 text-red-600 dark:bg-red-900/40 dark:text-red-400">
            <LuShieldAlert size={28} />
          </div>
          <h2 className="text-xl font-bold text-[#111827] dark:text-white">Invalid or Expired Token</h2>
          <p className="mt-2 text-sm text-[#6B7280] dark:text-[#CBD5E1]">
            Your password reset link is missing or has expired after 15 minutes.
          </p>
          <Link
            to="/forgot-password"
            className="mt-6 inline-flex h-[48px] items-center justify-center rounded-xl bg-blue-600 px-6 font-semibold text-white shadow-md transition-all hover:bg-blue-700"
          >
            Request New Reset Link
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="relative flex min-h-[calc(100vh-4rem)] items-center justify-center overflow-hidden px-4 py-16 bg-[#F8FAFC] dark:bg-[#0F172A]">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-24 top-10 h-80 w-80 rounded-full bg-blue-500/20 blur-[100px]" />
        <div className="absolute -right-16 bottom-10 h-72 w-72 rounded-full bg-purple-500/15 blur-[100px]" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: 'easeOut' }}
        className="relative w-full max-w-md"
      >
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold tracking-tight text-[#111827] dark:text-white">Reset Password</h1>
          <p className="mt-2 text-sm text-[#6B7280] dark:text-[#CBD5E1]">
            Enter your new secure password below
          </p>
        </div>

        <div className="rounded-[24px] border border-[#E5E7EB] bg-white/70 p-8 shadow-2xl backdrop-blur-[12px] dark:border-[#334155] dark:bg-[#1E293B]/70">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
            <div>
              <label className="mb-1.5 block text-sm font-semibold text-[#111827] dark:text-white">New Password</label>
              <div className="relative">
                <LuLock className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#94A3B8]" size={20} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  className="w-full rounded-xl border border-[#E5E7EB] bg-white py-3 pl-11 pr-12 text-[#111827] outline-none transition-colors focus:border-blue-500 focus:ring-1 focus:ring-blue-500 dark:border-[#334155] dark:bg-[#0F172A] dark:text-white dark:focus:border-blue-400"
                  placeholder="••••••••"
                  {...register('newPassword')}
                />
                <button
                  type="button"
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-[#94A3B8] transition-colors hover:text-[#111827] dark:hover:text-white"
                  onClick={() => setShowPassword((v) => !v)}
                >
                  {showPassword ? <LuEyeOff size={20} /> : <LuEye size={20} />}
                </button>
              </div>
              {errors.newPassword && <p className="mt-1.5 text-xs font-medium text-red-500">{errors.newPassword.message}</p>}
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-semibold text-[#111827] dark:text-white">Confirm Password</label>
              <div className="relative">
                <LuLock className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#94A3B8]" size={20} />
                <input
                  type={showConfirm ? 'text' : 'password'}
                  className="w-full rounded-xl border border-[#E5E7EB] bg-white py-3 pl-11 pr-12 text-[#111827] outline-none transition-colors focus:border-blue-500 focus:ring-1 focus:ring-blue-500 dark:border-[#334155] dark:bg-[#0F172A] dark:text-white dark:focus:border-blue-400"
                  placeholder="••••••••"
                  {...register('confirmPassword')}
                />
                <button
                  type="button"
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-[#94A3B8] transition-colors hover:text-[#111827] dark:hover:text-white"
                  onClick={() => setShowConfirm((v) => !v)}
                >
                  {showConfirm ? <LuEyeOff size={20} /> : <LuEye size={20} />}
                </button>
              </div>
              {errors.confirmPassword && <p className="mt-1.5 text-xs font-medium text-red-500">{errors.confirmPassword.message}</p>}
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="flex h-[52px] w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-6 font-semibold text-white shadow-md transition-all hover:scale-[1.02] hover:bg-blue-700 hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-70 disabled:hover:scale-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-[#1E293B]"
            >
              {isSubmitting ? <Spinner size="sm" /> : null}
              Update Password
            </button>
          </form>
        </div>
      </motion.div>
    </div>
  )
}
