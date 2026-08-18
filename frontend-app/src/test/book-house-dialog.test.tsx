import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

import { BookHouseDialog } from '@/features/houses/components/BookHouseDialog'
import { renderWithProviders } from '@/test/utils'

describe('book house dialog', () => {
  it('shows a styled confirmation and confirms the booking', async () => {
    const user = userEvent.setup()
    const onConfirm = vi.fn()
    const onDismiss = vi.fn()

    renderWithProviders(
      <BookHouseDialog open houseTitle="River View Condo" onConfirm={onConfirm} onDismiss={onDismiss} />,
    )

    expect(screen.getByRole('dialog', { name: /book this house/i })).toBeInTheDocument()
    expect(screen.getByText(/river view condo/i)).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: /not now/i }))
    expect(onDismiss).toHaveBeenCalled()

    await user.click(screen.getByRole('button', { name: /book house/i }))
    expect(onConfirm).toHaveBeenCalled()
  })
})
