import type { UploadCategory } from '../utils/upload-path';

export const STORAGE_DRIVERS = ['disk', 'vercel-blob', 's3'] as const;

export type StorageDriverName = (typeof STORAGE_DRIVERS)[number];

export type BlobStoreAccess = 'public' | 'private';

export interface PutObjectInput {
  category: UploadCategory;
  /** Logical object key, e.g. uploads/houses/{uuid}.jpg */
  objectKey: string;
  buffer: Buffer;
  contentType: string;
}

export interface PutObjectResult {
  /** Value persisted in DB (relative uploads/... path for all drivers). */
  storedPath: string;
  objectKey: string;
  /** Public absolute URL when available (vercel-blob public store). */
  publicUrl?: string;
}

export interface GetObjectResult {
  buffer: Buffer;
  contentType: string;
}

export interface ObjectStorage {
  readonly driver: StorageDriverName;
  /** True when Express should mount local `/uploads` static files. */
  readonly servesLocalStatic: boolean;
  ensureReady(): Promise<void>;
  putObject(input: PutObjectInput): Promise<PutObjectResult>;
  getObject(objectKey: string): Promise<GetObjectResult>;
  /**
   * Resolve a browser-facing URL for a public object key, if the driver can.
   * Disk returns null (caller uses `/uploads/...` on the API origin).
   */
  resolvePublicUrl?(objectKey: string): Promise<string | null>;
}
