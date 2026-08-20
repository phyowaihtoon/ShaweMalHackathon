import path from 'node:path';

import { resolveUploadRoot } from '../../../src/config/upload-root';

describe('resolveUploadRoot', () => {
  it('uses UPLOAD_ROOT when set', () => {
    const resolved = resolveUploadRoot({
      UPLOAD_ROOT: '/custom/uploads'
    });

    expect(resolved).toBe(path.resolve('/custom/uploads'));
  });

  it('uses /tmp/uploads when VERCEL is set and UPLOAD_ROOT is empty', () => {
    const resolved = resolveUploadRoot({
      VERCEL: '1'
    });

    expect(resolved).toBe(path.resolve('/tmp/uploads'));
  });

  it('prefers UPLOAD_ROOT over VERCEL default', () => {
    const resolved = resolveUploadRoot({
      VERCEL: '1',
      UPLOAD_ROOT: '/override/uploads'
    });

    expect(resolved).toBe(path.resolve('/override/uploads'));
  });

  it('defaults to ./uploads locally', () => {
    const resolved = resolveUploadRoot({});

    expect(resolved).toBe(path.resolve(process.cwd(), 'uploads'));
  });
});
