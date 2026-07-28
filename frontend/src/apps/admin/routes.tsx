import { lazy, Suspense } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import { ProtectedRoute } from '../../shared/components/ProtectedRoute'
import { PageLoader } from '../../shared/components/ui'
import { AdminLayout } from './layout/AdminLayout'

const DashboardPage = lazy(() => import('./pages/DashboardPage'))
const UsersPage = lazy(() => import('./pages/UsersPage'))
const ProjectsPage = lazy(() => import('./pages/ProjectsPage'))
const ProjectFormPage = lazy(() => import('./pages/ProjectFormPage'))
const SkillsPage = lazy(() => import('./pages/SkillsPage'))
const CertificatesPage = lazy(() => import('./pages/CertificatesPage'))
const EducationPage = lazy(() => import('./pages/EducationPage'))
const ExperiencePage = lazy(() => import('./pages/ExperiencePage'))
const BlogsPage = lazy(() => import('./pages/BlogsPage'))
const BlogFormPage = lazy(() => import('./pages/BlogFormPage'))
const MessagesPage = lazy(() => import('./pages/MessagesPage'))
const ResumePage = lazy(() => import('./pages/ResumePage'))
const SocialLinksPage = lazy(() => import('./pages/SocialLinksPage'))
const SettingsPage = lazy(() => import('./pages/SettingsPage'))
const ProfilePage = lazy(() => import('./pages/ProfilePage'))

function RouteFallback() {
  return (
    <div className="flex min-h-[50vh] items-center justify-center">
      <PageLoader />
    </div>
  )
}

export function AdminRoutes() {
  return (
    <Suspense fallback={<RouteFallback />}>
      <Routes>
        <Route path="login" element={<Navigate to="/signin" replace />} />

        <Route
          element={
            <ProtectedRoute roles={['admin']} unauthorizedTo="/unauthorized" redirectTo="/signin" />
          }
        >
          <Route element={<AdminLayout />}>
            <Route index element={<Navigate to="/admin/dashboard" replace />} />
            <Route path="dashboard" element={<DashboardPage />} />
            <Route path="users" element={<UsersPage />} />
            <Route path="projects" element={<ProjectsPage />} />
            <Route path="projects/new" element={<ProjectFormPage />} />
            <Route path="projects/:id" element={<ProjectFormPage />} />
            <Route path="skills" element={<SkillsPage />} />
            <Route path="certificates" element={<CertificatesPage />} />
            <Route path="education" element={<EducationPage />} />
            <Route path="experience" element={<ExperiencePage />} />
            <Route path="blogs" element={<BlogsPage />} />
            <Route path="blogs/new" element={<BlogFormPage />} />
            <Route path="blogs/:id" element={<BlogFormPage />} />
            <Route path="messages" element={<MessagesPage />} />
            <Route path="resume" element={<ResumePage />} />
            <Route path="social-links" element={<SocialLinksPage />} />
            <Route path="settings" element={<SettingsPage />} />
            <Route path="profile" element={<ProfilePage />} />
          </Route>
        </Route>

        <Route path="*" element={<Navigate to="/signin" replace />} />
      </Routes>
    </Suspense>
  )
}
