import { screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { HireMovingEasySteps } from '@/features/moving/components/HireMovingEasySteps'
import { renderWithProviders } from '@/test/utils'

describe('hire moving easy steps', () => {
  it('shows four on-demand moving steps', () => {
    renderWithProviders(<HireMovingEasySteps />)

    expect(screen.getByRole('heading', { name: /4 easy steps/i })).toBeInTheDocument()
    expect(screen.getByText('Pin your pickup & destination')).toBeInTheDocument()
    expect(screen.getByText("Tell us what you're moving")).toBeInTheDocument()
    expect(screen.getByText('See your vehicle & price instantly')).toBeInTheDocument()
    expect(screen.getByText('Book with confidence & stay updated')).toBeInTheDocument()
  })
})
