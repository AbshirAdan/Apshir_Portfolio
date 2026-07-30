import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import {
  clearStoredToken,
  getMe,
  getStoredToken,
  logout as apiLogout,
  register as apiRegister,
  setStoredToken,
  signIn as apiSignIn,
  type AuthUser,
} from '../services/authService'

type AuthContextType = {
  user: AuthUser | null
  loading: boolean
  isAuthenticated: boolean
  isAdmin: boolean
  isUser: boolean
  signIn: (email: string, password: string, remember?: boolean) => Promise<AuthUser>
  loginWithToken: (token: string, remember?: boolean) => Promise<AuthUser>
  register: (data: {
    full_name: string
    email: string
    password: string
    confirmPassword: string
  }) => Promise<AuthUser>
  logout: () => Promise<void>
  refreshUser: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | null>(null)

/** Role-based post-login destination */
export function getPostLoginPath(user: AuthUser | null | undefined): string {
  if (!user) return '/'
  if (user.role === 'admin') return '/admin/dashboard'
  return '/'
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = getStoredToken()
    if (!token) {
      setLoading(false)
      return
    }

    getMe()
      .then(setUser)
      .catch(() => clearStoredToken())
      .finally(() => setLoading(false))
  }, [])

  const signIn = async (email: string, password: string, remember = false) => {
    const { token, user: userData } = await apiSignIn(email, password, remember)
    setStoredToken(token, remember)
    setUser(userData)
    return userData
  }

  const loginWithToken = async (token: string, remember = true) => {
    setStoredToken(token, remember)
    const userData = await getMe()
    setUser(userData)
    return userData
  }

  const register = async (data: {
    full_name: string
    email: string
    password: string
    confirmPassword: string
  }) => {
    return apiRegister(data)
  }

  const logout = async () => {
    try {
      await apiLogout()
    } catch {
      // Clear session even if server call fails (stateless JWT)
    }
    clearStoredToken()
    setUser(null)
  }

  const refreshUser = async () => {
    const profile = await getMe()
    setUser(profile)
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isAuthenticated: !!user,
        isAdmin: user?.role === 'admin',
        isUser: user?.role === 'user' || user?.role === 'editor',
        signIn,
        loginWithToken,
        register,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
