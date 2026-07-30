import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { LuEye, LuEyeOff, LuLock, LuMail, LuUser } from 'react-icons/lu'
import { useAuth } from '../../../shared/context/AuthContext'
import { useToast } from '../../../shared/context/ToastContext'
import { Spinner } from '../../../shared/components/ui'

const schema = z
  .object({
    full_name: z.string().min(1, 'Full name is required'),
    email: z.string().min(1, 'Email is required').email('Invalid email format'),
    password: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .regex(/[A-Z]/, 'Must contain one uppercase letter')
      .regex(/[a-z]/, 'Must contain one lowercase letter')
      .regex(/[0-9]/, 'Must contain one number')
      .regex(/[^A-Za-z0-9]/, 'Must contain one special character'),
    confirmPassword: z.string().min(1, 'Please confirm your password'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  })

type FormData = z.infer<typeof schema>

export default function SignUpPage() {
  const { register: authRegister } = useAuth()
  const toast = useToast()
  const navigate = useNavigate()
  
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
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
      await authRegister({
        full_name: data.full_name,
        email: data.email,
        password: data.password,
        confirmPassword: data.confirmPassword,
      })
      toast.success('Account created successfully! Please sign in.')
      navigate('/signin', { replace: true })
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        'Registration failed. Please try again.'
      setError(msg)
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
          <h1 className="text-3xl font-bold tracking-tight text-[#111827] dark:text-white">Create an Account</h1>
          <p className="mt-2 text-sm text-[#6B7280] dark:text-[#CBD5E1]">
            Join the platform to interact and manage your settings
          </p>
        </div>

        <div className="rounded-[24px] border border-[#E5E7EB] bg-white/70 p-8 shadow-2xl backdrop-blur-[12px] dark:border-[#334155] dark:bg-[#1E293B]/70">
          {error && (
            <div className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-800 dark:border-red-900/50 dark:bg-red-900/20 dark:text-red-300">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
            <div>
              <label className="mb-1.5 block text-sm font-semibold text-[#111827] dark:text-white">Full Name</label>
              <div className="relative">
                <LuUser className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#94A3B8]" size={20} />
                <input
                  type="text"
                  autoComplete="name"
                  className="w-full rounded-xl border border-[#E5E7EB] bg-white py-3 pl-11 pr-4 text-[#111827] outline-none transition-colors focus:border-blue-500 focus:ring-1 focus:ring-blue-500 dark:border-[#334155] dark:bg-[#0F172A] dark:text-white dark:focus:border-blue-400"
                  placeholder="John Doe"
                  {...register('full_name')}
                />
              </div>
              {errors.full_name && <p className="mt-1.5 text-xs font-medium text-red-500">{errors.full_name.message}</p>}
            </div>

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

            <div>
              <label className="mb-1.5 block text-sm font-semibold text-[#111827] dark:text-white">Password</label>
              <div className="relative">
                <LuLock className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#94A3B8]" size={20} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  className="w-full rounded-xl border border-[#E5E7EB] bg-white py-3 pl-11 pr-12 text-[#111827] outline-none transition-colors focus:border-blue-500 focus:ring-1 focus:ring-blue-500 dark:border-[#334155] dark:bg-[#0F172A] dark:text-white dark:focus:border-blue-400"
                  placeholder="••••••••"
                  {...register('password')}
                />
                <button
                  type="button"
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-[#94A3B8] transition-colors hover:text-[#111827] dark:hover:text-white"
                  onClick={() => setShowPassword((v) => !v)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <LuEyeOff size={20} /> : <LuEye size={20} />}
                </button>
              </div>
              {errors.password && <p className="mt-1.5 text-xs font-medium text-red-500">{errors.password.message}</p>}
            </div>
            
            <div>
              <label className="mb-1.5 block text-sm font-semibold text-[#111827] dark:text-white">Confirm Password</label>
              <div className="relative">
                <LuLock className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#94A3B8]" size={20} />
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  className="w-full rounded-xl border border-[#E5E7EB] bg-white py-3 pl-11 pr-12 text-[#111827] outline-none transition-colors focus:border-blue-500 focus:ring-1 focus:ring-blue-500 dark:border-[#334155] dark:bg-[#0F172A] dark:text-white dark:focus:border-blue-400"
                  placeholder="••••••••"
                  {...register('confirmPassword')}
                />
                <button
                  type="button"
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-[#94A3B8] transition-colors hover:text-[#111827] dark:hover:text-white"
                  onClick={() => setShowConfirmPassword((v) => !v)}
                  aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                >
                  {showConfirmPassword ? <LuEyeOff size={20} /> : <LuEye size={20} />}
                </button>
              </div>
              {errors.confirmPassword && <p className="mt-1.5 text-xs font-medium text-red-500">{errors.confirmPassword.message}</p>}
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="mt-2 flex h-[52px] w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-6 font-semibold text-white shadow-md transition-all hover:scale-[1.02] hover:bg-blue-700 hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-70 disabled:hover:scale-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-[#1E293B]"
            >
              {isSubmitting ? <Spinner size="sm" /> : null}
              {isSubmitting ? 'Creating Account…' : 'Sign Up'}
            </button>
          </form>

          <p className="mt-8 text-center text-sm text-[#6B7280] dark:text-[#94A3B8]">
            Already have an account?{' '}
            <Link to="/signin" className="font-semibold text-blue-600 hover:underline dark:text-blue-400">
              Sign In
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  )
}
