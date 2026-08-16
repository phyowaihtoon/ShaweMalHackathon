import { describe, expect, it } from 'vitest'

import { composeMovingAddress, hasMapPin, yangonTownships } from '@/features/moving/lib/moving-location'

describe('moving location helpers', () => {
  it('composes a Yangon address and requires both pin coordinates', () => {
    expect(composeMovingAddress('42 Inya Road', 'Kamayut Township')).toBe(
      '42 Inya Road, Kamayut Township, Yangon, Myanmar',
    )
    expect(hasMapPin('16.82', '96.13')).toBe(true)
    expect(hasMapPin('', '96.13')).toBe(false)
  })

  it('keeps Yangon townships from city master data', () => {
    const items = yangonTownships([
      { id: '1', name: 'Kamayut Township', state: { name: 'Yangon' } },
      { id: '2', name: 'Chanayethazan Township', state: { name: 'Mandalay' }, isActive: true },
      { id: '3', name: 'Hidden', isActive: false, state: { name: 'Yangon' } },
    ])
    expect(items.map((item) => item.name)).toEqual(['Kamayut Township'])
  })
})
