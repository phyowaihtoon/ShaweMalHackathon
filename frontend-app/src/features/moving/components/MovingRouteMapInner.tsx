import L from 'leaflet'
import { useEffect, useMemo } from 'react'
import { MapContainer, Marker, TileLayer, useMap, useMapEvents } from 'react-leaflet'

import { YANGON_CENTER, parseCoordinatePair } from '@/features/houses/lib/geocode-location'

import type { MovingPinRole, MovingRouteMapProps } from './moving-route-map-types'

import 'leaflet/dist/leaflet.css'
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png'
import markerIcon from 'leaflet/dist/images/marker-icon.png'
import markerShadow from 'leaflet/dist/images/marker-shadow.png'

L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
})

const pickupIcon = L.divIcon({
  className: 'moving-pin',
  html: '<div style="width:22px;height:22px;border-radius:9999px;background:#0f766e;border:2px solid white;box-shadow:0 1px 4px rgba(0,0,0,.4)"></div>',
  iconSize: [22, 22],
  iconAnchor: [11, 11],
})

const dropoffIcon = L.divIcon({
  className: 'moving-pin',
  html: '<div style="width:22px;height:22px;border-radius:9999px;background:#c2410c;border:2px solid white;box-shadow:0 1px 4px rgba(0,0,0,.4)"></div>',
  iconSize: [22, 22],
  iconAnchor: [11, 11],
})

function FitPins({
  pickup,
  dropoff,
}: {
  pickup: { lat: number; lng: number } | null
  dropoff: { lat: number; lng: number } | null
}) {
  const map = useMap()

  useEffect(() => {
    if (pickup && dropoff) {
      map.fitBounds(
        [
          [pickup.lat, pickup.lng],
          [dropoff.lat, dropoff.lng],
        ],
        { padding: [28, 28], maxZoom: 15 },
      )
      return
    }

    const only = pickup ?? dropoff
    if (only) {
      map.setView([only.lat, only.lng], 14)
      return
    }

    map.setView([YANGON_CENTER.lat, YANGON_CENTER.lng], 12)
  }, [dropoff, map, pickup])

  return null
}

function MapClickHandler({
  pinTarget,
  onPinChange,
}: {
  pinTarget: MovingPinRole
  onPinChange: MovingRouteMapProps['onPinChange']
}) {
  useMapEvents({
    click(event) {
      onPinChange(pinTarget, { latitude: event.latlng.lat, longitude: event.latlng.lng })
    },
  })

  return null
}

export default function MovingRouteMapInner({
  pickupLatitude,
  pickupLongitude,
  dropoffLatitude,
  dropoffLongitude,
  pinTarget,
  onPinChange,
}: MovingRouteMapProps) {
  const pickup = useMemo(
    () => parseCoordinatePair(pickupLatitude, pickupLongitude),
    [pickupLatitude, pickupLongitude],
  )
  const dropoff = useMemo(
    () => parseCoordinatePair(dropoffLatitude, dropoffLongitude),
    [dropoffLatitude, dropoffLongitude],
  )

  return (
    <div className="h-72 overflow-hidden rounded-xl border bg-muted">
      <MapContainer
        center={[YANGON_CENTER.lat, YANGON_CENTER.lng]}
        zoom={12}
        className="h-full w-full"
        style={{ height: '100%', width: '100%' }}
        scrollWheelZoom
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <FitPins pickup={pickup} dropoff={dropoff} />
        <MapClickHandler pinTarget={pinTarget} onPinChange={onPinChange} />
        {pickup ? <Marker position={[pickup.lat, pickup.lng]} icon={pickupIcon} /> : null}
        {dropoff ? <Marker position={[dropoff.lat, dropoff.lng]} icon={dropoffIcon} /> : null}
      </MapContainer>
    </div>
  )
}
