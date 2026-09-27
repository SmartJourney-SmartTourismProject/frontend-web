import { afterEach, beforeAll, describe, expect, it, vi } from 'vitest';
import type { JWT } from 'next-auth/jwt';

process.env.KEYCLOAK_ISSUER ??= 'http://kc-test/realms/smartjourney';
process.env.KEYCLOAK_CLIENT_ID ??= 'smartjourney-web';
process.env.KEYCLOAK_CLIENT_SECRET ??= 'test-secret';

const { authOptions } = await import('../auth');

/** A JWT-shaped-enough access token: only the payload segment is real, since
 * rolesFromAccessToken only ever reads that part. */
function fakeAccessToken(roles: string[]): string {
  const payload = Buffer.from(JSON.stringify({ realm_access: { roles } })).toString('base64url');
  return `header.${payload}.signature`;
}

function baseToken(overrides: Partial<JWT> = {}): JWT {
  return {
    sub: 'kc-1',
    access_token: fakeAccessToken(['traveler']),
    refresh_token: 'refresh-1',
    expires_at: Math.floor(Date.now() / 1000) + 300,
    roles: ['traveler'],
    ...overrides,
  } as JWT;
}

afterEach(() => {
  vi.restoreAllMocks();
});

describe('authOptions.callbacks.jwt', () => {
  it('passes an unexpired token through unchanged, without calling fetch', async () => {
    const fetchSpy = vi.spyOn(global, 'fetch');
    const token = baseToken();

    const result = await authOptions.callbacks!.jwt!({ token, user: undefined as never, account: null });

    expect(result).toBe(token);
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it('refreshes an expired token and picks up the rotated refresh_token and fresh roles', async () => {
    vi.spyOn(global, 'fetch').mockResolvedValue({
      ok: true,
      json: async () => ({
        access_token: fakeAccessToken(['traveler', 'admin']),
        refresh_token: 'refresh-2',
        expires_in: 300,
      }),
    } as Response);
    const token = baseToken({ expires_at: Math.floor(Date.now() / 1000) - 10 });

    const result = await authOptions.callbacks!.jwt!({ token, user: undefined as never, account: null });

    expect(result.refresh_token).toBe('refresh-2');
    expect(result.roles).toEqual(['traveler', 'admin']);
    expect(result.error).toBeUndefined();
  });

  it('falls back to the old refresh_token when Keycloak does not rotate it', async () => {
    vi.spyOn(global, 'fetch').mockResolvedValue({
      ok: true,
      json: async () => ({ access_token: fakeAccessToken(['traveler']), expires_in: 300 }),
    } as Response);
    const token = baseToken({ expires_at: Math.floor(Date.now() / 1000) - 10, refresh_token: 'refresh-1' });

    const result = await authOptions.callbacks!.jwt!({ token, user: undefined as never, account: null });

    expect(result.refresh_token).toBe('refresh-1');
  });

  it('sets error on a failed refresh so the middleware forces a fresh login', async () => {
    vi.spyOn(global, 'fetch').mockResolvedValue({ ok: false } as Response);
    const token = baseToken({ expires_at: Math.floor(Date.now() / 1000) - 10 });

    const result = await authOptions.callbacks!.jwt!({ token, user: undefined as never, account: null });

    expect(result.error).toBe('RefreshAccessTokenError');
  });
});
