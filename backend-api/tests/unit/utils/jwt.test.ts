import { signJwt, verifyJwt } from '../../../src/utils/jwt';

describe('jwt utils', () => {
  it('signs and verifies a valid token', () => {
    const token = signJwt(
      {
        sub: 'user-123',
        email: 'test@example.com',
        roles: ['normal']
      },
      '2m'
    );

    const payload = verifyJwt(token);
    expect(payload.sub).toBe('user-123');
    expect(payload.email).toBe('test@example.com');
    expect(payload.roles).toEqual(['normal']);
  });

  it('throws for malformed token', () => {
    expect(() => verifyJwt('bad-token')).toThrow('Token is invalid or expired.');
  });
});
