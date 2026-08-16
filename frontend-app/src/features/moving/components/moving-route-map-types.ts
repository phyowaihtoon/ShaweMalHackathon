export type MovingPinRole = 'pickup' | 'dropoff'

export type MovingRouteMapProps = {
  pickupLatitude?: string
  pickupLongitude?: string
  dropoffLatitude?: string
  dropoffLongitude?: string
  pinTarget: MovingPinRole
  onPinChange: (role: MovingPinRole, point: { latitude: number; longitude: number }) => void
}
