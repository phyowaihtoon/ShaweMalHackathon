import L from 'leaflet'
import { useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { MapContainer, Marker, TileLayer, useMap, useMapEvents } from 'react-leaflet'

import { Button } from '@/components/ui/button'
import {
  YANGON_CENTER,
  buildLocationQuery,
  geocodeNominatim,
  osmMarkerUrl,
  osmSearchUrl,
  parseCoordinatePair,
} from '@/features/houses/lib/geocode-location'

import type { HouseLocationMapProps } from './house-location-map-types'

import 'leaflet/dist/leaflet.css'
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png'
import markerIcon from 'leaflet/dist/images/marker-icon.png'
import markerShadow from 'leaflet/dist/images/marker-shadow.png'

L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
})

type MapView = {
  lat: number
  lng: number
  exact: boolean
}

function Recenter({ lat, lng, zoom }: { lat: number; lng: number; zoom: number }) {
  const map = useMap()

  useEffect(() => {
    map.setView([lat, lng], zoom)
  }, [lat, lng, map, zoom])

  return null
}

function MapClickHandler({
  enabled,
  onSelect,
}: {
  enabled: boolean
  onSelect: (lat: number, lng: number) => void
}) {
  useMapEvents({
    click(event) {
      if (!enabled) return
      onSelect(event.latlng.lat, event.latlng.lng)
    },
  })

  return null
}

export default function HouseLocationMapInner({
  streetAddress,
  cityName,
  stateName,
  latitude,
  longitude,
  interactive = false,
  disabled = false,
  onPinChange,
}: HouseLocationMapProps) {
  const { t } = useTranslation()
  const stored = parseCoordinatePair(latitude, longitude)
  const query = useMemo(
    () => buildLocationQuery([streetAddress, cityName, stateName, 'Myanmar']),
    [cityName, stateName, streetAddress],
  )
  const [view, setView] = useState<MapView | null>(stored ? { ...stored, exact: true } : null)
  const [lookupFailed, setLookupFailed] = useState(false)

  useEffect(() => {
    if (stored) {
      setView({ ...stored, exact: true })
      setLookupFailed(false)
      return
    }

    let cancelled = false
    setView(null)
    setLookupFailed(false)

    void geocodeNominatim(query)
      .then((result) => {
        if (cancelled) return
        if (!result) {
          setLookupFailed(true)
          setView({ ...YANGON_CENTER, exact: false })
          return
        }
        setView({ ...result, exact: false })
      })
      .catch(() => {
        if (cancelled) return
        setLookupFailed(true)
        setView({ ...YANGON_CENTER, exact: false })
      })

    return () => {
      cancelled = true
    }
  }, [query, stored?.lat, stored?.lng])

  const canEdit = interactive && !disabled
  const zoom = view?.exact ? 16 : 13
  const osmHref = view
    ? view.exact
      ? osmMarkerUrl(view.lat, view.lng)
      : osmSearchUrl(query || `${YANGON_CENTER.lat},${YANGON_CENTER.lng}`)
    : osmSearchUrl(query)

  const onSelect = (lat: number, lng: number) => {
    setView({ lat, lng, exact: true })
    setLookupFailed(false)
    onPinChange?.({ latitude: lat, longitude: lng })
  }

  const onClear = () => {
    onPinChange?.(null)
  }

  return (
    <div className="space-y-2">
      <div className="h-64 overflow-hidden rounded-xl border bg-muted">
        {view ? (
          <MapContainer
            center={[view.lat, view.lng]}
            zoom={zoom}
            className="h-full w-full"
            style={{ height: '100%', width: '100%' }}
            scrollWheelZoom={!disabled}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <Recenter lat={view.lat} lng={view.lng} zoom={zoom} />
            <MapClickHandler enabled={canEdit} onSelect={onSelect} />
            {(view.exact || stored || !lookupFailed) ? (
              <Marker position={[view.lat, view.lng]} />
            ) : null}
          </MapContainer>
        ) : (
          <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
            {t('common.loading')}
          </div>
        )}
      </div>
      <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-muted-foreground">
        <p>
          {stored || view?.exact
            ? t('houses.mapExact')
            : lookupFailed
              ? t('houses.mapUnavailable')
              : t('houses.mapApproximate')}
        </p>
        <div className="flex flex-wrap gap-2">
          {canEdit && stored ? (
            <Button type="button" variant="outline" size="sm" onClick={onClear}>
              {t('agent.houses.clearPin')}
            </Button>
          ) : null}
          <a className="underline-offset-4 hover:underline" href={osmHref} rel="noreferrer" target="_blank">
            {t('houses.openInOsm')}
          </a>
        </div>
      </div>
      {canEdit ? <p className="text-xs text-muted-foreground">{t('agent.houses.pinHint')}</p> : null}
    </div>
  )
}
