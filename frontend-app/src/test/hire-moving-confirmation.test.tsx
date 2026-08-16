import { screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { HireMovingStepConfirmation } from '@/features/moving/components/HireMovingStepConfirmation'
import { renderWithProviders } from '@/test/utils'

describe('hire moving confirmation', () => {
  it('shows order number, booker contact, and driver contact notice', () => {
    renderWithProviders(
      <HireMovingStepConfirmation
        orderNumber="MOV-20260815-000001"
        requestId="moving-1"
        userName="Aung Aung"
        userPhone="0911111111"
        userEmail="aung@example.com"
      />,
    )

    expect(screen.getByText('MOV-20260815-000001')).toBeInTheDocument()
    expect(screen.getByText('Aung Aung')).toBeInTheDocument()
    expect(screen.getByText('0911111111')).toBeInTheDocument()
    expect(screen.getByText('aung@example.com')).toBeInTheDocument()
    expect(screen.getByText(/The assigned driver may contact you using above contact information/)).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /track status/i })).toHaveAttribute('href', '/moving-status/moving-1')
  })
})
