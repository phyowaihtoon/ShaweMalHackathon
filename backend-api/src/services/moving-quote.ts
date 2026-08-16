export type VehicleTypeRange = {
  id: string;
  name: string;
  pointFrom: number | null;
  pointTo: number | null;
  pricePerKm: number | null;
};

export type VehicleSuggestionMatch = 'exact' | 'closest';

export const vehiclePointRangesOverlap = (
  leftFrom: number,
  leftTo: number,
  rightFrom: number,
  rightTo: number
): boolean => {
  return leftFrom <= rightTo && rightFrom <= leftTo;
};

export const suggestVehicleType = (
  totalPoints: number,
  vehicleTypes: VehicleTypeRange[]
): { vehicle: VehicleTypeRange; match: VehicleSuggestionMatch } => {
  const ranged = vehicleTypes
    .filter(
      (item) =>
        item.pointFrom !== null &&
        item.pointTo !== null &&
        Number.isFinite(item.pointFrom) &&
        Number.isFinite(item.pointTo)
    )
    .sort((left, right) => (left.pointFrom ?? 0) - (right.pointFrom ?? 0));

  if (ranged.length === 0) {
    throw new Error('No vehicle types with point ranges are available.');
  }

  const exact = ranged.find(
    (item) => totalPoints >= (item.pointFrom as number) && totalPoints <= (item.pointTo as number)
  );
  if (exact) {
    return { vehicle: exact, match: 'exact' };
  }

  const higher = ranged.find((item) => (item.pointFrom as number) >= totalPoints);
  if (higher) {
    return { vehicle: higher, match: 'closest' };
  }

  const largest = ranged[ranged.length - 1];
  if (!largest) {
    throw new Error('No vehicle types with point ranges are available.');
  }

  return { vehicle: largest, match: 'closest' };
};

export const calculateEstimatedPrice = (input: {
  pickupFloorSurcharge: number;
  dropoffFloorSurcharge: number;
  pricePerKm: number;
  distanceKm: number;
}): number => {
  const estimated =
    input.pickupFloorSurcharge + input.dropoffFloorSurcharge + input.pricePerKm * input.distanceKm;
  return Math.round(estimated * 100) / 100;
};
