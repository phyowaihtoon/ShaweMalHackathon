import { access, mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';

import { env } from '../config/env';
import { UPLOAD_CATEGORIES } from '../utils/upload-path';
import type { GetObjectResult, ObjectStorage, PutObjectInput, PutObjectResult } from './types';

const toAbsolutePath = (objectKey: string): string => {
  if (!objectKey.startsWith('uploads/')) {
    throw new Error('Invalid upload object key.');
  }

  return path.join(env.uploadRoot, objectKey.slice('uploads/'.length));
};

export const createDiskStorage = (): ObjectStorage => ({
  driver: 'disk',
  servesLocalStatic: true,

  async ensureReady(): Promise<void> {
    await mkdir(env.uploadRoot, { recursive: true });
    await Promise.all(
      UPLOAD_CATEGORIES.map((category) => mkdir(path.join(env.uploadRoot, category), { recursive: true }))
    );
  },

  async putObject(input: PutObjectInput): Promise<PutObjectResult> {
    await this.ensureReady();
    const absolutePath = toAbsolutePath(input.objectKey);
    await mkdir(path.dirname(absolutePath), { recursive: true });
    await writeFile(absolutePath, input.buffer);

    return {
      storedPath: input.objectKey,
      objectKey: input.objectKey
    };
  },

  async getObject(objectKey: string): Promise<GetObjectResult> {
    const absolutePath = toAbsolutePath(objectKey);
    await access(absolutePath);
    const buffer = await readFile(absolutePath);
    const extension = path.extname(absolutePath).toLowerCase();
    const contentType =
      extension === '.png'
        ? 'image/png'
        : extension === '.webp'
          ? 'image/webp'
          : extension === '.jpg' || extension === '.jpeg'
            ? 'image/jpeg'
            : 'application/octet-stream';

    return { buffer, contentType };
  }
});

export const diskObjectAbsolutePath = toAbsolutePath;
