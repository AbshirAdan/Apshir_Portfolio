import { apiDelete, apiGet, apiPatch, apiPost, apiPut, apiUpload, apiUploadPut } from './api'
import {
  changePassword,
  getProfile,
  updateProfile,
  uploadAvatar,
  type AuthUser,
} from './authService'
import type {
  AppNotification,
  Blog,
  Certificate,
  ChangePasswordInput,
  ChatMessage,
  Conversation,
  ConversationDetail,
  DashboardStats,
  Education,
  Experience,
  ListQuery,
  ManagedUser,
  MessageStats,
  PaginatedResponse,
  ProfileUpdate,
  Project,
  ProjectImage,
  RecentActivity,
  Resume,
  SiteSettings,
  Skill,
  SocialLink,
  UserManagementStats,
  UsersListQuery,
} from '../types/cms.types'

type BackendPaginated<T> = {
  items: T[]
  pagination?: {
    total: number
    page: number
    limit: number
    totalPages: number
  }
}

const normalizePaginated = <T>(data: BackendPaginated<T>): PaginatedResponse<T> => ({
  items: data.items ?? [],
  total: data.pagination?.total ?? data.items?.length ?? 0,
  page: data.pagination?.page ?? 1,
  limit: data.pagination?.limit ?? 10,
  totalPages: data.pagination?.totalPages ?? 1,
})

export { getProfile, updateProfile, uploadAvatar, changePassword }
export type { AuthUser, ProfileUpdate, ChangePasswordInput }

// Dashboard
export const getDashboardStats = () => apiGet<DashboardStats>('/dashboard/stats')
export const getRecentActivity = () => apiGet<RecentActivity[]>('/dashboard/activity')

// Projects
export const getProjects = async (query?: ListQuery) =>
  normalizePaginated(await apiGet<BackendPaginated<Project>>('/projects', query as Record<string, unknown>))

export const getProject = (id: string) => apiGet<Project>(`/projects/${id}`)

const buildProjectFormData = (data: Partial<Project>, thumbnail?: File | null) => {
  const formData = new FormData()
  Object.entries(data).forEach(([key, value]) => {
    if (value === undefined || value === null) return
    if (key === 'technologies' && Array.isArray(value)) {
      formData.append(key, JSON.stringify(value))
      return
    }
    formData.append(key, String(value))
  })
  if (thumbnail) formData.append('thumbnail', thumbnail)
  return formData
}

export const createProject = (data: Partial<Project>, thumbnail?: File | null) => {
  if (thumbnail) {
    return apiUpload<Project>('/projects', buildProjectFormData(data, thumbnail))
  }
  return apiPost<Project>('/projects', data)
}

export const updateProject = (id: string, data: Partial<Project>, thumbnail?: File | null) => {
  if (thumbnail) {
    return apiUploadPut<Project>(`/projects/${id}`, buildProjectFormData(data, thumbnail))
  }
  return apiPut<Project>(`/projects/${id}`, data)
}

export const deleteProject = (id: string) => apiDelete(`/projects/${id}`)

export const uploadProjectImages = (id: string, files: File[]) => {
  const formData = new FormData()
  files.forEach((file) => formData.append('images', file))
  return apiUpload<ProjectImage[]>(`/projects/${id}/images`, formData)
}

export const deleteProjectImage = (projectId: string, imageId: string) =>
  apiDelete(`/projects/${projectId}/images/${imageId}`)

// Skills
export const getSkills = () => apiGet<Skill[]>('/skills')
export const createSkill = (data: Partial<Skill>) => apiPost<Skill>('/skills', data)
export const updateSkill = (id: string, data: Partial<Skill>) => apiPut<Skill>(`/skills/${id}`, data)
export const deleteSkill = (id: string) => apiDelete(`/skills/${id}`)

// Certificates
export const getCertificates = () => apiGet<Certificate[]>('/certificates')

const buildCertificateFormData = (data: Partial<Certificate>, imageFile?: File | null) => {
  const formData = new FormData()
  Object.entries(data).forEach(([key, value]) => {
    if (value === undefined || value === null || key === 'image') return
    formData.append(key, String(value))
  })
  if (imageFile) formData.append('image', imageFile)
  return formData
}

export const createCertificate = (data: Partial<Certificate>, imageFile?: File | null) => {
  if (imageFile) {
    return apiUpload<Certificate>('/certificates', buildCertificateFormData(data, imageFile))
  }
  return apiPost<Certificate>('/certificates', data)
}

export const updateCertificate = (id: string, data: Partial<Certificate>, imageFile?: File | null) => {
  if (imageFile) {
    return apiUploadPut<Certificate>(`/certificates/${id}`, buildCertificateFormData(data, imageFile))
  }
  return apiPut<Certificate>(`/certificates/${id}`, data)
}
export const deleteCertificate = (id: string) => apiDelete(`/certificates/${id}`)

// Education
export const getEducation = () => apiGet<Education[]>('/education')
export const createEducation = (data: Partial<Education>) =>
  apiPost<Education>('/education', data)
export const updateEducation = (id: string, data: Partial<Education>) =>
  apiPut<Education>(`/education/${id}`, data)
export const deleteEducation = (id: string) => apiDelete(`/education/${id}`)

// Experience
export const getExperience = () => apiGet<Experience[]>('/experience')
export const createExperience = (data: Partial<Experience>) =>
  apiPost<Experience>('/experience', data)
export const updateExperience = (id: string, data: Partial<Experience>) =>
  apiPut<Experience>(`/experience/${id}`, data)
export const deleteExperience = (id: string) => apiDelete(`/experience/${id}`)

// Blogs
export const getBlogs = async (query?: ListQuery) =>
  normalizePaginated(await apiGet<BackendPaginated<Blog>>('/blogs', query as Record<string, unknown>))

export const getBlog = (id: string) => apiGet<Blog>(`/blogs/${id}`)

const buildBlogFormData = (data: Partial<Blog>, coverFile?: File | null) => {
  const formData = new FormData()
  Object.entries(data).forEach(([key, value]) => {
    if (value === undefined || value === null || key === 'cover_image') return
    if (key === 'tags' && Array.isArray(value)) {
      formData.append(key, JSON.stringify(value))
      return
    }
    if (key === 'published' || key === 'featured' || key === 'reading_time') {
      formData.append(key, String(value))
      return
    }
    formData.append(key, String(value))
  })
  if (coverFile) formData.append('cover_image', coverFile)
  return formData
}

export const createBlog = (data: Partial<Blog>, coverFile?: File | null) => {
  if (coverFile) {
    return apiUpload<Blog>('/blogs', buildBlogFormData(data, coverFile))
  }
  return apiPost<Blog>('/blogs', data)
}

export const updateBlog = (id: string, data: Partial<Blog>, coverFile?: File | null) => {
  if (coverFile) {
    return apiUploadPut<Blog>(`/blogs/${id}`, buildBlogFormData(data, coverFile))
  }
  return apiPut<Blog>(`/blogs/${id}`, data)
}

export const deleteBlog = (id: string) => apiDelete(`/blogs/${id}`)

// Communication Center — conversations
export const getAdminConversations = async (
  query?: ListQuery & { status?: string; sort?: string }
) => {
  const data = await apiGet<
    BackendPaginated<Conversation> & { stats?: MessageStats }
  >('/admin/conversations', query as Record<string, unknown>)
  return { ...normalizePaginated(data), stats: data.stats }
}

export const getAdminConversation = (id: string) =>
  apiGet<ConversationDetail>(`/admin/conversations/${id}`)

export const sendAdminChatMessage = (id: string, body: string, files: File[] = []) => {
  const formData = new FormData()
  formData.append('body', body)
  files.forEach((f) => formData.append('attachments', f))
  return apiUpload<{ conversation: Conversation; message: ChatMessage }>(
    `/admin/conversations/${id}/messages`,
    formData
  )
}

export const archiveConversation = (id: string) =>
  apiPatch<Conversation>(`/admin/conversations/${id}/archive`)
export const pinConversation = (id: string) =>
  apiPatch<Conversation>(`/admin/conversations/${id}/pin`)
export const unpinConversation = (id: string) =>
  apiPatch<Conversation>(`/admin/conversations/${id}/unpin`)
export const markConversationUnread = (id: string) =>
  apiPatch<Conversation>(`/admin/conversations/${id}/unread`)
export const deleteConversation = (id: string) => apiDelete(`/admin/conversations/${id}`)

export const getUserConversations = async (query?: ListQuery & { status?: string; sort?: string }) => {
  const data = await apiGet<BackendPaginated<Conversation>>(
    '/user/conversations',
    query as Record<string, unknown>
  )
  return normalizePaginated(data)
}

export const getUserConversation = (id: string) =>
  apiGet<ConversationDetail>(`/user/conversations/${id}`)

export const sendUserChatMessage = (id: string, body: string, files: File[] = []) => {
  const formData = new FormData()
  formData.append('body', body)
  files.forEach((f) => formData.append('attachments', f))
  return apiUpload<{ conversation: Conversation; message: ChatMessage }>(
    `/user/conversations/${id}/messages`,
    formData
  )
}

export const deleteUserConversation = (id: string) => apiDelete(`/user/conversations/${id}`)

export const editChatMessage = (messageId: string, body: string) =>
  apiPatch<ChatMessage>(`/messages/${messageId}`, { body })
export const deleteChatMessage = (messageId: string) =>
  apiDelete<ChatMessage>(`/messages/${messageId}`)

export const addMessageReaction = (messageId: string, reaction: string) =>
  apiPost<ChatMessage>(`/messages/${messageId}/reaction`, { reaction })

export const removeMessageReaction = (messageId: string, reaction: string) =>
  apiDelete<ChatMessage>(`/messages/${messageId}/reaction`, { reaction })

/** Toggle reaction: POST adds or removes if same emoji already applied (server toggles). */
export const toggleMessageReaction = (messageId: string, reaction: string, remove = false) =>
  remove ? removeMessageReaction(messageId, reaction) : addMessageReaction(messageId, reaction)

export const getNotifications = () =>
  apiGet<{ items: AppNotification[]; unread: number }>('/notifications')
export const markNotificationRead = (id: string) =>
  apiPatch(`/notifications/${id}/read`)
export const markNotificationsRead = (id?: string) =>
  apiPatch('/notifications/read', id ? { id } : {})
export const markAllNotificationsRead = () => apiPatch('/notifications/read-all')

export const submitContactMessage = (
  data: { full_name: string; email: string; subject: string; message: string },
  files: File[] = []
) => {
  const formData = new FormData()
  formData.append('full_name', data.full_name)
  formData.append('email', data.email)
  formData.append('subject', data.subject)
  formData.append('message', data.message)
  files.forEach((f) => formData.append('attachments', f))
  return apiUpload('/contact', formData)
}

// Legacy aliases (kept for any residual callers)
export const getMessages = getAdminConversations
export const getMessage = getAdminConversation
export const replyToMessage = (id: string, reply: string, attachment?: File) =>
  sendAdminChatMessage(id, reply, attachment ? [attachment] : [])
export const markMessageRead = (id: string) => getAdminConversation(id)
export const archiveMessage = archiveConversation
export const deleteMessage = deleteConversation
export const getUserMessages = getUserConversations
export const getUserMessage = getUserConversation
export const markUserMessageRead = (id: string) => getUserConversation(id)

// Resume
export const getResumes = () => apiGet<Resume[]>('/resume')
export const uploadResume = (file: File, version?: string, description?: string) => {
  const formData = new FormData()
  formData.append('file', file)
  if (version) formData.append('version', version)
  if (description) formData.append('description', description)
  return apiUpload<Resume>('/resume/upload', formData)
}
export const updateResume = (id: string, data: { version?: string; description?: string }) =>
  apiPatch<Resume>(`/resume/${id}`, data)
export const deleteResume = (id: string) => apiDelete(`/resume/${id}`)

// Social Links
export const getSocialLinks = () => apiGet<SocialLink[]>('/social-links')
export const createSocialLink = (data: Partial<SocialLink>) =>
  apiPost<SocialLink>('/social-links', data)
export const updateSocialLink = (id: string, data: Partial<SocialLink>) =>
  apiPut<SocialLink>(`/social-links/${id}`, data)
export const deleteSocialLink = (id: string) => apiDelete(`/social-links/${id}`)

// Settings
export const getSettings = () => apiGet<SiteSettings>('/settings')

export const updateSettings = (data: Partial<SiteSettings>, files?: { logo?: File; favicon?: File }) => {
  if (files?.logo || files?.favicon) {
    const formData = new FormData()
    Object.entries(data).forEach(([key, value]) => {
      if (value === undefined || value === null) return
      formData.append(key, String(value))
    })
    if (files.logo) formData.append('logo', files.logo)
    if (files.favicon) formData.append('favicon', files.favicon)
    return apiUploadPut<SiteSettings>('/settings', formData)
  }
  return apiPut<SiteSettings>('/settings', data)
}

// ── Admin User Management ───────────────────────────────────
type UsersListResponse = BackendPaginated<ManagedUser> & {
  stats?: UserManagementStats
}

export const getAdminUsers = async (query?: UsersListQuery) => {
  const data = await apiGet<UsersListResponse>('/admin/users', query as Record<string, unknown>)
  return {
    ...normalizePaginated(data),
    stats: data.stats ?? {
      totalUsers: 0,
      activeUsers: 0,
      inactiveUsers: 0,
      blockedUsers: 0,
      administrators: 0,
      newUsersThisMonth: 0,
    },
  }
}

export const getAdminUser = (id: string) => apiGet<ManagedUser>(`/admin/users/${id}`)

export const updateAdminUser = (
  id: string,
  data: Partial<
    Pick<ManagedUser, 'full_name' | 'email' | 'phone' | 'bio' | 'role' | 'status'>
  >,
  avatar?: File
) => {
  if (avatar) {
    const formData = new FormData()
    Object.entries(data).forEach(([key, value]) => {
      if (value === undefined || value === null) return
      formData.append(key, String(value))
    })
    formData.append('avatar', avatar)
    return apiUploadPut<ManagedUser>(`/admin/users/${id}`, formData)
  }
  return apiPut<ManagedUser>(`/admin/users/${id}`, data)
}

export const deleteAdminUser = (id: string) => apiDelete(`/admin/users/${id}`)

export const updateAdminUserStatus = (id: string, status: string) =>
  apiPatch<ManagedUser>(`/admin/users/${id}/status`, { status })

export const updateAdminUserRole = (id: string, role: string) =>
  apiPatch<ManagedUser>(`/admin/users/${id}/role`, { role })

