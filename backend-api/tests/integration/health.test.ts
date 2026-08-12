import request from 'supertest';

import { app } from '../../src/app';

describe('GET /api/v1/health', () => {
  it('returns healthy status', async () => {
    const response = await request(app).get('/api/v1/health');

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data.status).toBe('ok');
    expect(response.body.requestId).toBeDefined();
  });
});
