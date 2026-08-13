import { screen } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { AgentHousesPage } from '@/features/agent/pages/AgentHousesPage'
import { tokenStorage } from '@/lib/auth/token-storage'
import { renderWithProviders } from '@/test/utils'

function encodeJwt(payload: Record<string, unknown>) {
  const header = btoa(JSON.stringify({ alg: 'none', typ: 'JWT' }))
  const body = btoa(JSON.stringify(payload))
  return `${header}.${body}.sig`
}

describe('agent houses list', () => {
  beforeEach(() => {
    tokenStorage.clear()
    const token = encodeJwt({
      exp: Math.floor(Date.now() / 1000) + 3600,
      sub: 'agent-1',
    })
    tokenStorage.setTokens(token, 'refresh-token', true)

    vi.stubGlobal(
      'fetch',
      vi.fn(async (input: RequestInfo | URL) => {
        const url = String(input)

        if (url.includes('/auth/verify')) {
          return new Response(
            JSON.stringify({
              success: true,
              message: 'ok',
              data: {
                user: {
                  id: 'agent-1',
                  name: 'Agent Ada',
                  email: 'ada@example.com',
                  roles: ['agent'],
                  verificationStatus: 'VERIFIED',
                },
              },
            }),
            { status: 200, headers: { 'Content-Type': 'application/json' } },
          )
        }

        if (url.includes('/agent/houses')) {
          return new Response(
            JSON.stringify({
              success: true,
              message: 'ok',
              data: {
                items: [
                  {
                    id: 'h1',
                    title: 'River View Condo',
                    postChannel: 'AGENT',
                    monthlyFees: 450000,
                    depositAmount: 900000,
                    bedrooms: 2,
                    bathrooms: 1,
                    contactPhoneNumber: '0911111111',
                    availability: 'AVAILABLE',
                    propertyType: { id: 'pt1', name: 'Condominium' },
                    city: { id: 'c1', name: 'Yangon' },
                    state: { id: 's1', name: 'Yangon' },
                    images: [
                      {
                        imagePath: 'uploads/houses/11111111-2222-3333-4444-555555555555.jpg',
                        sortOrder: 1,
                      },
                    ],
                    amenities: [],
                  },
                ],
              },
            }),
            { status: 200, headers: { 'Content-Type': 'application/json' } },
          )
        }

        // Ignore unexpected upload calls from other screens; keep agent list green.
        if (url.includes('/uploads')) {
          return new Response(
            JSON.stringify({ success: true, message: 'ok', data: { paths: [] } }),
            { status: 200, headers: { 'Content-Type': 'application/json' } },
          )
        }

        return new Response(JSON.stringify({ success: false, message: `Unhandled ${url}` }), {
          status: 404,
        })
      }),
    )
  })

  it('renders own listings with edit and delete actions', async () => {
    renderWithProviders(<AgentHousesPage />, { initialEntries: ['/agent/houses'] })

    expect(await screen.findByRole('heading', { name: /my house listings/i })).toBeInTheDocument()
    expect(await screen.findByText(/river view condo/i)).toBeInTheDocument()
    expect(screen.getByText(/yangon/i)).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /post a house/i })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /edit/i })).toHaveAttribute(
      'href',
      '/agent/houses/h1/edit',
    )
    expect(screen.getByRole('button', { name: /delete/i })).toBeInTheDocument()
  })
})
