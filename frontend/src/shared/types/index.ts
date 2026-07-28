export type Profile = {
  id?: number
  full_name: string
  title: string
  bio: string
  avatar_url: string
  email: string
  phone: string
  location: string
  github_url: string
  linkedin_url: string
  twitter_url: string
  website_url: string
}

export type Skill = {
  id: number
  name: string
  category: string
  proficiency: number
  display_order: number
}

export type Project = {
  id: number
  title: string
  slug: string
  description: string
  long_description: string
  image_url: string
  demo_url: string
  github_url: string
  tech_stack: string[]
  featured: boolean
  published: boolean
  display_order: number
  created_at: string
}

export type Certificate = {
  id: number
  title: string
  issuer: string
  issue_date: string | null
  credential_url: string
  image_url: string
  display_order: number
}

export type BlogPost = {
  id: number
  title: string
  slug: string
  excerpt: string
  content: string
  cover_image_url: string
  published: boolean
  published_at: string | null
  created_at: string
}

export type ContactMessage = {
  id: number
  name: string
  email: string
  subject: string
  message: string
  read: boolean
  created_at: string
}

export type Admin = {
  id: number
  name: string
  email: string
}

export type DashboardStats = {
  projects: number
  certificates: number
  blogPosts: number
  messages: number
  unreadMessages: number
}

export type ApiResponse<T> = {
  success: boolean
  message: string
  data: T
}
