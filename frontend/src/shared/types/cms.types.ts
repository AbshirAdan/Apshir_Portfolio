export type DashboardStats = {
  projects: number
  skills: number
  certificates: number
  blogs: number
  messages: number
  unreadMessages: number
  education: number
  experience: number
  visitors: number
}

export type RecentActivity = {
  id: string
  type: 'message' | 'project' | 'blog' | 'certificate'
  title: string
  description: string
  created_at: string
}

export type PaginatedResponse<T> = {
  items: T[]
  total: number
  page: number
  limit: number
  totalPages: number
}

export type ProjectStatus = 'draft' | 'published' | 'archived'

export type ProjectImage = {
  id: string
  project_id: string
  image: string
  created_at: string
}

export type Project = {
  id: string
  user_id?: string
  title: string
  slug: string
  short_description: string | null
  full_description: string | null
  technologies: string[]
  github_url: string | null
  live_demo_url: string | null
  thumbnail: string | null
  featured: boolean
  status: ProjectStatus
  category?: string | null
  start_date?: string | null
  completion_date?: string | null
  display_order?: number
  created_at: string
  updated_at: string
  images?: ProjectImage[]
}

export type Skill = {
  id: string
  name: string
  percentage: number
  icon: string | null
  category: string | null
  display_order: number
  created_at: string
}

export type Certificate = {
  id: string
  title: string
  organization: string | null
  issue_date: string | null
  credential_url: string | null
  image: string | null
  created_at: string
}

export type Education = {
  id: string
  user_id?: string | null
  school: string
  degree: string | null
  field: string | null
  start_date: string | null
  end_date: string | null
  created_at: string
}

export type Experience = {
  id: string
  user_id?: string | null
  company: string
  position: string | null
  start_date: string | null
  end_date: string | null
  description: string | null
  created_at: string
}

export type Blog = {
  id: string
  user_id?: string | null
  title: string
  slug: string
  category: string
  cover_image: string | null
  content: string
  excerpt?: string | null
  tags?: string[]
  status: 'draft' | 'published'
  reading_time: number
  seo_title?: string | null
  seo_description?: string | null
  featured: boolean
  published: boolean
  created_at: string
  updated_at: string
}

export type Message = {
  id: string
  sender_id?: string | null
  sender_name?: string
  sender_email?: string
  full_name: string
  email: string
  subject: string | null
  message: string
  status: 'unread' | 'read' | 'replied' | 'archived' | 'deleted' | string
  is_read: boolean
  reply?: string | null
  replied_by?: string | null
  replied_at?: string | null
  read_at?: string | null
  user_read_at?: string | null
  attachment?: string | null
  preview?: string
  has_unread_reply?: boolean
  replies?: MessageReply[]
  created_at: string
  updated_at?: string
}

export type MessageReply = {
  id: string
  message_id: string
  admin_id: string | null
  admin_name?: string | null
  admin_email?: string | null
  body: string
  attachment?: string | null
  created_at: string
}

export type MessageStats = {
  unread: number
  read: number
  replied: number
  archived: number
  total: number
  open?: number
}

export type Conversation = {
  id: string
  user_id?: string | null
  guest_name: string
  guest_email: string
  subject: string
  status: 'open' | 'archived' | 'deleted' | string
  is_pinned: boolean
  last_message_at: string
  last_message_preview?: string | null
  admin_unread_count: number
  user_unread_count: number
  avatar?: string | null
  is_online?: boolean
  last_seen?: string | null
  created_at: string
  updated_at?: string
}

export type ChatAttachment = {
  id: string
  message_id: string
  file_name: string
  file_path: string
  file_url?: string
  file_type: string
  file_size: number
  created_at: string
}

export type ChatMessage = {
  id: string
  conversation_id: string
  sender_id?: string | null
  sender_role: 'admin' | 'user' | 'guest' | string
  sender_name: string
  body: string
  status: 'sent' | 'delivered' | 'seen' | 'deleted' | string
  delivered_at?: string | null
  seen_at?: string | null
  edited_at?: string | null
  deleted_at?: string | null
  created_at: string
  updated_at?: string
  attachments: ChatAttachment[]
  reactions?: MessageReactionGroup[]
}

export type MessageReactionGroup = {
  reaction: string
  count: number
  users: { id: string; name: string }[]
  user_ids: string[]
}

export type AppNotification = {
  id: string
  user_id: string
  type: string
  title: string
  body?: string | null
  conversation_id?: string | null
  message_id?: string | null
  reference_id?: string | null
  is_read: boolean
  created_at: string
}

export type ConversationDetail = {
  conversation: Conversation
  messages: ChatMessage[]
}

export type Resume = {
  id: string
  file_url: string
  file_name?: string | null
  file_size?: number | null
  page_count?: number | null
  version: string
  description?: string | null
  is_active?: boolean
  created_at: string
  updated_at?: string
}

export type SocialLink = {
  id: string
  platform: string
  url: string
  icon: string | null
  display_order: number
  created_at: string
}

export type SiteSettings = {
  id?: string
  site_title: string | null
  hero_title: string | null
  hero_greeting?: string | null
  hero_avatar?: string | null
  hero_description: string | null
  hero_subtitle?: string | null
  logo: string | null
  favicon: string | null
  primary_color: string | null
  secondary_color?: string | null
  seo_meta_title?: string | null
  seo_description?: string | null
  created_at?: string
  updated_at?: string
}

export type ProfileUpdate = {
  full_name?: string
  email?: string
  phone?: string | null
  bio?: string | null
}

export type ChangePasswordInput = {
  currentPassword: string
  newPassword: string
  confirmPassword: string
}

export type ListQuery = {
  page?: number
  limit?: number
  search?: string
}

export type UserStatus = 'active' | 'inactive' | 'blocked'
export type UserRole = 'admin' | 'editor' | 'user'

export type ManagedUser = {
  id: string
  full_name: string
  email: string
  phone: string | null
  bio: string | null
  role: UserRole | string
  status: UserStatus | string
  avatar: string | null
  created_at: string
  updated_at: string
  last_login: string | null
}

export type UserManagementStats = {
  totalUsers: number
  activeUsers: number
  inactiveUsers: number
  blockedUsers: number
  administrators: number
  newUsersThisMonth: number
}

export type UsersListQuery = ListQuery & {
  role?: string
  status?: string
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
  dateJoined?: 'newest' | 'oldest'
}
