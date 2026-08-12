import { NextFunction, Request, Response } from 'express';

import { requireAdmin, requireRole } from '../../../src/middleware/auth.middleware';

const createResponse = (): Response => ({
  locals: {}
} as Response);

describe('RBAC middleware', () => {
  it('allows matching role', () => {
    const req = {
      auth: {
        userId: 'u1',
        email: 'u1@example.com',
        roles: ['agent']
      }
    } as Request;

    const next = jest.fn();
    requireRole(['agent'])(req, createResponse(), next as NextFunction);

    expect(next).toHaveBeenCalledWith();
  });

  it('rejects non-admin for requireAdmin', () => {
    const req = {
      auth: {
        userId: 'u2',
        email: 'u2@example.com',
        roles: ['normal']
      }
    } as Request;

    const next = jest.fn();
    requireAdmin(req, createResponse(), next as NextFunction);

    expect(next).toHaveBeenCalled();
    const [error] = next.mock.calls[0] as [Error];
    expect(error).toBeDefined();
    expect((error as { statusCode?: number }).statusCode).toBe(403);
  });
});
