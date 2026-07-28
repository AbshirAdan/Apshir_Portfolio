import { lazy, Suspense } from 'react'
import { Route, Routes } from 'react-router-dom'
import { PageLoader } from '../../shared/components/ui'
import { ProtectedRoute, PublicOnlyRoute } from '../../shared/components/ProtectedRoute'
import { PublicLayout } from './layout/PublicLayout'

const LandingPage = lazy(() => import('./pages/LandingPage'))
const BlogPage = lazy(() => import('./pages/BlogPage'))
const BlogDetailPage = lazy(() => import('./pages/BlogDetailPage'))
const NotFoundPage = lazy(() => import('./pages/NotFoundPage'))
const SignInPage = lazy(() => import('./pages/SignInPage'))
const SignUpPage = lazy(() => import('./pages/SignUpPage'))
const ForgotPasswordPage = lazy(() => import('./pages/ForgotPasswordPage'))
const ResetPasswordPage = lazy(() => import('./pages/ResetPasswordPage'))
const UnauthorizedPage = lazy(() => import('./pages/UnauthorizedPage'))
const AccountLayout = lazy(() => import('./pages/account/AccountLayout'))
const AccountDashboardPage = lazy(() => import('./pages/account/AccountDashboardPage'))
const AccountProfilePage = lazy(() => import('./pages/account/AccountProfilePage'))
const AccountSettingsPage = lazy(() => import('./pages/account/AccountSettingsPage'))
const AccountMessagesPage = lazy(() => import('./pages/account/AccountMessagesPage'))

function RouteFallback() {
  return (
    <div className="flex min-h-[50vh] items-center justify-center">
      <PageLoader />
    </div>
  )
}

export function PublicRoutes() {
  return (
    <Suspense fallback={<RouteFallback />}>
      <Routes>
        <Route element={<PublicLayout />}>
          <Route index element={<LandingPage />} />
          <Route path="blog" element={<BlogPage />} />
          <Route path="blog/:slug" element={<BlogDetailPage />} />
          <Route path="unauthorized" element={<UnauthorizedPage />} />

          <Route element={<PublicOnlyRoute />}>
            <Route path="signin" element={<SignInPage />} />
            <Route path="signup" element={<SignUpPage />} />
          </Route>

          <Route path="forgot-password" element={<ForgotPasswordPage />} />
          <Route path="reset-password" element={<ResetPasswordPage />} />

          <Route
            element={
              <ProtectedRoute
                redirectTo="/signin"
                roles={['user', 'editor']}
                unauthorizedTo="/unauthorized"
              />
            }
          >
            <Route path="account" element={<AccountLayout />}>
              <Route index element={<AccountDashboardPage />} />
              <Route path="messages" element={<AccountMessagesPage />} />
              <Route path="profile" element={<AccountProfilePage />} />
              <Route path="settings" element={<AccountSettingsPage />} />
            </Route>
          </Route>

          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>
    </Suspense>
  )
}
