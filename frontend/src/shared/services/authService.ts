import { apiGet, apiPost, apiPut, apiUploadPut } from './api'

export type AuthUser = {
  id: string
  full_name: string
  email: string
  role: string
  avatar: string | null
  phone: string | null
  bio: string | null
  career_objective: string | null
  location: string | null
  city: string | null
  country: string | null
  google_map_link: string | null
  google_map_embed: string | null
  status?: string
  created_at: string
  updated_at: string
  last_login?: string | null
}

export type LoginResponse = {
  token: string
  user: AuthUser
}

const TOKEN_KEY = 'portfolio_token'
const REMEMBER_KEY = 'portfolio_remember'

export const getStoredToken = () =>
  localStorage.getItem(TOKEN_KEY) || sessionStorage.getItem(TOKEN_KEY)

export const setStoredToken = (token: string, remember: boolean) => {
  localStorage.removeItem(TOKEN_KEY)
  sessionStorage.removeItem(TOKEN_KEY)
  if (remember) {
    localStorage.setItem(TOKEN_KEY, token)
    localStorage.setItem(REMEMBER_KEY, 'true')
  } else {
    sessionStorage.setItem(TOKEN_KEY, token)
    localStorage.removeItem(REMEMBER_KEY)
  }
}

export const clearStoredToken = () => {
  localStorage.removeItem(TOKEN_KEY)
  sessionStorage.removeItem(TOKEN_KEY)
  localStorage.removeItem(REMEMBER_KEY)
}

/** Unified sign-in for Admin and User. */
export const signIn = (email: string, password: string, remember = false) =>
  apiPost<LoginResponse>('/auth/signin', { email, password, remember })

export const register = (body: {
  full_name: string
  email: string
  password: string
  confirmPassword: string
}) => apiPost<AuthUser>('/auth/register', body)

export const logout = () => apiPost<null>('/auth/logout')

export const getMe = () => apiGet<AuthUser>('/auth/me')

export const getProfile = () => apiGet<AuthUser>('/auth/profile')

export const changePassword = (data: {
  currentPassword: string
  newPassword: string
  confirmPassword: string
}) => apiPut<AuthUser>('/auth/change-password', data)

export const updateProfile = (data: Partial<Pick<AuthUser, 'full_name' | 'email' | 'phone' | 'bio' | 'career_objective' | 'location' | 'city' | 'country' | 'google_map_link' | 'google_map_embed'>>) =>
  apiPut<AuthUser>('/profile', data)

export const uploadAvatar = (file: File) => {
  const formData = new FormData()
  formData.append('avatar', file)
  return apiUploadPut<AuthUser>('/profile/avatar', formData)
}

export const updateUserProfile = (
  data: Partial<Pick<AuthUser, 'full_name' | 'email' | 'phone' | 'bio' | 'career_objective' | 'location' | 'city' | 'country' | 'google_map_link' | 'google_map_embed'>>
) => apiPut<AuthUser>('/user/profile', data)

export const uploadUserAvatar = (file: File) => {
  const formData = new FormData()
  formData.append('avatar', file)
  return apiUploadPut<AuthUser>('/user/avatar', formData)
}

export const changeUserPassword = (data: {
  currentPassword: string
  newPassword: string
  confirmPassword: string
}) => apiPut<AuthUser>('/user/password', data)

export const forgotPassword = (email: string) =>
  apiPost<{ message: string; resetLink?: string; resetToken?: string }>('/auth/forgot-password', {
    email,
  })

export const resetPassword = (data: {
  token: string
  newPassword: string
  confirmPassword: string
}) => apiPost<null>('/auth/reset-password', data)

export const refreshToken = () => apiPost<{ token: string; user: AuthUser }>('/auth/refresh-token')

export { TOKEN_KEY }
