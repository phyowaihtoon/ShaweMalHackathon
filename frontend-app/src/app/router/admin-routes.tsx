import type { RouteObject } from 'react-router'

import { SignInPage } from '@/features/auth/pages/SignInPage'
import { SignUpPage } from '@/features/auth/pages/SignUpPage'
import { AdminLayout } from '@/features/admin/layout/AdminLayout'
import { AdminDashboardPage } from '@/features/admin/pages/AdminDashboardPage'
import { AdminMasterDataEntityPage } from '@/features/admin/pages/AdminMasterDataEntityPage'
import { AdminMasterDataPage } from '@/features/admin/pages/AdminMasterDataPage'
import { AdminMovingAssignPage } from '@/features/admin/pages/AdminMovingAssignPage'
import { AdminReportsPage } from '@/features/admin/pages/AdminReportsPage'
import { AdminHouseBookingReportPage } from '@/features/admin/pages/AdminHouseBookingReportPage'
import { AdminUsersPage } from '@/features/admin/pages/AdminUsersPage'
import { AdminVerificationDetailPage } from '@/features/admin/pages/AdminVerificationDetailPage'
import { AdminVerificationQueuePage } from '@/features/admin/pages/AdminVerificationQueuePage'
import { AdminVerificationsPage } from '@/features/admin/pages/AdminVerificationsPage'
import { AdminAuthGuard } from '@/app/router/guards'

export const adminRoutes: RouteObject[] = [
  {
    path: '/admin/sign-in',
    element: <SignInPage redirectTo="/admin/dashboard" titleKey="admin.signInTitle" />,
  },
  {
    path: '/admin/register',
    element: <SignUpPage redirectTo="/admin/sign-in" titleKey="admin.registerTitle" />,
  },
  {
    path: '/admin',
    element: <AdminAuthGuard />,
    children: [
      {
        element: <AdminLayout />,
        children: [
          { index: true, element: <AdminDashboardPage /> },
          { path: 'dashboard', element: <AdminDashboardPage /> },
          { path: 'verifications', element: <AdminVerificationsPage /> },
          { path: 'verifications/agents', element: <AdminVerificationQueuePage kind="agent" /> },
          { path: 'verifications/agents/:userId', element: <AdminVerificationDetailPage kind="agent" /> },
          { path: 'verifications/drivers', element: <AdminVerificationQueuePage kind="driver" /> },
          { path: 'verifications/drivers/:userId', element: <AdminVerificationDetailPage kind="driver" /> },
          { path: 'users', element: <AdminUsersPage /> },
          { path: 'moving-assign', element: <AdminMovingAssignPage /> },
          { path: 'master-data', element: <AdminMasterDataPage /> },
          { path: 'master-data/:entity', element: <AdminMasterDataEntityPage /> },
          { path: 'reports', element: <AdminReportsPage /> },
          { path: 'reports/bookings', element: <AdminHouseBookingReportPage /> },
        ],
      },
    ],
  },
]
