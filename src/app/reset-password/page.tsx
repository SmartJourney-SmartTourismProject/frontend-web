'use client';

import Link from 'next/link';
import { KeyRound } from 'lucide-react';
import { changePasswordInKeycloak } from '@/lib/auth-client';

// Password changes are a Keycloak "application-initiated action": the user
// signs in (or reuses their SSO session), Keycloak shows its change-password
// screen, then returns here. Emailed reset links for users who have
// forgotten their password still need SMTP on the Keycloak side
// (BACKEND_PLAN.md §1 defers a mail provider).
export default function ResetPasswordPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4 bg-gray-50 px-4 text-center">
      <h1 className="font-serif text-2xl font-semibold text-brand-600">Change your password</h1>
      <p className="max-w-sm text-gray-600">
        You&apos;ll be asked to sign in with your current password, then to choose a new one (8–12
        characters with upper &amp; lower case, a number and a symbol).
      </p>
      <button
        type="button"
        onClick={() => changePasswordInKeycloak('/home')}
        className="flex items-center gap-2 rounded-xl bg-brand-gradient px-5 py-3 text-sm font-bold text-white shadow-md transition hover:opacity-90"
      >
        <KeyRound className="h-4 w-4" /> Change password
      </button>
      <p className="max-w-sm text-xs text-gray-500">
        Forgotten it completely? Emailed reset links aren&apos;t available yet - please contact support.
      </p>
      <Link href="/login" className="text-sm font-medium text-accent-600 hover:underline">
        ← Back to Sign In
      </Link>
    </main>
  );
}
