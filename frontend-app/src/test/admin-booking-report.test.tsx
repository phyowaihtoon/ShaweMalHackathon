import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { AdminHouseBookingReportPage } from '@/features/admin/pages/AdminHouseBookingReportPage'
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

describe('admin house booking report (FR-ADMIN-007)', () => {
  afterEach(() => {
    tokenStorage.clear()
    vi.unstubAllGlobals()
  })

  it('lists booking records and applies status filter', async () => {
    tokenStorage.setAccessToken(createToken())

    const fetchMock = vi.fn(async (input: RequestInfo | URL) => {
      const url = String(input)
      if (url.includes('/auth/verify') || url.includes('/auth/me')) {
        return new Response(
          JSON.stringify({
            success: true,
            message: 'ok',
            data: { user: { id: 'admin-1', name: 'Admin', email: 'admin@example.com', roles: ['admin'] } },
          }),
          { status: 200, headers: { 'Content-Type': 'application/json' } },
        )
      }
      if (url.includes('/admin/reports/bookings')) {
        return new Response(
          JSON.stringify({
            success: true,
            message: 'ok',
            data: {
              items: [
                {
                  id: 'booking-1',
                  houseId: 'h1',
                  userId: 'u1',
                  status: 'CONFIRMED',
                  createdAt: '2026-08-01T00:00:00.000Z',
                  house: { id: 'h1', title: 'Downtown Apt', agent: { id: 'a1', name: 'Agent Ada' } },
                  user: { id: 'u1', name: 'Pat Booker', email: 'pat@example.com' },
                },
              ],
            },
          }),
          { status: 200, headers: { 'Content-Type': 'application/json' } },
        )
      }
      return new Response(JSON.stringify({ success: false, message: `Unhandled ${url}` }), { status: 404 })
    })
    vi.stubGlobal('fetch', fetchMock)

    const user = userEvent.setup()
    renderWithProviders(<AdminHouseBookingReportPage />, { initialEntries: ['/admin/reports/bookings'] })

    expect(await screen.findByRole('heading', { name: /house booking report/i })).toBeInTheDocument()
    expect(await screen.findByText('Downtown Apt')).toBeInTheDocument()
    expect(screen.getByText('Pat Booker')).toBeInTheDocument()

    await user.selectOptions(screen.getByLabelText(/booking status/i), 'CONFIRMED')
    await user.click(screen.getByRole('button', { name: /apply filters/i }))

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledWith(expect.stringContaining('status=CONFIRMED'), expect.any(Object))
    })
  })
})
