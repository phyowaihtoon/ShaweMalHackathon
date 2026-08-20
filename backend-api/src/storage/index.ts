import { env } from '../config/env';
import { createDiskStorage } from './disk.storage';
import { createS3Storage } from './s3.storage';
import type { ObjectStorage } from './types';
import { createVercelBlobStorage } from './vercel-blob.storage';

let storageSingleton: ObjectStorage | undefined;

export const createStorage = (): ObjectStorage => {
  switch (env.storageDriver) {
    case 'disk':
      return createDiskStorage();
    case 'vercel-blob':
      return createVercelBlobStorage();
    case 's3':
      return createS3Storage();
    default: {
      const _exhaustive: never = env.storageDriver;
      throw new Error(`Unsupported STORAGE_DRIVER: ${String(_exhaustive)}`);
    }
  }
};

export const getStorage = (): ObjectStorage => {
  if (!storageSingleton) {
    storageSingleton = createStorage();
  }

  return storageSingleton;
};

/** Test helper to reset the singleton between suites. */
export const resetStorageForTests = (): void => {
  storageSingleton = undefined;
};

export type { ObjectStorage, PutObjectResult, StorageDriverName } from './types';
