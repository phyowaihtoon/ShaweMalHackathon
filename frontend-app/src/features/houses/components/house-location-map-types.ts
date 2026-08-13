export type HouseLocationMapProps = {
  streetAddress?: string | null
  cityName?: string | null
  stateName?: string | null
  latitude?: number | string | null
  longitude?: number | string | null
  interactive?: boolean
  disabled?: boolean
  onPinChange?: (coords: { latitude: number; longitude: number } | null) => void
}
