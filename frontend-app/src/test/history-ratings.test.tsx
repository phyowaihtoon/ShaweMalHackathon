import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Route, Routes } from 'react-router'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { HistoryPage } from '@/features/profile/pages/HistoryPage'
import { tokenStorage } from '@/lib/auth/token-storage'
import { renderWithProviders } from '@/test/utils'

function encodeJwt() {
  const header = btoa(JSON.stringify({ alg: 'none', typ: 'JWT' }))
  const body = btoa(JSON.stringify({ exp: Math.floor(Date.now() / 1000) + 3600, sub: 'u1' }))
  return `${header}.${body}.sig`
}

describe('history ratings', () => {
  beforeEach(() => {
    tokenStorage.setTokens(encodeJwt(), 'refresh', true)
    vi.stubGlobal(
      'fetch',
      vi.fn(async (input: RequestInfo | URL) => {
        const url = String(input)

        if (url.includes('/auth/verify') || url.includes('/auth/me')) {
          return new Response(
            JSON.stringify({
              success: true,
              message: 'ok',
              data: { user: { id: 'u1', name: 'Alice', email: 'alice@example.com', roles: ['normal'] } },
            }),
            { status: 200, headers: { 'Content-Type': 'application/json' } },
          )
        }

        if (url.includes('/profile/history')) {
          return new Response(
            JSON.stringify({
              success: true,
              message: 'ok',
              data: {
                bookingHistory: [
                  {
                    id: 'booking-1',
                    status: 'CONFIRMED',
                    createdAt: '2026-08-16T00:00:00.000Z',
                    house: { id: 'h1', title: 'Inya Garden Flat', agent: { id: 'a1', name: 'Agent Ada' } },
                    myReview: null,
                  },
                ],
                movingHistory: [
                  {
                    id: 'move-1',
                    orderNumber: 'MOV-1',
                    status: 'COMPLETED',
                    pickupAddress: 'Hlaing',
                    dropoffAddress: 'Kamayut',
                    createdAt: '2026-08-16T00:00:00.000Z',
                    assignedDriver: { id: 'd1', name: 'Ko Min' },
                    myReview: { id: 'r1', rating: 4, comment: 'Good' },
                  },
                ],
                notifications: { total: 0, unread: 0, recent: [] },
              },
            }),
            { status: 200, headers: { 'Content-Type': 'application/json' } },
          )
        }

        return new Response(JSON.stringify({ success: false, message: `Unhandled ${url}` }), { status: 404 })
      }),
    )
  })

  it('lets the user open rating forms for a confirmed booking and completed move', async () => {
    const user = userEvent.setup()
    renderWithProviders(
      <Routes>
        <Route path="/profile/history" element={<HistoryPage />} />
      </Routes>,
      { initialEntries: ['/profile/history'] },
    )

    expect(await screen.findByText(/Inya Garden Flat/i)).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: /^rate$/i }))
    expect(await screen.findByText(/rate your agent, Agent Ada/i)).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: /update rating/i }))
    expect(await screen.findByText(/rate your driver, Ko Min/i)).toBeInTheDocument()
  })
})
