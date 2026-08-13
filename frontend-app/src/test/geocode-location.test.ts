import { describe, expect, it, vi } from 'vitest'

import {
  buildLocationQuery,
  geocodeNominatim,
  parseCoordinatePair,
} from '@/features/houses/lib/geocode-location'

describe('geocode location helpers', () => {
  it('builds a comma-separated query and parses a valid coordinate pair', () => {
    expect(buildLocationQuery(['42 Inya Road', 'Kamayut Township', 'Yangon', 'Myanmar'])).toBe(
      '42 Inya Road, Kamayut Township, Yangon, Myanmar',
    )
    expect(parseCoordinatePair('16.84', '96.17')).toEqual({ lat: 16.84, lng: 96.17 })
    expect(parseCoordinatePair('16.84', '')).toBeNull()
  })

  it('returns the first Nominatim hit', async () => {
    const fetchImpl = vi.fn(async () => {
      return new Response(JSON.stringify([{ lat: '16.8294', lon: '96.1356' }]), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      })
    }) as unknown as typeof fetch

    await expect(geocodeNominatim('Kamayut Township, Yangon', fetchImpl)).resolves.toEqual({
      lat: 16.8294,
      lng: 96.1356,
    })
  })
})
