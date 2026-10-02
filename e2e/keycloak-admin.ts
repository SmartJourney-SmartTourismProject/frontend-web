import { E2E_EMAIL, E2E_PASSWORD, E2E_USERNAME, KC_ADMIN_PASSWORD, KC_ADMIN_USER, KEYCLOAK_BASE, REALM } from './env';

/**
 * Creates the suite's test account through Keycloak's admin REST API.
 *
 * These journeys used to be `test.skip(...)`ed with "needs a seeded,
 * pre-authenticated Keycloak session ... no scripted way to obtain one
 * headlessly". There is one: the realm's admin API makes the account, and
 * Playwright then signs in through the real login form like a person would.
 * No password is faked and no session is forged - only the account is seeded,
 * which is the part a human would otherwise do by hand.
 *
 * Deliberately NOT given the `admin` realm role: the non-admin journey needs a
 * traveler who is refused /admin, and every other journey only needs a signed-in
 * traveler.
 */

interface KeycloakUser {
  id: string;
  username: string;
}

async function adminToken(): Promise<string> {
  const res = await fetch(`${KEYCLOAK_BASE}/realms/master/protocol/openid-connect/token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: 'admin-cli',
      grant_type: 'password',
      username: KC_ADMIN_USER,
      password: KC_ADMIN_PASSWORD,
    }),
  });
  if (!res.ok) {
    throw new Error(
      `Keycloak admin login failed (${res.status}). Is the local stack up (docker compose up) ` +
        `and is ${KEYCLOAK_BASE} the right address? See RUNNING.md.`,
    );
  }
  return ((await res.json()) as { access_token: string }).access_token;
}

async function kc<T>(token: string, path: string, init: RequestInit = {}): Promise<T | null> {
  const res = await fetch(`${KEYCLOAK_BASE}/admin/realms/${REALM}${path}`, {
    ...init,
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json', ...init.headers },
  });
  if (!res.ok) {
    throw new Error(`Keycloak admin ${init.method ?? 'GET'} ${path} -> ${res.status} ${await res.text()}`);
  }
  // 201/204 carry no body.
  const body = await res.text();
  return body ? (JSON.parse(body) as T) : null;
}

/**
 * Makes sure the test account exists, is enabled, has a verified email (the
 * realm sets verifyEmail: true, which would otherwise block the login with a
 * "verify your email" screen) and holds the `traveler` role. Idempotent: safe
 * to call on every run, and it repairs an account a previous run left in a
 * half-configured state.
 */
export async function ensureTestUser(): Promise<void> {
  const token = await adminToken();

  const existing = await kc<KeycloakUser[]>(
    token,
    `/users?username=${encodeURIComponent(E2E_USERNAME)}&exact=true`,
  );
  let id = existing?.[0]?.id;

  const profile = {
    username: E2E_USERNAME,
    email: E2E_EMAIL,
    firstName: 'E2E',
    lastName: 'Traveler',
    enabled: true,
    emailVerified: true,
    // A leftover "update password" or "verify email" action would stop the
    // login form dead, so clear them rather than inherit them.
    requiredActions: [],
  };

  if (id) {
    await kc(token, `/users/${id}`, { method: 'PUT', body: JSON.stringify(profile) });
  } else {
    await kc(token, '/users', { method: 'POST', body: JSON.stringify(profile) });
    const created = await kc<KeycloakUser[]>(
      token,
      `/users?username=${encodeURIComponent(E2E_USERNAME)}&exact=true`,
    );
    id = created?.[0]?.id;
    if (!id) throw new Error(`Created ${E2E_USERNAME} in realm ${REALM} but could not read it back.`);
  }

  // Set the password every run: it keeps a run working after someone has
  // changed it in the admin console, and keeps the credential in one place.
  await kc(token, `/users/${id}/reset-password`, {
    method: 'PUT',
    body: JSON.stringify({ type: 'password', value: E2E_PASSWORD, temporary: false }),
  });

  const traveler = await kc<{ id: string; name: string }>(token, '/roles/traveler');
  if (traveler) {
    await kc(token, `/users/${id}/role-mappings/realm`, {
      method: 'POST',
      body: JSON.stringify([{ id: traveler.id, name: traveler.name }]),
    });
  }
}
