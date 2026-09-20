import { NextResponse } from 'next/server'
import { getToken } from 'next-auth/jwt'
import { keycloakLogoutUrl } from '@/lib/auth'

// Returns the Keycloak end-session URL for the current user. `signOut()` alone
// only clears next-auth's cookie; the browser still holds Keycloak's SSO
// cookie, so the next "Sign in" would skip the login form and log the same
// user straight back in. The UI calls signOutEverywhere() (src/lib/auth-client.ts)
// which clears next-auth first, then sends the browser here.
export async function GET(req: Request) {
  const token = await getToken({ req: req as any })
  const postLogoutRedirect = `${process.env.NEXTAUTH_URL ?? new URL(req.url).origin}/`
  return NextResponse.json({ url: keycloakLogoutUrl(token?.id_token, postLogoutRedirect) })
}
