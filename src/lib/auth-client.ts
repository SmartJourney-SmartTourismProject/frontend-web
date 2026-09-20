'use client'

import { signIn, signOut } from 'next-auth/react'

// Thin wrappers so components never need to know provider ids or Keycloak
// query parameters.

/** Send the user to Keycloak's login page. */
export function signInWithKeycloak(callbackUrl = '/home') {
  return signIn('keycloak', { callbackUrl })
}

/** Skip Keycloak's form and go straight to Google. */
export function signInWithGoogle(callbackUrl = '/home') {
  return signIn('keycloak', { callbackUrl }, { kc_idp_hint: 'google' })
}

/**
 * Full logout: next-auth session, Keycloak server session (via the signOut
 * event) and Keycloak's browser SSO cookie (via the end-session redirect).
 */
export async function signOutEverywhere() {
  // Fetch the logout URL first - it needs the id_token, which is gone once
  // next-auth's cookie is cleared.
  const res = await fetch('/api/auth/federated-logout')
  const { url } = (await res.json()) as { url: string }
  await signOut({ redirect: false })
  window.location.href = url
}
