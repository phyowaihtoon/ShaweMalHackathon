import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { AdminReportsPage } from '@/features/admin/pages/AdminReportsPage'
import { tokenStorage } from '@/lib/auth/token-storage'
import { renderWithProviders } from '@/test/utils'

function createToken() {
  const header = btoa(JSON.stringify({ alg: 'none', typ: 'JWT' }))
  const payload = btoa(
    JSON.stringify({
      exp: Math.floor(Date.now() / 1000) + 3600,
      role: 'admin',
      sub: 'admin-1',
    }),
  )
  return `${header}.${payload}.sig`
}

const reportPayload = {
  period: { from: '2026-01-01T00:00:00.000Z', to: null },
  userRegistrationsByRole: [
    { role: 'admin', count: 2 },
    { role: 'agent', count: 5 },
  ],
  verification: {
    agents: { pending: 3, verified: 4, rejected: 1, total: 8 },
    drivers: { pending: 1, verified: 2, rejected: 0, total: 3 },
  },
  housing: {
    byCity: [{ cityId: 'c1', city: 'Yangon', count: 7 }],
    byType: [{ propertyTypeId: 'p1', propertyType: 'Condo', count: 4 }],
    byAvailability: { available: 6, notAvailable: 1 },
  },
  bookingStatusSummary: [{ status: 'CONFIRMED', count: 9 }],
  movingRequestSummary: {
    byStatus: [{ status: 'PENDING', count: 2 }],
    completed: 1,
    total: 3,
  },
  topPerformers: {
    agents: [{ userId: 'a1', name: 'Agent One', averageRating: 4.5, ratingCount: 10 }],
    drivers: [],
  },
}

describe('admin reports page', () => {
  afterEach(() => {
    tokenStorage.clear()
    vi.unstubAllGlobals()
  })

  it('renders overview cards from mocked reports fetch', async () => {
    tokenStorage.setAccessToken(createToken())

    const fetchMock = vi.fn(async (input: RequestInfo | URL) => {
      const url = String(input)
      if (url.includes('/admin/reports/overview')) {
        return {
          ok: true,
          status: 200,
          json: async () => ({
            success: true,
            message: 'ok',
            data: reportPayload,
          }),
        }
      }
      return {
        ok: false,
        status: 404,
        json: async () => ({ success: false, message: `Unhandled ${url}` }),
      }
    })
    vi.stubGlobal('fetch', fetchMock)

    const user = userEvent.setup()
    renderWithProviders(<AdminReportsPage />, { initialEntries: ['/admin/reports'] })

    expect(await screen.findByRole('heading', { name: /reports/i })).toBeInTheDocument()
    expect(await screen.findByText('Pending agent verifications')).toBeInTheDocument()
    expect(screen.getByText('Pending 3 · Verified 4 · Rejected 1')).toBeInTheDocument()
    expect(screen.getByText('Yangon')).toBeInTheDocument()
    expect(screen.getByText('Agent One')).toBeInTheDocument()

    await user.type(screen.getByLabelText(/from/i), '2026-01-01')
    await user.click(screen.getByRole('button', { name: /apply filters/i }))

    await vi.waitFor(() => {
      expect(fetchMock).toHaveBeenCalledWith(
        expect.stringContaining('from=2026-01-01'),
        expect.any(Object),
      )
    })
  })
})
