import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

import { CancelBookingDialog } from '@/features/houses/components/CancelBookingDialog'
import { renderWithProviders } from '@/test/utils'

describe('cancel booking dialog', () => {
  it('shows a styled confirmation and confirms cancellation', async () => {
    const user = userEvent.setup()
    const onConfirm = vi.fn()
    const onDismiss = vi.fn()

    renderWithProviders(
      <CancelBookingDialog open houseTitle="River View Condo" onConfirm={onConfirm} onDismiss={onDismiss} />,
    )

    expect(screen.getByRole('dialog', { name: /cancel this booking/i })).toBeInTheDocument()
    expect(screen.getByText(/river view condo/i)).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: /keep booking/i }))
    expect(onDismiss).toHaveBeenCalled()

    await user.click(screen.getByRole('button', { name: /cancel booking/i }))
    expect(onConfirm).toHaveBeenCalled()
  })
})
