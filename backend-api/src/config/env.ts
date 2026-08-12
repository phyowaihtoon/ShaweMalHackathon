import dotenv from 'dotenv';

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

export const env = {
  nodeEnv: process.env.NODE_ENV ?? 'development',
  port: Number(process.env.PORT ?? 4000),
  databaseUrl: requireEnv('DATABASE_URL'),
  jwtSecret: requireEnv('JWT_SECRET'),
  jwtExpiresIn: process.env.JWT_EXPIRES_IN ?? '15m',
  jwtAlgorithm: jwtAlgorithmRaw as JwtAlgorithm,
  corsOrigin: process.env.CORS_ORIGIN ?? '*',
  bcryptSaltRounds: parseNumber(process.env.BCRYPT_SALT_ROUNDS, 12)
} as const;
