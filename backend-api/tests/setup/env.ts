process.env.NODE_ENV = 'test';
process.env.PORT = '4010';
process.env.DATABASE_URL = process.env.DATABASE_URL ?? 'mysql://test:test@localhost:3306/shwemal_test';
process.env.JWT_SECRET = process.env.JWT_SECRET ?? 'test-secret';
process.env.JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN ?? '15m';
process.env.JWT_ALGORITHM = process.env.JWT_ALGORITHM ?? 'HS256';
process.env.CORS_ORIGIN = process.env.CORS_ORIGIN ?? '*';
process.env.BCRYPT_SALT_ROUNDS = process.env.BCRYPT_SALT_ROUNDS ?? '4';
