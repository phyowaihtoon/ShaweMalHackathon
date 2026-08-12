import { access, readFile } from 'node:fs/promises';

import request from 'supertest';

import { app } from '../../src/app';
import { env } from '../../src/config/env';
import { ensureUploadDirectories, toAbsoluteUploadPath } from '../../src/services/upload.service';
import { signJwt } from '../../src/utils/jwt';

jest.mock('../../src/prisma/client', () => ({
  prisma: {
    agentProfile: {
      findFirst: jest.fn().mockResolvedValue(null)
    },
    driverProfile: {
      findFirst: jest.fn().mockResolvedValue(null)
    }
  }
}));

const userToken = signJwt({ sub: 'user-1', email: 'user@example.com', roles: ['user'] }, '1h');
const adminToken = signJwt({ sub: 'admin-1', email: 'admin@example.com', roles: ['admin'] }, '1h');

const JPEG_BUFFER = Buffer.from(
  '/9j/4AAQSkZJRgABAQAAAQABAAD/2wCEAAkGBxAQEBUQEBAVFRUVFRUVFRUVFRUVFRUWFxUVFRUYHSggGBolGxUVITEhJSkrLi4uFx8zODMtNygtLisBCgoKDg0OGxAQGy0lHyUtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLf/AABEIAAEAAQMBIgACEQEDEQH/xAAbAAACAwEBAQAAAAAAAAAAAAADBAECBQYAB//EABUBAQEAAAAAAAAAAAAAAAAAAAAB/8QAFBEBAAAAAAAAAAAAAAAAAAAAAP/aAAwDAQACEQMRAD8A1oAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAP/Z',
  'base64'
);

describe('uploads API', () => {
  beforeAll(async () => {
    await ensureUploadDirectories();
  });

  it('rejects unauthenticated upload', async () => {
    const response = await request(app)
      .post('/api/v1/uploads?category=houses')
      .attach('files', JPEG_BUFFER, { filename: 'house.jpg', contentType: 'image/jpeg' });

    expect(response.status).toBe(401);
  });

  it('uploads a house image and serves it publicly', async () => {
    const response = await request(app)
      .post('/api/v1/uploads?category=houses')
      .set('Authorization', `Bearer ${userToken}`)
      .attach('files', JPEG_BUFFER, { filename: 'house.jpg', contentType: 'image/jpeg' });

    expect(response.status).toBe(201);
    expect(response.body.success).toBe(true);
    expect(Array.isArray(response.body.data.paths)).toBe(true);
    expect(response.body.data.paths).toHaveLength(1);

    const relativePath = response.body.data.paths[0] as string;
    expect(relativePath).toMatch(/^uploads\/houses\/[a-zA-Z0-9._-]+\.jpg$/);

    const absolutePath = toAbsoluteUploadPath(relativePath);
    await access(absolutePath);
    const written = await readFile(absolutePath);
    expect(written.length).toBeGreaterThan(0);

    const staticResponse = await request(app).get(`/${relativePath}`);
    expect(staticResponse.status).toBe(200);
  });

  it('rejects invalid mime type', async () => {
    const response = await request(app)
      .post('/api/v1/uploads?category=houses')
      .set('Authorization', `Bearer ${userToken}`)
      .attach('files', Buffer.from('not-an-image'), { filename: 'note.txt', contentType: 'text/plain' });

    expect(response.status).toBe(400);
    expect(response.body.errors.code).toBe('UPLOAD_INVALID_TYPE');
  });

  it('blocks public access to docs while admin can fetch via files API', async () => {
    const uploadResponse = await request(app)
      .post('/api/v1/uploads?category=docs')
      .set('Authorization', `Bearer ${userToken}`)
      .attach('files', JPEG_BUFFER, { filename: 'nrc.jpg', contentType: 'image/jpeg' });

    expect(uploadResponse.status).toBe(201);
    const relativePath = uploadResponse.body.data.paths[0] as string;
    const filename = relativePath.split('/').pop() as string;

    const blocked = await request(app).get(`/${relativePath}`);
    expect(blocked.status).toBe(404);

    const forbidden = await request(app)
      .get(`/api/v1/files/docs/${filename}`)
      .set('Authorization', `Bearer ${userToken}`);
    expect(forbidden.status).toBe(403);

    const allowed = await request(app)
      .get(`/api/v1/files/docs/${filename}`)
      .set('Authorization', `Bearer ${adminToken}`);
    expect(allowed.status).toBe(200);
    expect(allowed.headers['content-type']).toMatch(/image\/jpeg/);
  });

  it('uses configured upload root', () => {
    expect(env.uploadRoot).toBeTruthy();
  });
});
