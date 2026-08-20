import path from 'node:path';

/**
 * Resolves where uploaded binaries are stored.
 * On Vercel the app filesystem is read-only except `/tmp`, so uploads go there
 * (ephemeral across cold starts / redeploys) unless UPLOAD_ROOT is set.
 */
export const resolveUploadRoot = (source: NodeJS.ProcessEnv = process.env): string => {
  if (source.UPLOAD_ROOT) {
    return path.resolve(source.UPLOAD_ROOT);
  }

  if (source.VERCEL) {
    return path.resolve('/tmp/uploads');
  }

  return path.resolve(process.cwd(), 'uploads');
};
