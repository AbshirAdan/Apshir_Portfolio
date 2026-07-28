import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { PageLoader } from '../components/ui'

type ProtectedRouteProps = {
  redirectTo?: string
  roles?: string[]
  unauthorizedTo?: string
}

export function ProtectedRoute({
  redirectTo = '/signin',
  roles,
  unauthorizedTo = '/unauthorized',
}: ProtectedRouteProps) {
  const { isAuthenticated, loading, user } = useAuth()
  const location = useLocation()

  if (loading) return <PageLoader />

  if (!isAuthenticated) {
    return <Navigate to={redirectTo} replace state={{ from: location.pathname }} />
  }

  if (roles && user && !roles.includes(user.role)) {
    return <Navigate to={unauthorizedTo} replace />
  }

  return <Outlet />
}

export function PublicOnlyRoute({
  adminRedirectTo = '/admin/dashboard',
  userRedirectTo = '/',
}: {
  adminRedirectTo?: string
  userRedirectTo?: string
}) {
  const { isAuthenticated, loading, isAdmin } = useAuth()

  if (loading) return <PageLoader />

  if (isAuthenticated) {
    return <Navigate to={isAdmin ? adminRedirectTo : userRedirectTo} replace />
  }

  return <Outlet />
}
