import fs from 'node:fs';
import path from 'node:path';

/**
 * The local stack's addresses, read from frontend-web/.env.local.
 *
 * Hard-coding them here is what broke this suite: the config pointed at
 * http://localhost:3000, another project on this machine owns that port, and
 * Playwright's `reuseExistingServer` happily ran the whole journey against
 * *that* app - which redirects unauthenticated visitors to `/login?from=`
 * instead of `/login?callbackUrl=`. The failure looked like a bug in our
 * middleware and was not.
 *
 * .env.local is the right source of truth because NEXTAUTH_URL must already
 * match the redirect URI registered for `smartjourney-web` in
 * backend/keycloak/realm-export.json (http://localhost:3001/...). Sign-in
 * cannot work on any other port, so the tests cannot either.
 */

function readEnvLocal(): Record<string, string> {
  const file = path.join(process.cwd(), '.env.local');
  const out: Record<string, string> = {};
  if (!fs.existsSync(file)) return out;
  for (const line of fs.readFileSync(file, 'utf8').split(/\r?\n/)) {
    const match = /^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/.exec(line);
    if (!match) continue;
    out[match[1]] = match[2].replace(/^["']|["']$/g, '');
  }
  return out;
}

const local = readEnvLocal();
const pick = (key: string, fallback: string) => process.env[key] || local[key] || fallback;

/** The app under test. Must be the port Keycloak will redirect back to. */
export const BASE_URL = pick('NEXTAUTH_URL', 'http://localhost:3001');
/** NestJS, used to seed a saved trip for the signed-in journeys. */
export const API_URL = pick('NEXT_PUBLIC_API_URL', 'http://localhost:3002');
/** e.g. http://localhost:8081/realms/smartjourney */
export const ISSUER = pick('KEYCLOAK_ISSUER', 'http://localhost:8081/realms/smartjourney');

export const KEYCLOAK_BASE = ISSUER.replace(/\/realms\/.*$/, '');
export const REALM = ISSUER.replace(/^.*\/realms\//, '');

/** Local Keycloak bootstrap admin - backend/docker-compose.yml sets admin/admin. */
export const KC_ADMIN_USER = process.env.KEYCLOAK_ADMIN || 'admin';
export const KC_ADMIN_PASSWORD = process.env.KEYCLOAK_ADMIN_PASSWORD || 'admin';

/**
 * The one account these tests sign in as. Created by e2e/auth.setup.ts, so
 * there is nothing to seed by hand. The password satisfies the realm's policy
 * (8-12 chars, upper + lower + digit + special).
 */
export const E2E_USERNAME = process.env.E2E_USERNAME || 'e2e-traveler';
export const E2E_EMAIL = process.env.E2E_EMAIL || 'e2e-traveler@smartjourney.test';
export const E2E_PASSWORD = process.env.E2E_PASSWORD || 'E2e!pass99';

/** Title of the trip the setup seeds, asserted on in the saved-itineraries test. */
export const SEEDED_TRIP_TITLE = 'E2E seeded trip — Kandy';

/** Where the signed-in browser state is cached between the setup and the tests. */
export const STORAGE_STATE = 'e2e/.auth/traveler.json';
