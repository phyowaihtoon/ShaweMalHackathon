import { NextFunction, Request, Response } from 'express';

import { getStorage } from '../storage';
import { isPublicUploadRelativePath } from '../services/upload.service';

/**
 * Serves public upload objects when the active storage driver is not local disk.
 * - Prefer redirect to a CDN/public Blob URL when available.
 * - Otherwise stream bytes from the storage driver.
 */
export const remotePublicUploadsMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const storage = getStorage();
  if (storage.servesLocalStatic) {
    next();
    return;
  }

  const normalized = req.path.replace(/\\/g, '/');
  if (normalized === '/docs' || normalized.startsWith('/docs/')) {
    res.status(404).end();
    return;
  }

  const objectKey = `uploads${normalized.startsWith('/') ? normalized : `/${normalized}`}`;
  if (!isPublicUploadRelativePath(objectKey)) {
    res.status(404).end();
    return;
  }

  try {
    if (storage.resolvePublicUrl) {
      const publicUrl = await storage.resolvePublicUrl(objectKey);
      if (publicUrl) {
        res.redirect(302, publicUrl);
        return;
      }
    }

    const object = await storage.getObject(objectKey);
    res.setHeader('Content-Type', object.contentType);
    res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
    res.status(200).send(object.buffer);
  } catch {
    res.status(404).end();
  }
};
