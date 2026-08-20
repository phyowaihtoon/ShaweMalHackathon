import dotenv from 'dotenv';

import { DEFAULT_UPLOAD_ALLOWED_MIME } from '../utils/upload-path';
import { resolveDatabaseUrls } from './database';
import { parseBlobStoreAccess, parseStorageDriver } from './storage-driver';
import { resolveUploadRoot } from './upload-root';

dotenv.config();

type JwtAlgorithm = 'HS256' | 'HS384' | 'HS512';

const ALLOWED_ALGORITHMS: JwtAlgorithm[] = ['HS256', 'HS384', 'HS512'];

const parseNumber = (value: string | undefined, fallback: number): number => {
  if (!value) {
    return fallback;
  }

  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed <= 0) {
    throw new Error('BCRYPT_SALT_ROUNDS must be a positive integer.');
  }

  return parsed;
};

const parsePositiveInt = (value: string | undefined, fallback: number, key: string): number => {
  if (!value) {
    return fallback;
  }

  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed <= 0) {
    throw new Error(`${key} must be a positive integer.`);
  }

  return parsed;
};

const requireEnv = (key: string): string => {
  const value = process.env[key];
  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`);
  }

  return value;
};

const jwtAlgorithmRaw = process.env.JWT_ALGORITHM ?? 'HS256';
if (!ALLOWED_ALGORITHMS.includes(jwtAlgorithmRaw as JwtAlgorithm)) {
  throw new Error(`Unsupported JWT_ALGORITHM: ${jwtAlgorithmRaw}`);
}

const database = resolveDatabaseUrls();
const storageDriver = parseStorageDriver(process.env.STORAGE_DRIVER);
const blobStoreAccess = parseBlobStoreAccess(process.env.BLOB_STORE_ACCESS);
const uploadAllowedMime = (process.env.UPLOAD_ALLOWED_MIME ?? DEFAULT_UPLOAD_ALLOWED_MIME.join(','))
  .split(',')
  .map((item) => item.trim())
  .filter(Boolean);

export const env = {
  nodeEnv: process.env.NODE_ENV ?? 'development',
  port: Number(process.env.PORT ?? 4000),
  databaseTarget: database.target,
  databaseUrl: database.databaseUrl,
  databaseDirectUrl: database.directUrl,
  jwtSecret: requireEnv('JWT_SECRET'),
  jwtExpiresIn: process.env.JWT_EXPIRES_IN ?? '15m',
  jwtAlgorithm: jwtAlgorithmRaw as JwtAlgorithm,
  corsOrigin: process.env.CORS_ORIGIN ?? '*',
  bcryptSaltRounds: parseNumber(process.env.BCRYPT_SALT_ROUNDS, 12),
  storageDriver,
  blobStoreAccess,
  uploadRoot: resolveUploadRoot(),
  uploadMaxBytes: parsePositiveInt(process.env.UPLOAD_MAX_BYTES, 5 * 1024 * 1024, 'UPLOAD_MAX_BYTES'),
  uploadAllowedMime
} as const;
