import { createCorsOriginOption, parseCorsOrigins } from '../../../src/config/cors-origin';

describe('parseCorsOrigins', () => {
  it('treats unset and * as reflect-all', () => {
    expect(parseCorsOrigins(undefined)).toBe(true);
    expect(parseCorsOrigins('*')).toBe(true);
    expect(parseCorsOrigins('  *  ')).toBe(true);
  });

  it('parses a single origin and strips a trailing slash', () => {
    expect(parseCorsOrigins('https://shawe-mal-web-smoky.vercel.app/')).toEqual([
      'https://shawe-mal-web-smoky.vercel.app'
    ]);
  });

  it('parses a comma-separated allowlist', () => {
    expect(
      parseCorsOrigins('http://localhost:5173, https://shawe-mal-web-smoky.vercel.app/')
    ).toEqual(['http://localhost:5173', 'https://shawe-mal-web-smoky.vercel.app']);
  });
});

describe('createCorsOriginOption', () => {
  it('returns true for wildcard', () => {
    expect(createCorsOriginOption('*')).toBe(true);
  });

  it('returns a single string for one origin', () => {
    expect(createCorsOriginOption('https://shawe-mal-web-smoky.vercel.app')).toBe(
      'https://shawe-mal-web-smoky.vercel.app'
    );
  });

  it('allows matching origins from a list', async () => {
    const option = createCorsOriginOption(
      'http://localhost:5173,https://shawe-mal-web-smoky.vercel.app'
    );
    expect(typeof option).toBe('function');
    if (typeof option !== 'function') {
      return;
    }

    const allowed = await new Promise<boolean>((resolve, reject) => {
      option('https://shawe-mal-web-smoky.vercel.app', (err, result) => {
        if (err) {
          reject(err);
          return;
        }
        resolve(Boolean(result));
      });
    });

    expect(allowed).toBe(true);
  });

  it('rejects non-matching origins from a list', async () => {
    const option = createCorsOriginOption(
      'http://localhost:5173,https://shawe-mal-web-smoky.vercel.app'
    );
    expect(typeof option).toBe('function');
    if (typeof option !== 'function') {
      return;
    }

    const allowed = await new Promise<boolean>((resolve, reject) => {
      option('https://evil.example', (err, result) => {
        if (err) {
          reject(err);
          return;
        }
        resolve(Boolean(result));
      });
    });

    expect(allowed).toBe(false);
  });
});
