import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

import { StarRating } from '@/features/reviews/components/StarRating'
import { renderWithProviders } from '@/test/utils'

describe('StarRating', () => {
  it('lets the user choose a rating with five star buttons', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()

    renderWithProviders(<StarRating value={2} onChange={onChange} />)

    expect(screen.getByRole('radio', { name: /1 star/i })).toBeInTheDocument()
    expect(screen.getByRole('radio', { name: /5 star/i })).toBeInTheDocument()
    expect(screen.queryByRole('combobox')).not.toBeInTheDocument()

    await user.click(screen.getByRole('radio', { name: /4 star/i }))
    expect(onChange).toHaveBeenCalledWith(4)
  })

  it('renders a read-only value without radio buttons', () => {
    renderWithProviders(<StarRating value={5} readOnly />)

    expect(screen.getByLabelText(/5 out of 5 stars/i)).toBeInTheDocument()
    expect(screen.queryByRole('radio')).not.toBeInTheDocument()
  })
})
