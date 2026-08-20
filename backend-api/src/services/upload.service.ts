import { randomUUID } from 'node:crypto';
import path from 'node:path';

import { env } from '../config/env';
import { diskObjectAbsolutePath } from '../storage/disk.storage';
import { getStorage } from '../storage';
import {
  maxFilesForCategory,
  PUBLIC_UPLOAD_CATEGORIES,
  UPLOAD_MIME_TO_EXTENSION,
  type UploadCategory
} from '../utils/upload-path';

export const getUploadRoot = (): string => env.uploadRoot;

export const getCategoryDirectory = (category: UploadCategory): string => {
  return path.join(getUploadRoot(), category);
};

export const ensureUploadDirectories = async (): Promise<void> => {
  await getStorage().ensureReady();
};

export const toStoredRelativePath = (category: UploadCategory, filename: string): string => {
  return `uploads/${category}/${filename}`;
};

export const toAbsoluteUploadPath = (relativePath: string): string => {
  return diskObjectAbsolutePath(relativePath);
};

export const isPublicUploadRelativePath = (relativePath: string): boolean => {
  return PUBLIC_UPLOAD_CATEGORIES.some((category) => relativePath.startsWith(`uploads/${category}/`));
};

type SaveUploadedFilesInput = {
  category: UploadCategory;
  files: Express.Multer.File[];
};

export const saveUploadedFiles = async (input: SaveUploadedFilesInput): Promise<string[]> => {
  const maxFiles = maxFilesForCategory(input.category);
  if (input.files.length === 0) {
    throw new Error('NO_FILES');
  }

  if (input.files.length > maxFiles) {
    throw new Error('TOO_MANY_FILES');
  }

  const storage = getStorage();
  await storage.ensureReady();
  const paths: string[] = [];

  for (const file of input.files) {
    const extension = UPLOAD_MIME_TO_EXTENSION[file.mimetype];
    if (!extension) {
      throw new Error('INVALID_TYPE');
    }

    if (!file.buffer || file.buffer.length === 0) {
      throw new Error('EMPTY_FILE');
    }

    if (file.size > env.uploadMaxBytes) {
      throw new Error('FILE_TOO_LARGE');
    }

    const filename = `${randomUUID()}${extension}`;
    const objectKey = toStoredRelativePath(input.category, filename);
    const stored = await storage.putObject({
      category: input.category,
      objectKey,
      buffer: file.buffer,
      contentType: file.mimetype
    });
    paths.push(stored.storedPath);
  }

  return paths;
};

export const readStoredObject = async (
  objectKey: string
): Promise<{ buffer: Buffer; contentType: string }> => {
  return getStorage().getObject(objectKey);
};
