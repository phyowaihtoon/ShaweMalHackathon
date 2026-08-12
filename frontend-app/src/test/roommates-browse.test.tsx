import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { FindingRoommatesPage } from '@/features/roommates/pages/FindingRoommatesPage'
import { renderWithProviders } from '@/test/utils'

describe('roommates browse', () => {
  beforeEach(() => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async (input: RequestInfo | URL) => {
        const url = String(input)

        if (url.includes('/master-data/occupations')) {
          return new Response(
            JSON.stringify({
              success: true,
              message: 'ok',
              data: { items: [{ id: 'occ1', name: 'Engineer' }] },
            }),
            { status: 200, headers: { 'Content-Type': 'application/json' } },
          )
        }

        if (url.includes('/roommates')) {
          return new Response(
            JSON.stringify({
              success: true,
              message: 'ok',
              data: {
                items: [
                  {
                    id: 'rm1',
                    title: 'Quiet room near campus',
                    budgetCostSharing: 'Split utilities 50/50',
                    gender: 'ANY',
                    occupation: { id: 'occ1', name: 'Engineer' },
                    preferences: { isNoSmoking: true },
                    hobbies: { hobbyReading: true },
                    user: { id: 'u2', name: 'Bo Bo' },
                    house: {
                      id: 'h1',
                      title: 'Campus Condo',
                      city: { id: 'c1', name: 'Yangon' },
                      state: { id: 's1', name: 'Yangon' },
                    },
                  },
                ],
              },
            }),
            { status: 200, headers: { 'Content-Type': 'application/json' } },
          )
        }

        return new Response(JSON.stringify({ success: false, message: `Unhandled ${url}` }), {
          status: 404,
        })
      }),
    )
  })

  it('renders roommate cards from GET /roommates', async () => {
    renderWithProviders(<FindingRoommatesPage />, { initialEntries: ['/finding-roommates'] })

    expect(await screen.findByRole('heading', { name: /finding roommates/i })).toBeInTheDocument()
    expect(await screen.findByText(/quiet room near campus/i)).toBeInTheDocument()
    expect(screen.getByText(/split utilities 50\/50/i)).toBeInTheDocument()
    expect(screen.getByText(/bo bo/i)).toBeInTheDocument()
  })

  it('applies filters and re-fetches', async () => {
    const user = userEvent.setup()
    renderWithProviders(<FindingRoommatesPage />, { initialEntries: ['/finding-roommates'] })

    await screen.findByText(/quiet room near campus/i)
    await user.selectOptions(screen.getByLabelText(/^gender$/i), 'MALE')
    await user.click(screen.getByRole('button', { name: /apply filters/i }))

    await waitFor(() => {
      const fetchMock = vi.mocked(fetch)
      const roommateCalls = fetchMock.mock.calls
        .map(([input]) => String(input))
        .filter((url) => url.includes('/roommates'))
      expect(roommateCalls.some((url) => url.includes('gender=MALE'))).toBe(true)
    })
  })
})
