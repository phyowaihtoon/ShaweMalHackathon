import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'

import { SignInPage } from '@/features/auth/pages/SignInPage'
import { SignUpPage } from '@/features/auth/pages/SignUpPage'
import { renderWithProviders } from '@/test/utils'

describe('auth form validation', () => {
  it('shows required errors on empty sign-in submit', async () => {
    const user = userEvent.setup()
    renderWithProviders(<SignInPage />)

    await user.click(screen.getByRole('button', { name: /login/i }))

    expect(await screen.findAllByText(/this field is required/i)).toHaveLength(2)
  })

  it('shows password mismatch on sign-up', async () => {
    const user = userEvent.setup()
    renderWithProviders(<SignUpPage />)

    await user.type(screen.getByLabelText(/^name$/i), 'Tester')
    await user.type(screen.getByLabelText(/^email$/i), 'tester@example.com')
    await user.type(screen.getByLabelText(/phone number/i), '0912345678')
    await user.type(screen.getByLabelText(/^password$/i), 'password123')
    await user.type(screen.getByLabelText(/confirm password/i), 'password456')
    await user.click(screen.getByRole('button', { name: /register/i }))

    expect(await screen.findByText(/passwords do not match/i)).toBeInTheDocument()
  })
})
