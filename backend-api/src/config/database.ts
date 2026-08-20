export type DatabaseTarget = 'local' | 'supabase';

export interface ResolvedDatabaseUrls {
  target: DatabaseTarget;
  databaseUrl: string;
  directUrl: string;
}

const parseTarget = (value: string | undefined): DatabaseTarget => {
  const target = (value ?? 'local').trim().toLowerCase();
  if (target === 'local' || target === 'supabase') {
    return target;
  }

  throw new Error('DATABASE_TARGET must be "local" or "supabase".');
};

const appendQueryParam = (connectionString: string, key: string, value: string): string => {
  if (new RegExp(`[?&]${key}=`, 'i').test(connectionString)) {
    return connectionString;
  }

  return connectionString.includes('?')
    ? `${connectionString}&${key}=${value}`
    : `${connectionString}?${key}=${value}`;
};

const ensureSslMode = (connectionString: string): string => {
  // Node pg currently treats sslmode=require as verify-full. uselibpqcompat restores
  // encrypt-only "require" so pooler TLS works behind local SSL inspection.
  return appendQueryParam(appendQueryParam(connectionString, 'uselibpqcompat', 'true'), 'sslmode', 'require');
};

export const toPrismaPgConfig = (
  connectionString: string,
  target: DatabaseTarget
): { connectionString: string; ssl?: { rejectUnauthorized: boolean } } => {
  if (target !== 'supabase') {
    return { connectionString };
  }

  return {
    connectionString: ensureSslMode(connectionString),
    ssl: { rejectUnauthorized: false }
  };
};

export const resolveDatabaseUrls = (
  source: NodeJS.ProcessEnv = process.env
): ResolvedDatabaseUrls => {
  const target = parseTarget(source.DATABASE_TARGET);

  if (target === 'local') {
    const databaseUrl = source.LOCAL_DATABASE_URL || source.DATABASE_URL;
    if (!databaseUrl) {
      throw new Error(
        'Missing local database URL. Set LOCAL_DATABASE_URL or DATABASE_URL when DATABASE_TARGET=local.'
      );
    }

    return {
      target,
      databaseUrl,
      directUrl: databaseUrl
    };
  }

  const databaseUrl = source.SUPABASE_DATABASE_URL;
  const directUrl = source.SUPABASE_DIRECT_URL;
  if (!databaseUrl || !directUrl) {
    throw new Error(
      'Missing Supabase database URLs. Set SUPABASE_DATABASE_URL and SUPABASE_DIRECT_URL when DATABASE_TARGET=supabase.'
    );
  }

  return {
    target,
    databaseUrl: ensureSslMode(databaseUrl),
    directUrl: ensureSslMode(directUrl)
  };
};
