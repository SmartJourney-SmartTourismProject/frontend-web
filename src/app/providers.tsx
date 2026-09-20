'use client';

import type { Session } from 'next-auth';
import { SessionProvider } from 'next-auth/react';

// `session` comes from getServerSession() in the root layout. With it,
// SessionProvider skips its mount-time fetch of /api/auth/session. Without
// it, dev-mode StrictMode double-mount fires two such fetches in parallel;
// each mints a CSRF cookie, and if the slower one lands after signIn() has
// already read the token from /api/auth/csrf, next-auth rejects the sign-in
// POST as a CSRF mismatch ("Sign In does nothing the first time" after a
// recompile). Seeding the session removes that race entirely.
export function Providers({ children, session }: { children: React.ReactNode; session: Session | null }) {
  return <SessionProvider session={session}>{children}</SessionProvider>;
}
