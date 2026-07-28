import axios from 'axios'
import { clearStoredToken, getStoredToken, TOKEN_KEY } from './authService'

const API_BASE = import.meta.env.VITE_API_URL || '/api'

const api = axios.create({
  baseURL: API_BASE,
  headers: { 'Content-Type': 'application/json' },
  withCredentials: true,
})

api.interceptors.request.use((config) => {
  const token = getStoredToken()
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  // Let the browser set multipart boundary — do not force application/json on FormData
  if (config.data instanceof FormData) {
    delete config.headers['Content-Type']
  }
  return config
})

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const path = window.location.pathname
    const isAdminRoute = path.startsWith('/admin')
    const isAccountRoute = path.startsWith('/account')
    const isAuthPage =
      path === '/signin' ||
      path === '/signup' ||
      path === '/forgot-password' ||
      path === '/reset-password'

    if (error.response?.status === 401 && isAdminRoute) {
      clearStoredToken()
      window.location.href = '/signin'
    } else if (error.response?.status === 401 && isAccountRoute && !isAuthPage) {
      clearStoredToken()
      window.location.href = '/signin'
    }

    return Promise.reject(error)
  }
)

export default api

export async function apiGet<T>(url: string, params?: Record<string, unknown>): Promise<T> {
  const { data } = await api.get<{ success: boolean; message: string; data: T }>(url, { params })
  return data.data
}

export async function apiPost<T>(url: string, body?: unknown): Promise<T> {
  const { data } = await api.post<{ success: boolean; message: string; data: T }>(url, body)
  return data.data
}

export async function apiPut<T>(url: string, body?: unknown): Promise<T> {
  const { data } = await api.put<{ success: boolean; message: string; data: T }>(url, body)
  return data.data
}

export async function apiPatch<T>(url: string, body?: unknown): Promise<T> {
  const { data } = await api.patch<{ success: boolean; message: string; data: T }>(url, body)
  return data.data
}

export async function apiDelete<T = void>(url: string, body?: unknown): Promise<T> {
  const { data } = await api.delete<{ success: boolean; message: string; data: T }>(url, {
    data: body,
  })
  return data.data
}

export async function apiUpload<T>(url: string, formData: FormData): Promise<T> {
  const { data } = await api.post<{ success: boolean; message: string; data: T }>(url, formData)
  return data.data
}

export async function apiUploadPut<T>(url: string, formData: FormData): Promise<T> {
  const { data } = await api.put<{ success: boolean; message: string; data: T }>(url, formData)
  return data.data
}

export { TOKEN_KEY }
