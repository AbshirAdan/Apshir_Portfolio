import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { FiMail } from 'react-icons/fi'
import { forgotPassword } from '../../../shared/services/authService'
import { useToast } from '../../../shared/context/ToastContext'
import { Spinner } from '../../../shared/components/ui'

const schema = z.object({
  email: z.string().min(1, 'Email is required').email('Invalid email format'),
})

type FormData = z.infer<typeof schema>

export default function ForgotPasswordPage() {
  const toast = useToast()
  const [resetLink, setResetLink] = useState<string | null>(null)
  const [done, setDone] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({ resolver: zodResolver(schema) })

  const onSubmit = async (data: FormData) => {
    try {
      const result = await forgotPassword(data.email)
      setDone(true)
      if (result.resetLink) setResetLink(result.resetLink)
      toast.success('If that email exists, a reset link was generated.')
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        'Request failed'
      toast.error(msg)
    }
  }

  return (
    <div className="relative flex min-h-[calc(100vh-4rem)] items-center justify-center px-4 py-16">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative w-full max-w-md rounded-3xl border border-brand-border/80 bg-brand-card/70 p-8 shadow-2xl backdrop-blur-xl"
      >
        <h1 className="text-2xl font-bold text-brand-text">Forgot Password</h1>
        <p className="mt-2 text-sm text-brand-muted">
          Enter your email and we&apos;ll generate a password reset link.
        </p>

        {done ? (
          <div className="mt-6 space-y-4">
            <p className="rounded-xl border border-green-500/30 bg-green-500/10 px-4 py-3 text-sm text-green-400">
              Check your email for a reset link. (In development, the link is shown below.)
            </p>
            {resetLink && (
              <Link
                to={resetLink.replace(/^https?:\/\/[^/]+/, '')}
                className="block break-all text-sm font-medium text-brand-primary hover:underline"
              >
                {resetLink}
              </Link>
            )}
            <Link to="/signin" className="btn-primary btn-premium mt-2 inline-flex !rounded-full">
              Back to Sign In
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-4" noValidate>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-brand-text">Email</label>
              <div className="relative">
                <FiMail className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-brand-muted" />
                <input type="email" className="theme-input w-full !pl-10" {...register('email')} />
              </div>
              {errors.email && <p className="mt-1 text-xs text-red-400">{errors.email.message}</p>}
            </div>
            <button
              type="submit"
              disabled={isSubmitting}
              className="btn-primary btn-premium flex w-full items-center justify-center gap-2 !rounded-full !py-3"
            >
              {isSubmitting ? <Spinner size="sm" /> : null}
              Send Reset Link
            </button>
          </form>
        )}
      </motion.div>
    </div>
  )
}
