import { screen, waitFor } from '@testing-library/react'
import { Route, Routes } from 'react-router'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { AdminAuthGuard } from '@/app/router/guards'
import { AdminDashboardPage } from '@/features/admin/pages/AdminDashboardPage'
import { SignInPage } from '@/features/auth/pages/SignInPage'
import { tokenStorage } from '@/lib/auth/token-storage'
import { renderWithProviders } from '@/test/utils'

function createToken(expOffsetSeconds: number) {
  const header = btoa(JSON.stringify({ alg: 'none', typ: 'JWT' }))
  const payload = btoa(
    JSON.stringify({
      exp: Math.floor(Date.now() / 1000) + expOffsetSeconds,
      role: 'admin',
      sub: 'user-1',
    }),
  )
  return `${header}.${payload}.sig`
}

const emptyReport = {
  period: { from: null, to: null },
  userRegistrationsByRole: [],
  verification: {
    agents: { pending: 0, verified: 0, rejected: 0, total: 0 },
    drivers: { pending: 0, verified: 0, rejected: 0, total: 0 },
  },
  housing: {
    byCity: [],
    byType: [],
    byAvailability: { available: 0, notAvailable: 0 },
  },
  bookingStatusSummary: [],
  movingRequestSummary: { byStatus: [], completed: 0, total: 0 },
  topPerformers: { agents: [], drivers: [] },
}

function stubAdminFetch() {
  vi.stubGlobal(
    'fetch',
    vi.fn(async (input: RequestInfo | URL) => {
      const url = String(input)

      if (url.includes('/auth/verify') || url.includes('/auth/me')) {
        return {
          ok: true,
          status: 200,
          json: async () => ({
            success: true,
            message: 'Token is valid',
            data: {
              user: {
                id: 'user-1',
                name: 'Admin',
                email: 'admin@example.com',
                roles: ['admin'],
              },
            },
          }),
        }
      }

      if (url.includes('/admin/reports/overview')) {
        return {
          ok: true,
          status: 200,
          json: async () => ({
            success: true,
            message: 'Admin overview report fetched successfully',
            data: emptyReport,
          }),
        }
      }

      return {
        ok: false,
        status: 404,
        json: async () => ({ success: false, message: `Unhandled test fetch: ${url}` }),
      }
    }),
  )
}

describe('admin auth guard', () => {
  afterEach(() => {
    tokenStorage.clear()
    vi.unstubAllGlobals()
  })

  it('redirects to admin sign-in when no token', async () => {
    renderWithProviders(
      <Routes>
        <Route path="/admin/sign-in" element={<SignInPage redirectTo="/admin/dashboard" titleKey="admin.signInTitle" />} />
        <Route path="/admin" element={<AdminAuthGuard />}>
          <Route path="dashboard" element={<AdminDashboardPage />} />
        </Route>
      </Routes>,
      { initialEntries: ['/admin/dashboard'] },
    )

    expect(await screen.findByRole('heading', { name: /admin sign in/i })).toBeInTheDocument()
  })

  it('redirects and clears storage for invalid token', async () => {
    tokenStorage.setAccessToken(createToken(-120))

    renderWithProviders(
      <Routes>
        <Route path="/admin/sign-in" element={<SignInPage redirectTo="/admin/dashboard" titleKey="admin.signInTitle" />} />
        <Route path="/admin" element={<AdminAuthGuard />}>
          <Route path="dashboard" element={<AdminDashboardPage />} />
        </Route>
      </Routes>,
      { initialEntries: ['/admin/dashboard'] },
    )

    expect(await screen.findByRole('heading', { name: /admin sign in/i })).toBeInTheDocument()
    await waitFor(() => {
      expect(tokenStorage.getAccessToken()).toBeNull()
    })
  })

  it('allows admin dashboard when token is valid', async () => {
    tokenStorage.setAccessToken(createToken(3600))
    stubAdminFetch()

    renderWithProviders(
      <Routes>
        <Route path="/admin/sign-in" element={<SignInPage redirectTo="/admin/dashboard" titleKey="admin.signInTitle" />} />
        <Route path="/admin" element={<AdminAuthGuard />}>
          <Route path="dashboard" element={<AdminDashboardPage />} />
        </Route>
      </Routes>,
      { initialEntries: ['/admin/dashboard'] },
    )

    expect(await screen.findByRole('heading', { name: /dashboard/i })).toBeInTheDocument()
  })
})
