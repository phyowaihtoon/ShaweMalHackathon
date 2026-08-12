import { Navigate, Outlet, useLocation } from 'react-router'

import { useAuth } from '@/app/providers/AuthProvider'

export function AdminAuthGuard() {
  const { isAuthenticated, isBootstrapping, user } = useAuth()
  const location = useLocation()

  if (isBootstrapping) {
    return <p className="p-8 text-sm text-muted-foreground">Loading...</p>
  }

  if (!isAuthenticated) {
    return <Navigate to="/admin/sign-in" replace state={{ from: location.pathname }} />
  }

  if (user && !user.roles?.includes('admin')) {
    return <Navigate to="/admin/sign-in" replace />
  }

  return <Outlet />
}
