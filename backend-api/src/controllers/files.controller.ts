import { createReadStream } from 'node:fs';
import { access } from 'node:fs/promises';
import path from 'node:path';

import { Request, Response } from 'express';

import { prisma } from '../prisma/client';
import { toAbsoluteUploadPath } from '../services/upload.service';
import { ApiError } from '../utils/api-error';
import { isUploadCategory, isValidUploadedPath } from '../utils/upload-path';

const CONTENT_TYPE_BY_EXT: Record<string, string> = {
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.webp': 'image/webp'
};

const userOwnsDocPath = async (userId: string, relativePath: string): Promise<boolean> => {
  const agent = await prisma.agentProfile.findFirst({
    where: {
      userId,
      OR: [{ nrcFrontPhotoPath: relativePath }, { nrcBackPhotoPath: relativePath }]
    },
    select: { id: true }
  });

  if (agent) {
    return true;
  }

  const driver = await prisma.driverProfile.findFirst({
    where: {
      userId,
      OR: [
        { nrcFrontPhotoPath: relativePath },
        { nrcBackPhotoPath: relativePath },
        { drivingLicensePhotoPath: relativePath },
        { vehiclePhotoPath: relativePath },
        { wheelTaxPhotoPath: relativePath }
      ]
    },
    select: { id: true }
  });

  return Boolean(driver);
};

export const getProtectedFileController = async (req: Request, res: Response): Promise<void> => {
  if (!req.auth) {
    throw new ApiError(401, 'AUTH_REQUIRED', 'Authorization context is missing.');
  }

  const category = typeof req.params.category === 'string' ? req.params.category : '';
  const filename = typeof req.params.filename === 'string' ? req.params.filename : '';

  if (!isUploadCategory(category) || category !== 'docs') {
    throw new ApiError(404, 'FILE_NOT_FOUND', 'File not found.');
  }

  if (!filename || filename.includes('..') || filename.includes('/') || filename.includes('\\')) {
    throw new ApiError(400, 'FILE_INVALID_NAME', 'Invalid file name.');
  }

  const relativePath = `uploads/docs/${filename}`;
  if (!isValidUploadedPath(relativePath, 'docs')) {
    throw new ApiError(400, 'FILE_INVALID_PATH', 'Invalid file path.');
  }

  const isAdmin = req.auth.roles.includes('admin');
  if (!isAdmin) {
    const owns = await userOwnsDocPath(req.auth.userId, relativePath);
    if (!owns) {
      throw new ApiError(403, 'FILE_FORBIDDEN', 'You are not allowed to access this file.');
    }
  }

  const absolutePath = toAbsoluteUploadPath(relativePath);

  try {
    await access(absolutePath);
  } catch {
    throw new ApiError(404, 'FILE_NOT_FOUND', 'File not found.');
  }

  const extension = path.extname(filename).toLowerCase();
  const contentType = CONTENT_TYPE_BY_EXT[extension] ?? 'application/octet-stream';
  res.setHeader('Content-Type', contentType);
  res.setHeader('Cache-Control', 'private, max-age=0, no-cache');

  createReadStream(absolutePath).pipe(res);
};
