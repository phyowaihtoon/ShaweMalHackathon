import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

import { CancelDriverJobDialog } from '@/features/driver/components/CancelDriverJobDialog'
import { renderWithProviders } from '@/test/utils'

describe('cancel driver job dialog', () => {
  it('requires a cancellation reason before confirming', async () => {
    const user = userEvent.setup()
    const onConfirm = vi.fn()
    const onDismiss = vi.fn()

    renderWithProviders(
      <CancelDriverJobDialog open orderLabel="MOV-1001" onConfirm={onConfirm} onDismiss={onDismiss} />,
    )

    expect(screen.getByRole('dialog', { name: /cancel this job/i })).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: /cancel job/i }))
    expect(await screen.findByRole('alert')).toHaveTextContent(/^Cancellation reason is required\.$/)
    expect(onConfirm).not.toHaveBeenCalled()

    await user.type(screen.getByLabelText(/cancellation reason/i), 'Vehicle unavailable today')
    await user.click(screen.getByRole('button', { name: /cancel job/i }))
    expect(onConfirm).toHaveBeenCalledWith('Vehicle unavailable today')
  })
})
