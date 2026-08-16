import { screen } from '@testing-library/react'
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

describe('house details agent rating', () => {
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

        if (url.includes('/wishlist')) {
          return new Response(JSON.stringify({ success: true, message: 'ok', data: { items: [] } }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
          })
        }

        if (url.includes('/bookings')) {
          return new Response(
            JSON.stringify({
              success: true,
              message: 'ok',
              data: {
                items: [
                  {
                    id: 'booking-1',
                    userId: 'u1',
                    houseId: 'h1',
                    status: 'CONFIRMED',
                    createdAt: '2026-08-16T00:00:00.000Z',
                    myReview: null,
                  },
                ],
              },
            }),
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

  it('shows a star rating form for the agent after a confirmed booking', async () => {
    renderWithProviders(
      <Routes>
        <Route path="/houses/:id" element={<HouseDetailsPage />} />
      </Routes>,
      { initialEntries: ['/houses/h1'] },
    )

    expect(await screen.findByText(/rate your agent, Agent Ada/i)).toBeInTheDocument()
    expect(screen.getByRole('radio', { name: /5 star/i })).toBeInTheDocument()
    expect(screen.queryByRole('combobox')).not.toBeInTheDocument()
  })
})
