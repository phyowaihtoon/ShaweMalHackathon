import { screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { HouseCard } from '@/features/houses/components/HouseCard'
import { renderWithProviders } from '@/test/utils'

const house = {
  id: 'h1',
  title: 'Golden Condo',
  monthlyFees: 450000,
  propertyType: { id: 'pt1', name: 'Condo' },
  city: { id: 'c1', name: 'Yangon' },
  thumbnail: null,
  bedrooms: 2,
  bathrooms: 1,
}

describe('house card availability', () => {
  it('shows available when the house can be booked', () => {
    renderWithProviders(<HouseCard house={{ ...house, availability: 'AVAILABLE' }} />)

    expect(screen.getByText('Available')).toBeInTheDocument()
  })

  it('shows not available when the listing is closed', () => {
    renderWithProviders(<HouseCard house={{ ...house, availability: 'NOT_AVAILABLE' }} />)

    expect(screen.getByText('Not available')).toBeInTheDocument()
  })
})
