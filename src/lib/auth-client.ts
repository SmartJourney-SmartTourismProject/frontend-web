'use client';

import { signIn, signOut } from 'next-auth/react';

// Thin wrappers so components never need to know provider ids or Keycloak
// query parameters. All of these leave the app for Keycloak and come back to
// `callbackUrl` with a session.

/**
 * Set when a sign-in leaves for Keycloak, read (once) by BackToSignInGuard
 * on the first app page after it comes back: that page's Back button would
 * return into the sign-in pages, so the guard intercepts it.
 */
export const SIGN_IN_STARTED_KEY = 'sj-sign-in-started';

function markSignInStarted() {
  try {
    sessionStorage.setItem(SIGN_IN_STARTED_KEY, '1');
  } catch {
    // Storage blocked (private mode etc.) - the Back guard just won't arm.
  }
}

/** Keycloak's login page. */
export function signInWithKeycloak(callbackUrl = '/home') {
  markSignInStarted();
  return signIn('keycloak', { callbackUrl });
}

/** Skip Keycloak's form and go straight to Google. */
export function signInWithGoogle(callbackUrl = '/home') {
  markSignInStarted();
  return signIn('keycloak', { callbackUrl }, { kc_idp_hint: 'google' });
}

/** Keycloak's registration form (see keycloakRegister in lib/auth.ts). */
export function registerWithKeycloak(callbackUrl = '/home') {
  markSignInStarted();
  return signIn('keycloak-register', { callbackUrl });
}

/**
 * Keycloak "application-initiated action": re-authenticates the user (or
 * uses the SSO session) and then shows its change-password screen. The new
 * password is validated against the realm's policy, so no rules live here.
 */
export function changePasswordInKeycloak(callbackUrl = '/home') {
  return signIn('keycloak', { callbackUrl }, { kc_action: 'UPDATE_PASSWORD' });
}

/**
 * Full logout: next-auth session, Keycloak server session (via the signOut
 * event) and Keycloak's browser SSO cookie (via the end-session redirect).
 */
export async function signOutEverywhere() {
  // Fetch the logout URL first - it needs the id_token, which is gone once
  // next-auth's cookie is cleared.
  const res = await fetch('/api/auth/federated-logout');
  const { url } = (await res.json()) as { url: string };
  await signOut({ redirect: false });
  // Forget which chat was open, so the next sign-in starts a new chat (a
  // refresh while signed in still restores it).
  try {
    localStorage.removeItem('smartjourney-trip-store');
  } catch {
    // storage blocked - nothing to clear
  }
  window.location.href = url;
}
