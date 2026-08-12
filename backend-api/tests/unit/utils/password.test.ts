import { comparePassword, hashPassword } from '../../../src/utils/password';

describe('password utils', () => {
  it('hashes and compares a password', async () => {
    const plain = 'S3cret#pass';
    const hash = await hashPassword(plain);

    expect(hash).not.toBe(plain);
    await expect(comparePassword(plain, hash)).resolves.toBe(true);
  });

  it('returns false for invalid password', async () => {
    const hash = await hashPassword('correct-password');
    await expect(comparePassword('wrong-password', hash)).resolves.toBe(false);
  });
});
