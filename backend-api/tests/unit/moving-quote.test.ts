import { calculateEstimatedPrice, suggestVehicleType, vehiclePointRangesOverlap } from '../../src/services/moving-quote';
import { haversineKm, roundDistanceKm } from '../../src/services/geocode.service';

describe('moving quote helpers', () => {
  it('suggests the vehicle whose point range contains total points', () => {
    const vehicles = [
      { id: 'small', name: 'Small Van', pointFrom: 0, pointTo: 20, pricePerKm: 900 },
      { id: 'truck', name: 'Light Truck', pointFrom: 21, pointTo: 80, pricePerKm: 1100 }
    ];

    expect(suggestVehicleType(14, vehicles).vehicle.id).toBe('small');
    expect(suggestVehicleType(44, vehicles).match).toBe('exact');
    expect(suggestVehicleType(44, vehicles).vehicle.id).toBe('truck');
  });

  it('falls back to the next higher range, then the largest type', () => {
    const vehicles = [
      { id: 'small', name: 'Small Van', pointFrom: 0, pointTo: 10, pricePerKm: 900 },
      { id: 'truck', name: 'Light Truck', pointFrom: 40, pointTo: 80, pricePerKm: 1100 }
    ];

    expect(suggestVehicleType(25, vehicles)).toEqual({
      vehicle: vehicles[1],
      match: 'closest'
    });
    expect(suggestVehicleType(200, vehicles).vehicle.id).toBe('truck');
  });

  it('detects overlapping vehicle point ranges', () => {
    expect(vehiclePointRangesOverlap(0, 20, 21, 40)).toBe(false);
    expect(vehiclePointRangesOverlap(0, 20, 20, 40)).toBe(true);
  });

  it('calculates estimated price from floors plus price per km times distance', () => {
    expect(
      calculateEstimatedPrice({
        pickupFloorSurcharge: 5000,
        dropoffFloorSurcharge: 10000,
        pricePerKm: 1100,
        distanceKm: 5
      })
    ).toBe(20500);
  });

  it('rounds haversine distance to one decimal with a 0.1 km minimum', () => {
    expect(roundDistanceKm(0)).toBe(0.1);
    const km = haversineKm({ latitude: 16.825, longitude: 96.13 }, { latitude: 16.81, longitude: 96.177 });
    expect(km).toBeGreaterThan(0.1);
    expect(String(km)).toMatch(/^\d+\.\d$/);
  });
});
