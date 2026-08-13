export const YANGON_CENTER = { lat: 16.8409, lng: 96.1735 }

export function buildLocationQuery(parts: Array<string | null | undefined>): string {
  return parts
    .map((part) => part?.trim())
    .filter((part): part is string => Boolean(part))
    .join(', ')
}

export function parseCoordinatePair(
  latitude?: number | string | null,
  longitude?: number | string | null,
): { lat: number; lng: number } | null {
  if (latitude === undefined || latitude === null || longitude === undefined || longitude === null) {
    return null
  }
  if (String(latitude).trim() === '' || String(longitude).trim() === '') {
    return null
  }

  const lat = Number(latitude)
  const lng = Number(longitude)
  if (!Number.isFinite(lat) || !Number.isFinite(lng) || lat < -90 || lat > 90 || lng < -180 || lng > 180) {
    return null
  }

  return { lat, lng }
}

export function osmSearchUrl(query: string): string {
  return `https://www.openstreetmap.org/search?query=${encodeURIComponent(query)}`
}

export function osmMarkerUrl(lat: number, lng: number): string {
  return `https://www.openstreetmap.org/?mlat=${lat}&mlon=${lng}#map=16/${lat}/${lng}`
}

type NominatimHit = {
  lat: string
  lon: string
}

export async function geocodeNominatim(
  query: string,
  fetchImpl: typeof fetch = fetch,
): Promise<{ lat: number; lng: number } | null> {
  const trimmed = query.trim()
  if (!trimmed) {
    return null
  }

  const url = `https://nominatim.openstreetmap.org/search?format=jsonv2&limit=1&q=${encodeURIComponent(trimmed)}`
  const response = await fetchImpl(url, {
    headers: { Accept: 'application/json' },
  })
  if (!response.ok) {
    return null
  }

  const data = (await response.json()) as NominatimHit[]
  if (!Array.isArray(data) || data.length === 0) {
    return null
  }

  const lat = Number(data[0]?.lat)
  const lng = Number(data[0]?.lon)
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
    return null
  }

  return { lat, lng }
}
