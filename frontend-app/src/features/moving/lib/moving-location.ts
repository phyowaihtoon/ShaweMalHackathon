import { buildLocationQuery, parseCoordinatePair } from '@/features/houses/lib/geocode-location'
import type { MasterDataItem } from '@/features/master-data/types'

export function yangonTownships(cities: MasterDataItem[]): MasterDataItem[] {
  return cities.filter((item) => {
    if (item.isActive === false) return false
    const stateName = item.state?.name?.toLowerCase() ?? ''
    if (stateName) {
      return stateName.includes('yangon') || stateName.includes('rangoon')
    }
    return /township/i.test(item.name)
  })
}

export function composeMovingAddress(street: string, township: string): string {
  return buildLocationQuery([street, township, 'Yangon', 'Myanmar'])
}

export function hasMapPin(latitude?: string, longitude?: string): boolean {
  return parseCoordinatePair(latitude, longitude) !== null
}
