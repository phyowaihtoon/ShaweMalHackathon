import { describe, expect, it } from 'vitest'

import { isHouseAvailable } from '@/features/houses/lib/availability'

describe('house availability', () => {
  it('treats missing and available values as available', () => {
    expect(isHouseAvailable(undefined)).toBe(true)
    expect(isHouseAvailable('AVAILABLE')).toBe(true)
    expect(isHouseAvailable('available')).toBe(true)
  })

  it('treats not available values as unavailable', () => {
    expect(isHouseAvailable('NOT_AVAILABLE')).toBe(false)
    expect(isHouseAvailable('not_available')).toBe(false)
    expect(isHouseAvailable('Not Available')).toBe(false)
  })
})
