import { apiGet, apiPost, apiUpload } from './api'
import type {
  Blog,
  Certificate,
  Education,
  Experience,
  PaginatedResponse,
  Project,
  Resume,
  SiteSettings,
  Skill,
  SocialLink,
} from '../types/cms.types'

export type PublicProfile = {
  id: string
  full_name: string
  avatar: string | null
  phone: string | null
  bio: string | null
}

export type PublicStats = {
  projects: number
  skills: number
  certificates: number
  blogs: number
  technologies: number
  yearsLearning: number
  education: number
  experience: number
}

type BackendPaginated<T> = {
  items: T[]
  pagination?: { total: number; page: number; limit: number; totalPages: number }
}

const normalizePaginated = <T>(data: BackendPaginated<T>): PaginatedResponse<T> => ({
  items: data.items ?? [],
  total: data.pagination?.total ?? data.items?.length ?? 0,
  page: data.pagination?.page ?? 1,
  limit: data.pagination?.limit ?? 10,
  totalPages: data.pagination?.totalPages ?? 1,
})

export type ContactInput = {
  full_name: string
  email: string
  subject: string
  message: string
}

export type AnalyticsInput = {
  page: string
  browser?: string
  operating_system?: string
  country?: string
  device?: string
  referrer?: string
}

export const getPublicSettings = () => apiGet<SiteSettings>('/public/settings')
export const getPublicProfile = () => apiGet<PublicProfile>('/public/profile')
export const getPublicStats = () => apiGet<PublicStats>('/public/stats')

export const getPublicProjects = async (query?: Record<string, unknown>) =>
  normalizePaginated(await apiGet<BackendPaginated<Project>>('/public/projects', query))

export const getFeaturedProjects = () => apiGet<Project[]>('/public/projects/featured')
export const getPublicProject = (slug: string) => apiGet<Project>(`/public/projects/${slug}`)

export const getPublicSkills = () => apiGet<Skill[]>('/public/skills')
export const getPublicCertificates = () => apiGet<Certificate[]>('/public/certificates')
export const getPublicEducation = () => apiGet<Education[]>('/public/education')
export const getPublicExperience = () => apiGet<Experience[]>('/public/experience')

export const getPublicBlogs = async (query?: Record<string, unknown>) =>
  normalizePaginated(await apiGet<BackendPaginated<Blog>>('/public/blogs', query))

export const getPublicBlog = (slug: string) => apiGet<Blog>(`/public/blogs/${slug}`)

export const getPublicResume = () => apiGet<Resume | null>('/public/resume')
export const getPublicSocialLinks = () => apiGet<SocialLink[]>('/public/social-links')

export const submitContact = (
  data: ContactInput,
  files: File[] = []
) => {
  const formData = new FormData()
  formData.append('full_name', data.full_name)
  formData.append('email', data.email)
  formData.append('subject', data.subject)
  formData.append('message', data.message)
  files.forEach((f) => formData.append('attachments', f))
  return apiUpload('/public/contact', formData)
}
export const trackVisit = (data: AnalyticsInput) => apiPost('/public/analytics', data)
