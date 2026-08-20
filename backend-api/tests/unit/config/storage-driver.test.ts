import { parseBlobStoreAccess, parseStorageDriver } from '../../../src/config/storage-driver';

describe('parseStorageDriver', () => {
  it('defaults to disk', () => {
    expect(parseStorageDriver(undefined)).toBe('disk');
    expect(parseStorageDriver('')).toBe('disk');
  });

  it('accepts known drivers case-insensitively', () => {
    expect(parseStorageDriver('disk')).toBe('disk');
    expect(parseStorageDriver('Vercel-Blob')).toBe('vercel-blob');
    expect(parseStorageDriver('s3')).toBe('s3');
  });

  it('rejects unknown drivers', () => {
    expect(() => parseStorageDriver('gcs')).toThrow(/STORAGE_DRIVER/);
  });
});

describe('parseBlobStoreAccess', () => {
  it('defaults to public', () => {
    expect(parseBlobStoreAccess(undefined)).toBe('public');
  });

  it('accepts public and private', () => {
    expect(parseBlobStoreAccess('private')).toBe('private');
    expect(parseBlobStoreAccess('PUBLIC')).toBe('public');
  });

  it('rejects invalid values', () => {
    expect(() => parseBlobStoreAccess('shared')).toThrow(/BLOB_STORE_ACCESS/);
  });
});
