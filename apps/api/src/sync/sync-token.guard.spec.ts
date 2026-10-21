import { UnauthorizedException } from '@nestjs/common';
import { loadConfig } from '../config/env';
import { SyncTokenGuard } from './sync-token.guard';

const ctx = (headers: Record<string, unknown>) =>
  ({ switchToHttp: () => ({ getRequest: () => ({ headers }) }) }) as any;
const guard = (token?: string) => new SyncTokenGuard(loadConfig({ DATABASE_URL: 'x', ...(token ? { SYNC_TOKEN: token } : {}) }));

describe('SyncTokenGuard', () => {
  it('accepts the right token', () => {
    expect(guard('secret').canActivate(ctx({ 'x-sync-token': 'secret' }))).toBe(true);
  });
  it.each([
    ['wrong token', 'secret', { 'x-sync-token': 'wrong!' }],
    ['different length', 'secret', { 'x-sync-token': 'sec' }],
    ['missing header', 'secret', {}],
    ['array header', 'secret', { 'x-sync-token': ['secret'] }],
    ['no token configured', undefined, { 'x-sync-token': 'anything' }],
  ])('rejects: %s', (_l, token, headers) => {
    expect(() => guard(token).canActivate(ctx(headers))).toThrow(UnauthorizedException);
  });
});
