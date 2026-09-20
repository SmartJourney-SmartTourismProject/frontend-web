'use client';

import Link from 'next/link';
import { KeyRound, Mail } from 'lucide-react';
import { changePasswordInKeycloak } from '@/lib/auth-client';

// Both paths are Keycloak screens on realm `smartjourney`:
//  - Forgot it: Keycloak's reset-credentials page emails a one-time link
//    (realm SMTP, see backend/docker-compose.yml - Mailpit locally).
//  - Know it: an application-initiated action; sign in, then choose a new one.
// The new password is checked against the realm's policy in both cases.
const ISSUER = process.env.NEXT_PUBLIC_KEYCLOAK_ISSUER ?? 'http://localhost:8081/realms/smartjourney';
const CLIENT_ID = process.env.NEXT_PUBLIC_KEYCLOAK_CLIENT_ID ?? 'smartjourney-web';
const FORGOT_URL = `${ISSUER}/login-actions/reset-credentials?client_id=${encodeURIComponent(CLIENT_ID)}`;

export default function ResetPasswordPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-6 bg-gray-50 px-4 text-center">
      <div>
        <h1 className="font-serif text-2xl font-semibold text-brand-600">Reset your password</h1>
        <p className="mt-2 max-w-sm text-sm text-gray-600">
          Passwords need 8–12 characters with upper &amp; lower case, a number and a symbol.
        </p>
      </div>

      <div className="grid w-full max-w-lg gap-4 sm:grid-cols-2">
        <a
          href={FORGOT_URL}
          className="flex flex-col items-center gap-2 rounded-2xl border border-gray-200 bg-white p-5 text-left shadow-sm transition hover:border-brand-300 hover:bg-brand-50"
        >
          <Mail className="h-6 w-6 text-brand-600" />
          <span className="text-sm font-semibold text-gray-900">I forgot my password</span>
          <span className="text-xs text-gray-500">We&apos;ll email you a one-time link to choose a new one.</span>
        </a>
        <button
          type="button"
          onClick={() => changePasswordInKeycloak('/home')}
          className="flex flex-col items-center gap-2 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm transition hover:border-brand-300 hover:bg-brand-50"
        >
          <KeyRound className="h-6 w-6 text-brand-600" />
          <span className="text-sm font-semibold text-gray-900">I know it and want to change it</span>
          <span className="text-xs text-gray-500">Sign in with your current password, then set a new one.</span>
        </button>
      </div>

      <Link href="/login" className="text-sm font-medium text-accent-600 hover:underline">
        ← Back to Sign In
      </Link>
    </main>
  );
}
