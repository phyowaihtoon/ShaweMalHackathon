import { ApiError } from '../utils/api-error';

export type GeoPoint = {
  latitude: number;
  longitude: number;
};

/** Generous bounding box around Yangon for map-pin validation. */
export const YANGON_BOUNDS = {
  minLatitude: 16.65,
  maxLatitude: 17.2,
  minLongitude: 95.9,
  maxLongitude: 96.5
};

export const roundDistanceKm = (km: number): number => {
  if (!Number.isFinite(km) || km <= 0) {
    return 0.1;
  }

  return Math.max(0.1, Math.round(km * 10) / 10);
};

export const haversineKm = (pickup: GeoPoint, dropoff: GeoPoint): number => {
  const toRad = (value: number) => (value * Math.PI) / 180;
  const earthRadiusKm = 6371;
  const dLat = toRad(dropoff.latitude - pickup.latitude);
  const dLon = toRad(dropoff.longitude - pickup.longitude);
  const lat1 = toRad(pickup.latitude);
  const lat2 = toRad(dropoff.latitude);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return roundDistanceKm(earthRadiusKm * c);
};

export const parseOptionalGeoPoint = (
  latitude?: number | null,
  longitude?: number | null
): GeoPoint | null => {
  if (latitude === null || latitude === undefined || longitude === null || longitude === undefined) {
    return null;
  }

  if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
    return null;
  }

  if (latitude < -90 || latitude > 90 || longitude < -180 || longitude > 180) {
    return null;
  }

  return { latitude, longitude };
};

export const isWithinYangon = (point: GeoPoint): boolean => {
  return (
    point.latitude >= YANGON_BOUNDS.minLatitude &&
    point.latitude <= YANGON_BOUNDS.maxLatitude &&
    point.longitude >= YANGON_BOUNDS.minLongitude &&
    point.longitude <= YANGON_BOUNDS.maxLongitude
  );
};

export const buildGeocodeQueryCandidates = (address: string): string[] => {
  const trimmed = address.trim();
  if (!trimmed) {
    return [];
  }

  const candidates = [trimmed];
  const lower = trimmed.toLowerCase();
  if (!lower.includes('yangon') && !lower.includes('rangoon')) {
    candidates.push(`${trimmed}, Yangon, Myanmar`);
  } else if (!lower.includes('myanmar') && !lower.includes('burma')) {
    candidates.push(`${trimmed}, Myanmar`);
  }

  return [...new Set(candidates)];
};

const searchNominatim = async (query: string): Promise<GeoPoint | null> => {
  const params = new URLSearchParams({
    format: 'jsonv2',
    limit: '1',
    q: query,
    countrycodes: 'mm',
    viewbox: `${YANGON_BOUNDS.minLongitude},${YANGON_BOUNDS.maxLatitude},${YANGON_BOUNDS.maxLongitude},${YANGON_BOUNDS.minLatitude}`,
    bounded: '0'
  });
  const url = `https://nominatim.openstreetmap.org/search?${params.toString()}`;
  const response = await fetch(url, {
    headers: {
      Accept: 'application/json',
      'User-Agent': 'ShaweMalApp/1.0 (moving-quote)'
    }
  });

  if (!response.ok) {
    return null;
  }

  const data = (await response.json()) as Array<{ lat?: string; lon?: string }>;
  const lat = Number(data[0]?.lat);
  const lon = Number(data[0]?.lon);
  if (!Array.isArray(data) || data.length === 0 || !Number.isFinite(lat) || !Number.isFinite(lon)) {
    return null;
  }

  return { latitude: lat, longitude: lon };
};

export const geocodeAddress = async (address: string): Promise<GeoPoint> => {
  const candidates = buildGeocodeQueryCandidates(address);
  if (candidates.length === 0) {
    throw new ApiError(400, 'ADDRESS_GEOCODE_FAILED', 'Address is required to calculate distance.');
  }

  for (const query of candidates) {
    const hit = await searchNominatim(query);
    if (hit) {
      return hit;
    }
  }

  throw new ApiError(
    400,
    'ADDRESS_GEOCODE_FAILED',
    `Could not locate address: ${address.trim()}. Choose a Yangon township and drop a pin on the map.`
  );
};

export const resolveMovingLocation = async (
  address: string,
  latitude?: number | null,
  longitude?: number | null
): Promise<GeoPoint> => {
  const provided = parseOptionalGeoPoint(latitude ?? null, longitude ?? null);
  if (provided) {
    if (!isWithinYangon(provided)) {
      throw new ApiError(
        400,
        'ADDRESS_GEOCODE_FAILED',
        'Map pins must be inside the Yangon service area.'
      );
    }
    return provided;
  }

  return geocodeAddress(address);
};
