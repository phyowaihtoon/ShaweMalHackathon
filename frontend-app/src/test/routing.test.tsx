import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Route, Routes } from 'react-router'
import { describe, expect, it, vi } from 'vitest'

import { PublicLayout } from '@/features/public/layout/PublicLayout'
import { AboutUsPage } from '@/features/public/pages/AboutUsPage'
import { AgentRegisterPage } from '@/features/public/pages/AgentRegisterPage'
import { HomePage } from '@/features/public/pages/HomePage'
import { SignInPage } from '@/features/auth/pages/SignInPage'
import { SignUpPage } from '@/features/auth/pages/SignUpPage'
import { renderWithProviders } from '@/test/utils'

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

describe('public routing', () => {
  it('navigates to each public route heading', async () => {
    const user = userEvent.setup()

    renderWithProviders(
      <Routes>
        <Route path="/" element={<PublicLayout />}>
          <Route index element={<HomePage />} />
          <Route path="about-us" element={<AboutUsPage />} />
          <Route path="agent-register" element={<AgentRegisterPage />} />
          <Route path="sign-up" element={<SignUpPage />} />
          <Route path="sign-in" element={<SignInPage />} />
        </Route>
      </Routes>,
    )

    expect(await screen.findByRole('heading', { name: /find your next home with shawe mal/i })).toBeInTheDocument()

    await user.click(screen.getByRole('link', { name: /about us/i }))
    expect(await screen.findByRole('heading', { name: /about us/i })).toBeInTheDocument()

    await user.click(screen.getByRole('link', { name: /agent register/i }))
    // Unauthenticated users are redirected to sign-in before agent form.
    expect(await screen.findByRole('heading', { name: /sign in/i })).toBeInTheDocument()

    const primaryNav = screen.getByRole('navigation', { name: /primary/i })
    await user.click(primaryNav.querySelector('a[href="/sign-up"]') as HTMLAnchorElement)
    expect(await screen.findByRole('heading', { name: /sign up/i })).toBeInTheDocument()

    await user.click(primaryNav.querySelector('a[href="/sign-in"]') as HTMLAnchorElement)
    expect(await screen.findByRole('heading', { name: /sign in/i })).toBeInTheDocument()
  })
})
