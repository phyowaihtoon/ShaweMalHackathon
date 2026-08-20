import { STORAGE_DRIVERS, type StorageDriverName } from '../storage/types';

export const parseStorageDriver = (value: string | undefined): StorageDriverName => {
  const raw = (value ?? 'disk').trim().toLowerCase();
  if (!raw) {
    return 'disk';
  }

  if ((STORAGE_DRIVERS as readonly string[]).includes(raw)) {
    return raw as StorageDriverName;
  }

  throw new Error(`STORAGE_DRIVER must be one of: ${STORAGE_DRIVERS.join(', ')}.`);
};

export const parseBlobStoreAccess = (value: string | undefined): 'public' | 'private' => {
  const raw = (value ?? 'public').trim().toLowerCase();
  if (raw === 'public' || raw === 'private') {
    return raw;
  }

  throw new Error('BLOB_STORE_ACCESS must be "public" or "private".');
};
