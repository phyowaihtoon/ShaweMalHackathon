import type { CorsOptions } from 'cors';

const normalizeOrigin = (value: string): string => value.trim().replace(/\/$/, '');

/**
 * Parses CORS_ORIGIN.
 * - unset / `*` → reflect request Origin (`true`; works with credentials)
 * - comma-separated list → allowlist (trailing slashes ignored)
 */
export const parseCorsOrigins = (value: string | undefined): true | string[] => {
  const raw = (value ?? '*').trim();
  if (!raw || raw === '*') {
    return true;
  }

  return raw
    .split(',')
    .map(normalizeOrigin)
    .filter(Boolean);
};

export const createCorsOriginOption = (value: string | undefined): CorsOptions['origin'] => {
  const allowed = parseCorsOrigins(value);
  if (allowed === true) {
    return true;
  }

  if (allowed.length === 1) {
    return allowed[0];
  }

  return (origin, callback) => {
    if (!origin) {
      callback(null, true);
      return;
    }

    const normalized = normalizeOrigin(origin);
    callback(null, allowed.includes(normalized));
  };
};
