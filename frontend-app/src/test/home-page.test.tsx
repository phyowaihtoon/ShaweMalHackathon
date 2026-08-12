import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Route, Routes } from 'react-router'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { HomePage } from '@/features/home/pages/HomePage'
import { FindingHousePage } from '@/features/houses/pages/FindingHousePage'
import { renderWithProviders } from '@/test/utils'

const homePayload = {
  featuredHouses: [
    {
      id: 'h1',
      title: 'Golden Condo',
      monthlyFees: 450000,
      propertyType: { id: 'pt1', name: 'Condo' },
      city: { id: 'c1', name: 'Yangon' },
      thumbnail: null,
    },
  ],
  popularRecommended: [],
  verifiedAgents: [{ id: 'a1', name: 'Agent A', agentProfile: { city: { id: 'c1', name: 'Yangon' } } }],
  partnerMovingServices: [],
  serviceReviews: [],
  newsUpdates: [{ id: 'n1', title: 'Welcome to ShweMal', summary: 'Hello', publishedAt: '2026-08-12' }],
}

describe('home page', () => {
  beforeEach(() => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async (input: RequestInfo | URL) => {
        const url = String(input)
        if (url.includes('/home')) {
          return new Response(JSON.stringify({ success: true, message: 'ok', data: homePayload }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
          })
        }
        if (url.includes('/master-data/')) {
          return new Response(JSON.stringify({ success: true, message: 'ok', data: { items: [] } }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
          })
        }
        if (url.includes('/houses')) {
          return new Response(
            JSON.stringify({
              success: true,
              message: 'ok',
              data: { items: [], page: 1, pageSize: 12, total: 0, totalPages: 1 },
            }),
            { status: 200, headers: { 'Content-Type': 'application/json' } },
          )
        }
        return new Response(JSON.stringify({ success: false, message: 'not found' }), { status: 404 })
      }),
    )
  })

  it('renders home sections from API and navigates search to finding house', async () => {
    const user = userEvent.setup()

    renderWithProviders(
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/finding-house" element={<FindingHousePage />} />
      </Routes>,
    )

    expect(await screen.findByRole('heading', { name: /find your next home with shwemal/i })).toBeInTheDocument()
    expect(await screen.findByText('Golden Condo')).toBeInTheDocument()
    expect(screen.getByText('Welcome to ShweMal')).toBeInTheDocument()
    expect(screen.getByText('Agent A')).toBeInTheDocument()

    await user.type(screen.getByLabelText(/search houses by city/i), 'Yangon')
    await user.click(screen.getByRole('button', { name: /search houses/i }))

    expect(await screen.findByRole('heading', { name: /finding house/i })).toBeInTheDocument()
  })
})
