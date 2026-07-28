import { lazy, Suspense } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './shared/context/AuthContext'
import { ThemeProvider } from './shared/context/ThemeContext'
import { ToastProvider } from './shared/context/ToastContext'
import { SocketProvider } from './shared/context/SocketContext'
import { PageLoader } from './shared/components/ui'

const PublicRoutes = lazy(() =>
  import('./apps/public/routes').then((m) => ({ default: m.PublicRoutes }))
)
const AdminRoutes = lazy(() =>
  import('./apps/admin/routes').then((m) => ({ default: m.AdminRoutes }))
)

function AppFallback() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-brand-bg">
      <PageLoader />
    </div>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <ToastProvider>
          <AuthProvider>
            <SocketProvider>
              <Suspense fallback={<AppFallback />}>
                <Routes>
                  <Route path="/admin/*" element={<AdminRoutes />} />
                  <Route path="/*" element={<PublicRoutes />} />
                </Routes>
              </Suspense>
            </SocketProvider>
          </AuthProvider>
        </ToastProvider>
      </ThemeProvider>
    </BrowserRouter>
  )
}
