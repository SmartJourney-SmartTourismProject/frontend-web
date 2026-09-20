import type { DefaultSession } from 'next-auth';

// Extra fields our auth callbacks (src/lib/auth.ts) put on the session and
// the JWT. Keeps `useSession()` / `getServerSession()` typed everywhere.
declare module 'next-auth' {
  interface Session {
    /** Keycloak access token - sent as `Authorization: Bearer` to NestJS (lib/api.ts). */
    access_token?: string;
    /** Set when the access token could not be refreshed; treat as signed out. */
    error?: 'RefreshAccessTokenError' | 'RefreshTokenMissing';
    user: DefaultSession['user'] & {
      /** Keycloak user id (`sub` claim). */
      id: string;
      /** Realm roles, e.g. ['traveler'] or ['traveler', 'admin']. */
      roles: string[];
    };
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    access_token?: string;
    refresh_token?: string;
    id_token?: string;
    /** Unix seconds when access_token expires. */
    expires_at?: number;
    roles?: string[];
    error?: 'RefreshAccessTokenError' | 'RefreshTokenMissing';
  }
}
