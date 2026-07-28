import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { FiEye, FiEyeOff, FiLock, FiMail, FiUser } from 'react-icons/fi'
import { useAuth } from '../../../shared/context/AuthContext'
import { useToast } from '../../../shared/context/ToastContext'
import { Spinner } from '../../../shared/components/ui'

const passwordRule =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#^()[\]{}|\\:;"'<>,.?/~`+=_-]).+$/

const schema = z
  .object({
    full_name: z.string().min(2, 'Full name is required'),
    email: z.string().min(1, 'Email is required').email('Invalid email format'),
    password: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .regex(passwordRule, 'Include uppercase, lowercase, number, and special character'),
    confirmPassword: z.string().min(1, 'Confirm password is required'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  })

type FormData = z.infer<typeof schema>

export default function SignUpPage() {
  const { register: registerUser } = useAuth()
  const toast = useToast()
  const navigate = useNavigate()
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [error, setError] = useState('')

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
  })

  const onSubmit = async (data: FormData) => {
    setError('')
    try {
      await registerUser({
        full_name: data.full_name,
        email: data.email,
        password: data.password,
        confirmPassword: data.confirmPassword,
      })
      toast.success('Account created! Please sign in.')
      navigate('/signin', { replace: true })
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        'Registration failed'
      setError(msg)
      toast.error(msg)
    }
  }

  return (
    <div className="relative flex min-h-[calc(100vh-4rem)] items-center justify-center overflow-hidden px-4 py-16">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -right-24 top-8 h-80 w-80 rounded-full bg-brand-primary/20 blur-3xl" />
        <div className="absolute -left-16 bottom-8 h-72 w-72 rounded-full bg-emerald-500/10 blur-3xl" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative w-full max-w-md"
      >
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold tracking-tight text-brand-text">Create Account</h1>
          <p className="mt-2 text-sm text-brand-muted">Optional — browse the portfolio without an account</p>
        </div>

        <div className="rounded-3xl border border-brand-border/80 bg-brand-card/70 p-8 shadow-2xl backdrop-blur-xl">
          {error && (
            <div className="mb-5 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
            <Field icon={<FiUser />} label="Full Name" error={errors.full_name?.message}>
              <input className="theme-input w-full !pl-10" placeholder="Jane Doe" {...register('full_name')} />
            </Field>

            <Field icon={<FiMail />} label="Email Address" error={errors.email?.message}>
              <input
                type="email"
                autoComplete="email"
                className="theme-input w-full !pl-10"
                placeholder="you@example.com"
                {...register('email')}
              />
            </Field>

            <Field icon={<FiLock />} label="Password" error={errors.password?.message}>
              <input
                type={showPassword ? 'text' : 'password'}
                autoComplete="new-password"
                className="theme-input w-full !pl-10 !pr-11"
                {...register('password')}
              />
              <button
                type="button"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-brand-muted"
                onClick={() => setShowPassword((v) => !v)}
              >
                {showPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
              </button>
            </Field>

            <Field icon={<FiLock />} label="Confirm Password" error={errors.confirmPassword?.message}>
              <input
                type={showConfirm ? 'text' : 'password'}
                autoComplete="new-password"
                className="theme-input w-full !pl-10 !pr-11"
                {...register('confirmPassword')}
              />
              <button
                type="button"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-brand-muted"
                onClick={() => setShowConfirm((v) => !v)}
              >
                {showConfirm ? <FiEyeOff size={18} /> : <FiEye size={18} />}
              </button>
            </Field>

            <button
              type="submit"
              disabled={isSubmitting}
              className="btn-primary btn-premium mt-2 flex w-full items-center justify-center gap-2 !rounded-full !py-3"
            >
              {isSubmitting ? <Spinner size="sm" /> : null}
              {isSubmitting ? 'Creating account…' : 'Sign Up'}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-brand-muted">
            Already have an account?{' '}
            <Link to="/signin" className="font-semibold text-brand-primary hover:underline">
              Sign In
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  )
}

function Field({
  label,
  error,
  icon,
  children,
}: {
  label: string
  error?: string
  icon: React.ReactNode
  children: React.ReactNode
}) {
  return (
    <div>
      <label className="mb-1.5 block text-sm font-medium text-brand-text">{label}</label>
      <div className="relative">
        <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-brand-muted">
          {icon}
        </span>
        {children}
      </div>
      {error && <p className="mt-1 text-xs text-red-400">{error}</p>}
    </div>
  )
}
