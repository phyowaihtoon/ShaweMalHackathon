import { screen } from '@testing-library/react'
import { Route, Routes } from 'react-router'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { HomePage } from '@/features/public/pages/HomePage'
import { renderWithProviders } from '@/test/utils'

describe('smoke', () => {
  beforeEach(() => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () =>
        new Response(
          JSON.stringify({
            success: true,
            message: 'ok',
            data: {
              featuredHouses: [],
              popularRecommended: [],
              verifiedAgents: [],
              partnerMovingServices: [],
              serviceReviews: [],
              newsUpdates: [],
            },
          }),
          { status: 200, headers: { 'Content-Type': 'application/json' } },
        ),
      ),
    )
  })

  it('renders providers and home heading', async () => {
    renderWithProviders(
      <Routes>
        <Route path="/" element={<HomePage />} />
      </Routes>,
    )

    expect(
      await screen.findByRole('heading', { name: /myanmar.?s all-in-one relocation platform/i }),
    ).toBeInTheDocument()
  })
})
