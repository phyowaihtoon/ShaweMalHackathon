import { screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Route, Routes } from 'react-router'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { HouseDetailsPage } from '@/features/houses/pages/HouseDetailsPage'
import { tokenStorage } from '@/lib/auth/token-storage'
import { renderWithProviders } from '@/test/utils'

vi.mock('@/features/houses/components/HouseLocationMap', () => ({
  HouseLocationMap: () => <div data-testid="house-location-map" />,
}))

function encodeJwt() {
  const header = btoa(JSON.stringify({ alg: 'none', typ: 'JWT' }))
  const body = btoa(JSON.stringify({ exp: Math.floor(Date.now() / 1000) + 3600, sub: 'u1' }))
  return `${header}.${body}.sig`
}

describe('house details book confirmation', () => {
  beforeEach(() => {
    tokenStorage.setTokens(encodeJwt(), 'refresh', true)
    vi.stubGlobal(
      'fetch',
      vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
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

        if (url.includes('/wishlist')) {
          return new Response(JSON.stringify({ success: true, message: 'ok', data: { items: [] } }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
          })
        }

        if (url.includes('/houses/h1/bookings') && init?.method === 'POST') {
          return new Response(
            JSON.stringify({
              success: true,
              message: 'ok',
              data: { booking: { id: 'booking-1', houseId: 'h1', status: 'CONFIRMED' } },
            }),
            { status: 200, headers: { 'Content-Type': 'application/json' } },
          )
        }

        if (url.includes('/bookings')) {
          return new Response(
            JSON.stringify({ success: true, message: 'ok', data: { items: [] } }),
            { status: 200, headers: { 'Content-Type': 'application/json' } },
          )
        }

        if (url.includes('/houses/h1')) {
          return new Response(
            JSON.stringify({
              success: true,
              message: 'ok',
              data: {
                item: {
                  id: 'h1',
                  title: 'Inya Garden Flat',
                  description: 'Quiet street',
                  availability: 'AVAILABLE',
                  monthlyFees: 400000,
                  depositAmount: 800000,
                  bedrooms: 2,
                  bathrooms: 1,
                  images: [],
                  amenities: [],
                  contact: { phone: '0911111111' },
                  location: {
                    city: { id: 'c1', name: 'Kamayut Township' },
                    state: { id: 's1', name: 'Yangon' },
                    streetAddress: '42 Inya Road',
                    latitude: 16.8294,
                    longitude: 96.1356,
                  },
                  agent: { id: 'a1', name: 'Agent Ada' },
                },
              },
            }),
            { status: 200, headers: { 'Content-Type': 'application/json' } },
          )
        }

        return new Response(JSON.stringify({ success: false, message: `Unhandled ${url}` }), { status: 404 })
      }),
    )
  })

  it('asks for confirmation in a custom popup before booking', async () => {
    const user = userEvent.setup()
    const fetchMock = vi.mocked(fetch)

    renderWithProviders(
      <Routes>
        <Route path="/houses/:id" element={<HouseDetailsPage />} />
        <Route path="/houses/:id/bookings/:bookingId/confirmation" element={<p>Booked</p>} />
      </Routes>,
      { initialEntries: ['/houses/h1'] },
    )

    expect(await screen.findByRole('heading', { name: 'Inya Garden Flat' })).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: /book house/i }))

    const dialog = screen.getByRole('dialog', { name: /book this house/i })
    expect(dialog).toBeInTheDocument()
    expect(within(dialog).getByText(/inya garden flat/i)).toBeInTheDocument()
    expect(
      fetchMock.mock.calls.some(([input, init]) => String(input).includes('/bookings') && init?.method === 'POST'),
    ).toBe(false)

    await user.click(within(dialog).getByRole('button', { name: /not now/i }))
    expect(screen.queryByRole('dialog', { name: /book this house/i })).not.toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: /book house/i }))
    await user.click(within(screen.getByRole('dialog')).getByRole('button', { name: /book house/i }))

    expect(await screen.findByText('Booked')).toBeInTheDocument()
    expect(
      fetchMock.mock.calls.some(([input, init]) => String(input).includes('/houses/h1/bookings') && init?.method === 'POST'),
    ).toBe(true)
  })
})
