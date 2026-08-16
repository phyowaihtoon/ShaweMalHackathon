import {
  buildGeocodeQueryCandidates,
  isWithinYangon,
  parseOptionalGeoPoint
} from '../../src/services/geocode.service';

describe('geocode helpers', () => {
  it('appends Yangon, Myanmar when the query has no city', () => {
    expect(buildGeocodeQueryCandidates('Hledan Road')).toEqual([
      'Hledan Road',
      'Hledan Road, Yangon, Myanmar'
    ]);
    expect(buildGeocodeQueryCandidates('Kamayut Township, Yangon')).toEqual([
      'Kamayut Township, Yangon',
      'Kamayut Township, Yangon, Myanmar'
    ]);
  });

  it('parses optional coordinates and rejects values outside Yangon', () => {
    expect(parseOptionalGeoPoint(16.84, 96.17)).toEqual({ latitude: 16.84, longitude: 96.17 });
    expect(parseOptionalGeoPoint(undefined, 96.17)).toBeNull();
    expect(isWithinYangon({ latitude: 16.84, longitude: 96.17 })).toBe(true);
    expect(isWithinYangon({ latitude: 21.9, longitude: 96.1 })).toBe(false);
  });
});
