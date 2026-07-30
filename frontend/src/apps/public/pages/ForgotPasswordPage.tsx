import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { LuMail, LuArrowLeft } from 'react-icons/lu'
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
      toast.success('Reset link has been sent to your email.')
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        'Request failed. Please try again.'
      toast.error(msg)
    }
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
          <h1 className="text-3xl font-bold tracking-tight text-[#111827] dark:text-white">Forgot Password?</h1>
          <p className="mt-2 text-sm text-[#6B7280] dark:text-[#CBD5E1]">
            Enter your account email to receive a 15-minute secure reset link
          </p>
        </div>

        <div className="rounded-[24px] border border-[#E5E7EB] bg-white/70 p-8 shadow-2xl backdrop-blur-[12px] dark:border-[#334155] dark:bg-[#1E293B]/70">
          {done ? (
            <div className="space-y-6 text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 dark:bg-emerald-900/40 dark:text-emerald-400">
                <LuMail size={28} />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-[#111827] dark:text-white">Check Your Inbox</h3>
                <p className="mt-2 text-sm text-[#6B7280] dark:text-[#CBD5E1]">
                  Reset link has been sent to your email. (Expires in 15 minutes)
                </p>
              </div>

              {resetLink && (
                <div className="rounded-xl border border-blue-200 bg-blue-50 p-4 text-left dark:border-blue-900/40 dark:bg-blue-900/20">
                  <p className="text-xs font-semibold text-blue-800 dark:text-blue-300">Dev Test Reset Link:</p>
                  <Link
                    to={resetLink.replace(/^https?:\/\/[^/]+/, '')}
                    className="mt-1 block break-all text-xs text-blue-600 hover:underline dark:text-blue-400"
                  >
                    {resetLink}
                  </Link>
                </div>
              )}

              <Link
                to="/signin"
                className="flex h-[52px] w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-6 font-semibold text-white shadow-md transition-all hover:bg-blue-700 hover:shadow-lg"
              >
                Return to Sign In
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
              <div>
                <label className="mb-1.5 block text-sm font-semibold text-[#111827] dark:text-white">Email Address</label>
                <div className="relative">
                  <LuMail className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#94A3B8]" size={20} />
                  <input
                    type="email"
                    autoComplete="email"
                    className="w-full rounded-xl border border-[#E5E7EB] bg-white py-3 pl-11 pr-4 text-[#111827] outline-none transition-colors focus:border-blue-500 focus:ring-1 focus:ring-blue-500 dark:border-[#334155] dark:bg-[#0F172A] dark:text-white dark:focus:border-blue-400"
                    placeholder="you@example.com"
                    {...register('email')}
                  />
                </div>
                {errors.email && <p className="mt-1.5 text-xs font-medium text-red-500">{errors.email.message}</p>}
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="flex h-[52px] w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-6 font-semibold text-white shadow-md transition-all hover:scale-[1.02] hover:bg-blue-700 hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-70 disabled:hover:scale-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-[#1E293B]"
              >
                {isSubmitting ? <Spinner size="sm" /> : null}
                Send Reset Link
              </button>

              <div className="pt-2 text-center">
                <Link to="/signin" className="inline-flex items-center gap-2 text-sm font-semibold text-[#6B7280] hover:text-[#111827] dark:text-[#CBD5E1] dark:hover:text-white">
                  <LuArrowLeft size={16} /> Back to Sign In
                </Link>
              </div>
            </form>
          )}
        </div>
      </motion.div>
    </div>
  )
}
