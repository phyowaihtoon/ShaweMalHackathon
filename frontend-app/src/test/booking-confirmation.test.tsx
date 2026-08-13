import { screen } from '@testing-library/react'
import { Route, Routes } from 'react-router'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { BookingConfirmationPage } from '@/features/houses/pages/BookingConfirmationPage'
import { tokenStorage } from '@/lib/auth/token-storage'
import { renderWithProviders } from '@/test/utils'

function createToken() {
  const header = btoa(JSON.stringify({ alg: 'none', typ: 'JWT' }))
  const payload = btoa(
    JSON.stringify({
      exp: Math.floor(Date.now() / 1000) + 3600,
      sub: 'user-1',
    }),
  )
  return `${header}.${payload}.sig`
}

describe('booking confirmation page (FR-HOUSE-005)', () => {
  afterEach(() => {
    tokenStorage.clear()
    vi.unstubAllGlobals()
  })

  it('shows thank-you copy and hire moving offer on a page', async () => {
    tokenStorage.setAccessToken(createToken())

    vi.stubGlobal(
      'fetch',
      vi.fn(async (input: RequestInfo | URL) => {
        const url = String(input)
        if (url.includes('/auth/verify') || url.includes('/auth/me')) {
          return new Response(
            JSON.stringify({
              success: true,
              message: 'ok',
              data: {
                user: {
                  id: 'user-1',
                  name: 'Pat',
                  email: 'pat@example.com',
                  roles: ['normal'],
                },
              },
            }),
            { status: 200, headers: { 'Content-Type': 'application/json' } },
          )
        }
        if (url.includes('/bookings/booking-1')) {
          return new Response(
            JSON.stringify({
              success: true,
              message: 'ok',
              data: {
                booking: {
                  id: 'booking-1',
                  houseId: 'house-1',
                  userId: 'user-1',
                  status: 'CONFIRMED',
                  createdAt: new Date().toISOString(),
                  house: { id: 'house-1', title: 'River View' },
                },
              },
            }),
            { status: 200, headers: { 'Content-Type': 'application/json' } },
          )
        }
        return new Response(JSON.stringify({ success: false, message: `Unhandled ${url}` }), { status: 404 })
      }),
    )

    renderWithProviders(
      <Routes>
        <Route path="/houses/:id/bookings/:bookingId/confirmation" element={<BookingConfirmationPage />} />
      </Routes>,
      {
        initialEntries: ['/houses/house-1/bookings/booking-1/confirmation'],
      },
    )

    expect(await screen.findByRole('heading', { name: /booking confirmed/i })).toBeInTheDocument()
    expect(screen.getByText(/agent will contact you soon/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /yes, hire moving/i })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /not now/i })).toBeInTheDocument()
  })
})
