import { get, head, put } from '@vercel/blob';

import { env } from '../config/env';
import type { GetObjectResult, ObjectStorage, PutObjectInput, PutObjectResult } from './types';

const streamToBuffer = async (stream: ReadableStream<Uint8Array>): Promise<Buffer> => {
  const reader = stream.getReader();
  const chunks: Buffer[] = [];

  for (;;) {
    const { done, value } = await reader.read();
    if (done) {
      break;
    }

    if (value) {
      chunks.push(Buffer.from(value));
    }
  }

  return Buffer.concat(chunks);
};

export const createVercelBlobStorage = (): ObjectStorage => {
  if (!process.env.BLOB_READ_WRITE_TOKEN && !process.env.BLOB_STORE_ID) {
    console.warn(
      'STORAGE_DRIVER=vercel-blob but BLOB_READ_WRITE_TOKEN / BLOB_STORE_ID is not set. Uploads will fail until configured.'
    );
  }

  const access = env.blobStoreAccess;

  return {
    driver: 'vercel-blob',
    servesLocalStatic: false,

    async ensureReady(): Promise<void> {
      // Blob store is provisioned in Vercel; nothing to create locally.
    },

    async putObject(input: PutObjectInput): Promise<PutObjectResult> {
      const blob = await put(input.objectKey, input.buffer, {
        access,
        contentType: input.contentType,
        addRandomSuffix: false,
        allowOverwrite: false
      });

      return {
        storedPath: input.objectKey,
        objectKey: input.objectKey,
        publicUrl: access === 'public' ? blob.url : undefined
      };
    },

    async getObject(objectKey: string): Promise<GetObjectResult> {
      const result = await get(objectKey, { access });
      if (!result || result.statusCode !== 200 || !result.stream) {
        throw new Error('BLOB_NOT_FOUND');
      }

      const buffer = await streamToBuffer(result.stream);
      return {
        buffer,
        contentType: result.blob.contentType || 'application/octet-stream'
      };
    },

    async resolvePublicUrl(objectKey: string): Promise<string | null> {
      if (access !== 'public') {
        return null;
      }

      try {
        const meta = await head(objectKey);
        return meta.url;
      } catch {
        return null;
      }
    }
  };
};
