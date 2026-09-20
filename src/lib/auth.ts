import type { NextAuthOptions } from 'next-auth'
import type { JWT } from 'next-auth/jwt'
import KeycloakProvider from 'next-auth/providers/keycloak'

// Keycloak is the only identity provider. Users, passwords, Google sign-in and
// the password policy all live in the `smartjourney` realm
// (backend/keycloak/realm-export.json); this file only turns Keycloak's tokens
// into a next-auth session.
//
// Token lifetimes (Keycloak defaults): access token 5 min, refresh token /
// SSO session 30 min idle. next-auth's own session cookie lasts longer than
// both, so the jwt callback below refreshes the access token whenever it has
// expired - without that, every API call would start failing 5 minutes after
// login even though the user still looks signed in.

const issuer = process.env.KEYCLOAK_ISSUER!
const clientId = process.env.KEYCLOAK_CLIENT_ID!
const clientSecret = process.env.KEYCLOAK_CLIENT_SECRET!

const tokenEndpoint = `${issuer}/protocol/openid-connect/token`
const logoutEndpoint = `${issuer}/protocol/openid-connect/logout`

// Refresh a little early so a request made right at the boundary doesn't get
// a token that expires in transit.
const REFRESH_SKEW_SECONDS = 30

interface KeycloakTokenResponse {
  access_token: string
  refresh_token: string
  id_token?: string
  expires_in: number
}

// Roles every Keycloak realm assigns automatically; not meaningful to the app.
const KEYCLOAK_BUILTIN_ROLES = new Set(['offline_access', 'uma_authorization', 'default-roles-smartjourney'])

/** App realm roles (`traveler`, `admin`) from the access token's `realm_access.roles`. */
function rolesFromAccessToken(accessToken: string | undefined): string[] {
  if (!accessToken) return []
  try {
    const payload = accessToken.split('.')[1]
    const json = Buffer.from(payload, 'base64url').toString('utf8')
    const claims = JSON.parse(json) as { realm_access?: { roles?: string[] } }
    return (claims.realm_access?.roles ?? []).filter((r) => !KEYCLOAK_BUILTIN_ROLES.has(r))
  } catch {
    return []
  }
}

async function refreshAccessToken(token: JWT): Promise<JWT> {
  if (!token.refresh_token) {
    return { ...token, error: 'RefreshTokenMissing' }
  }

  const res = await fetch(tokenEndpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'refresh_token',
      client_id: clientId,
      client_secret: clientSecret,
      refresh_token: token.refresh_token,
    }),
  })

  if (!res.ok) {
    // Typically the Keycloak session expired or was logged out elsewhere.
    // Surface it on the session so the client can send the user back to login.
    return { ...token, error: 'RefreshAccessTokenError' }
  }

  const refreshed = (await res.json()) as KeycloakTokenResponse
  return {
    ...token,
    access_token: refreshed.access_token,
    // Keycloak rotates refresh tokens; fall back to the old one just in case.
    refresh_token: refreshed.refresh_token ?? token.refresh_token,
    id_token: refreshed.id_token ?? token.id_token,
    expires_at: Math.floor(Date.now() / 1000) + refreshed.expires_in,
    roles: rolesFromAccessToken(refreshed.access_token),
    error: undefined,
  }
}

/**
 * Ends the user's session inside Keycloak (server side, using the refresh
 * token). Called from the signOut event so a plain `signOut()` from the UI
 * doesn't leave a live SSO session behind that would silently log the user
 * straight back in on the next visit.
 */
async function revokeKeycloakSession(token: JWT | undefined) {
  if (!token?.refresh_token) return
  try {
    await fetch(logoutEndpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id: clientId,
        client_secret: clientSecret,
        refresh_token: token.refresh_token,
      }),
    })
  } catch {
    // Best effort - the browser-side federated logout (see
    // /api/auth/federated-logout) is the second line of defence.
  }
}

/** URL that logs the browser out of Keycloak itself, then returns to the app. */
export function keycloakLogoutUrl(idToken: string | undefined, postLogoutRedirect: string) {
  const params = new URLSearchParams({
    post_logout_redirect_uri: postLogoutRedirect,
    client_id: clientId,
  })
  if (idToken) params.set('id_token_hint', idToken)
  return `${logoutEndpoint}?${params.toString()}`
}

export const authOptions: NextAuthOptions = {
  providers: [KeycloakProvider({ clientId, clientSecret, issuer })],
  session: { strategy: 'jwt' },
  pages: { signIn: '/login' },
  callbacks: {
    async jwt({ token, account, profile }) {
      // First call after the OAuth callback: account holds Keycloak's tokens.
      if (account) {
        return {
          ...token,
          sub: profile?.sub ?? token.sub,
          access_token: account.access_token,
          refresh_token: account.refresh_token,
          id_token: account.id_token,
          expires_at: account.expires_at,
          roles: rolesFromAccessToken(account.access_token),
          error: undefined,
        }
      }

      const now = Math.floor(Date.now() / 1000)
      if (token.expires_at && now < token.expires_at - REFRESH_SKEW_SECONDS) {
        return token
      }
      return refreshAccessToken(token)
    },

    async session({ session, token }) {
      session.access_token = token.access_token
      session.error = token.error
      session.user.id = token.sub ?? ''
      session.user.roles = token.roles ?? []
      return session
    },
  },
  events: {
    async signOut({ token }) {
      await revokeKeycloakSession(token)
    },
  },
}
