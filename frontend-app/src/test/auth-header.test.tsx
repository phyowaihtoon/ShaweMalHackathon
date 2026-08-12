import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Route, Routes } from 'react-router'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { PublicLayout } from '@/features/public/layout/PublicLayout'
import { HomePage } from '@/features/home/pages/HomePage'
import { tokenStorage } from '@/lib/auth/token-storage'
import { renderWithProviders } from '@/test/utils'

function encodeJwt(payload: Record<string, unknown>) {
  const header = btoa(JSON.stringify({ alg: 'none', typ: 'JWT' }))
  const body = btoa(JSON.stringify(payload))
  return `${header}.${body}.sig`
}

describe('authenticated public header', () => {
  beforeEach(() => {
    tokenStorage.clear()
    const token = encodeJwt({
      exp: Math.floor(Date.now() / 1000) + 3600,
      sub: 'u1',
    })
    tokenStorage.setTokens(token, 'refresh-token', true)

    vi.stubGlobal(
      'fetch',
      vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
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
                  roles: ['user'],
                },
              },
            }),
            { status: 200, headers: { 'Content-Type': 'application/json' } },
          )
        }
        if (url.includes('/notifications')) {
          return new Response(
            JSON.stringify({
              success: true,
              message: 'ok',
              data: { items: [], unreadCount: 0 },
            }),
            { status: 200, headers: { 'Content-Type': 'application/json' } },
          )
        }
        if (url.includes('/auth/logout')) {
          return new Response(JSON.stringify({ success: true, message: 'ok', data: { ok: true } }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
          })
        }
        if (url.includes('/home')) {
          return new Response(
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
          )
        }
        return new Response(JSON.stringify({ success: false, message: `Unhandled ${url} ${init?.method}` }), {
          status: 404,
        })
      }),
    )
  })

  it('shows profile menu and notifications, hides sign-in/sign-up, and logs out', async () => {
    const user = userEvent.setup()

    renderWithProviders(
      <Routes>
        <Route path="/" element={<PublicLayout />}>
          <Route index element={<HomePage />} />
        </Route>
      </Routes>,
    )

    expect(await screen.findByRole('button', { name: /alice user/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /notifications/i })).toBeInTheDocument()

    const primaryNav = screen.getByRole('navigation', { name: /primary/i })
    expect(primaryNav.querySelector('a[href="/sign-in"]')).toBeNull()
    expect(primaryNav.querySelector('a[href="/sign-up"]')).toBeNull()

    await user.click(screen.getByRole('button', { name: /alice user/i }))
    await user.click(await screen.findByRole('menuitem', { name: /logout/i }))

    await waitFor(() => {
      expect(tokenStorage.getAccessToken()).toBeNull()
    })
  })
})
