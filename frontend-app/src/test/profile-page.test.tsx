import { screen } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { ProfilePage } from '@/features/profile/pages/ProfilePage'
import { tokenStorage } from '@/lib/auth/token-storage'
import { renderWithProviders } from '@/test/utils'

function encodeJwt(payload: Record<string, unknown>) {
  const header = btoa(JSON.stringify({ alg: 'none', typ: 'JWT' }))
  const body = btoa(JSON.stringify(payload))
  return `${header}.${body}.sig`
}

describe('profile page', () => {
  beforeEach(() => {
    tokenStorage.clear()
    const token = encodeJwt({
      exp: Math.floor(Date.now() / 1000) + 3600,
      sub: 'u1',
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
                  id: 'u1',
                  name: 'Alice User',
                  email: 'alice@example.com',
                  phone: '09123456789',
                  roles: ['normal'],
                },
              },
            }),
            { status: 200, headers: { 'Content-Type': 'application/json' } },
          )
        }

        if (url.endsWith('/profile') || url.includes('/profile?')) {
          return new Response(
            JSON.stringify({
              success: true,
              message: 'ok',
              data: {
                user: {
                  id: 'u1',
                  name: 'Alice User',
                  email: 'alice@example.com',
                  phone: '09123456789',
                  profilePicturePath: 'uploads/profile/alice.jpg',
                  verificationStatus: 'VERIFIED',
                  roles: ['normal'],
                },
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

  it('renders account overview and edit sections', async () => {
    renderWithProviders(<ProfilePage />, { initialEntries: ['/profile'] })

    expect(await screen.findByRole('heading', { name: /^profile$/i })).toBeInTheDocument()
    expect(await screen.findByText(/alice@example.com/i)).toBeInTheDocument()
    expect(screen.getByText(/normal/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /save profile/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /change password/i })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /wishlist/i })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /history/i })).toBeInTheDocument()
  })
})
