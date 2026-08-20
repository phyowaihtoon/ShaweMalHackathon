import type { ObjectStorage } from './types';

export const createS3Storage = (): ObjectStorage => {
  throw new Error(
    'STORAGE_DRIVER=s3 is not implemented yet. Use "disk" or "vercel-blob", or implement the S3 adapter.'
  );
};
