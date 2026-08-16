import { screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { HireMovingStepProgress } from '@/features/moving/components/HireMovingStepProgress'
import { renderWithProviders } from '@/test/utils'

describe('hire moving step progress', () => {
  it('highlights the current step among four connected circles', () => {
    renderWithProviders(<HireMovingStepProgress current={2} />)

    const current = screen.getByLabelText('Step 2 of 4')
    expect(current).toHaveAttribute('aria-current', 'step')
    expect(screen.getByLabelText('Step 1 of 4')).not.toHaveAttribute('aria-current')
    expect(screen.getByLabelText('Moving progress')).toBeInTheDocument()
  })
})
