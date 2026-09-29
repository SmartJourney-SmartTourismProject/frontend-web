import { describe, expect, it, vi } from 'vitest';

// middleware.ts calls withAuth(options) at module scope and exports its
// return value as the default middleware - there is no way to reach the
// `authorized` callback without either running the real edge middleware
// runtime or capturing the options object passed in. Mocking the factory
// lets the test call the exact function the middleware uses, unchanged.
const withAuth = vi.fn();
vi.mock('next-auth/middleware', () => ({ withAuth }));

await import('../../middleware');

const { authorized } = withAuth.mock.calls[0][0].callbacks;

function req(pathname: string) {
  return { nextUrl: { pathname } } as never;
}

describe('middleware authorized callback', () => {
  it('rejects when there is no token at all', () => {
    expect(authorized({ token: null, req: req('/home') })).toBe(false);
  });

  it('rejects a token whose refresh failed, forcing a fresh login', () => {
    expect(authorized({ token: { error: 'RefreshAccessTokenError' }, req: req('/home') })).toBe(false);
  });

  it('rejects a non-admin token on an /admin route', () => {
    expect(authorized({ token: { roles: ['traveler'] }, req: req('/admin/users') })).toBe(false);
  });

  it('allows an admin token on an /admin route', () => {
    expect(authorized({ token: { roles: ['traveler', 'admin'] }, req: req('/admin/users') })).toBe(true);
  });

  it('allows any valid token on a non-admin protected route', () => {
    expect(authorized({ token: { roles: ['traveler'] }, req: req('/home') })).toBe(true);
  });
});
