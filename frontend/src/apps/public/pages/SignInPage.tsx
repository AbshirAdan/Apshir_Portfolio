import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useState, useEffect } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import { LuEye, LuEyeOff, LuLock, LuMail, LuGithub } from 'react-icons/lu'
import { FcGoogle } from 'react-icons/fc'
import { getPostLoginPath, useAuth } from '../../../shared/context/AuthContext'
import { useToast } from '../../../shared/context/ToastContext'
import { Spinner } from '../../../shared/components/ui'

const schema = z.object({
  email: z.string().min(1, 'Email is required').email('Invalid email format'),
  password: z.string().min(1, 'Password is required'),
  remember: z.boolean().optional(),
})

type FormData = z.infer<typeof schema>

export default function SignInPage() {
  const { signIn, loginWithToken } = useAuth()
  const toast = useToast()
  const navigate = useNavigate()
  const location = useLocation()
  
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { remember: true },
  })

  // Handle OAuth Token redirect
  useEffect(() => {
    const params = new URLSearchParams(location.search)
    const token = params.get('token')
    const errorMsg = params.get('error')

    if (token) {
      loginWithToken(token)
        .then((user) => {
          toast.success('OAuth Login successful!')
          navigate(getPostLoginPath(user), { replace: true })
        })
        .catch(() => {
          toast.error('OAuth Login failed')
        })
    }

    if (errorMsg) {
      setError(errorMsg.replace(/_/g, ' '))
      toast.error('OAuth Login failed')
    }
  }, [location, loginWithToken, navigate, toast])

  const onSubmit = async (data: FormData) => {
    setError('')
    try {
      const user = await signIn(data.email, data.password, data.remember)
      toast.success(user.role === 'admin' ? 'Welcome back, Admin!' : 'Welcome back!')
      navigate(getPostLoginPath(user), { replace: true })
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        'Invalid email or password'
      setError(msg)
      toast.error(msg)
    }
  }

  const handleGoogleLogin = () => {
    window.location.href = `${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/auth/google`
  }

  const handleGithubLogin = () => {
    window.location.href = `${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/auth/github`
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
          <h1 className="text-3xl font-bold tracking-tight text-[#111827] dark:text-white">Welcome Back</h1>
          <p className="mt-2 text-sm text-[#6B7280] dark:text-[#CBD5E1]">
            Sign in to continue to your portfolio dashboard
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
                  autoComplete="current-password"
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

            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center gap-2 font-medium text-[#475569] dark:text-[#94A3B8]">
                <input type="checkbox" className="rounded border-[#CBD5E1] dark:border-[#475569] text-blue-600 focus:ring-blue-500" {...register('remember')} />
                Remember me
              </label>
              <Link to="/forgot-password" className="font-semibold text-blue-600 hover:underline dark:text-blue-400">
                Forgot Password?
              </Link>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="flex h-[52px] w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-6 font-semibold text-white shadow-md transition-all hover:scale-[1.02] hover:bg-blue-700 hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-70 disabled:hover:scale-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-[#1E293B]"
            >
              {isSubmitting ? <Spinner size="sm" /> : null}
              {isSubmitting ? 'Signing in…' : 'Sign In'}
            </button>
          </form>

          <div className="my-6 flex items-center">
            <div className="flex-1 border-t border-[#E5E7EB] dark:border-[#334155]"></div>
            <span className="px-4 text-xs font-semibold tracking-wider text-[#94A3B8]">OR CONTINUE WITH</span>
            <div className="flex-1 border-t border-[#E5E7EB] dark:border-[#334155]"></div>
          </div>

          <div className="grid gap-4">
            <button
              onClick={handleGoogleLogin}
              className="flex h-[52px] w-full items-center justify-center gap-3 rounded-xl border border-[#E5E7EB] bg-white px-6 font-semibold text-[#111827] shadow-sm transition-all hover:scale-[1.02] hover:bg-gray-50 hover:shadow-md dark:border-[#334155] dark:bg-white dark:hover:bg-gray-100"
            >
              <FcGoogle size={24} />
              Continue with Google
            </button>
            <button
              onClick={handleGithubLogin}
              className="flex h-[52px] w-full items-center justify-center gap-3 rounded-xl bg-[#24292F] px-6 font-semibold text-white shadow-sm transition-all hover:scale-[1.02] hover:bg-[#1b1f23] hover:shadow-md dark:bg-[#111827] dark:border dark:border-[#334155] dark:hover:bg-[#1f2937]"
            >
              <LuGithub size={24} />
              Continue with GitHub
            </button>
          </div>

          <p className="mt-8 text-center text-sm text-[#6B7280] dark:text-[#94A3B8]">
            Don&apos;t have an account?{' '}
            <Link to="/signup" className="font-semibold text-blue-600 hover:underline dark:text-blue-400">
              Sign Up
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  )
}
