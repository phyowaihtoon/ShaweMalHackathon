import { randomUUID } from 'node:crypto';
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';

import { env } from '../config/env';
import {
  maxFilesForCategory,
  PUBLIC_UPLOAD_CATEGORIES,
  UPLOAD_CATEGORIES,
  UPLOAD_MIME_TO_EXTENSION,
  type UploadCategory
} from '../utils/upload-path';

export const getUploadRoot = (): string => env.uploadRoot;

export const getCategoryDirectory = (category: UploadCategory): string => {
  return path.join(getUploadRoot(), category);
};

export const ensureUploadDirectories = async (): Promise<void> => {
  await mkdir(getUploadRoot(), { recursive: true });
  await Promise.all(UPLOAD_CATEGORIES.map((category) => mkdir(getCategoryDirectory(category), { recursive: true })));
};

export const toStoredRelativePath = (category: UploadCategory, filename: string): string => {
  return `uploads/${category}/${filename}`;
};

export const toAbsoluteUploadPath = (relativePath: string): string => {
  const normalized = relativePath.replace(/\\/g, '/');
  if (!normalized.startsWith('uploads/')) {
    throw new Error('Invalid upload relative path.');
  }

  const withoutPrefix = normalized.slice('uploads/'.length);
  return path.join(getUploadRoot(), withoutPrefix);
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

  await ensureUploadDirectories();
  const directory = getCategoryDirectory(input.category);
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
    const absolutePath = path.join(directory, filename);
    await writeFile(absolutePath, file.buffer);
    paths.push(toStoredRelativePath(input.category, filename));
  }

  return paths;
};
