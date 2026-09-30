'use client';

import { useState, type ReactNode } from 'react';
import { Loader2 } from 'lucide-react';
import { registerWithKeycloak, signInWithKeycloak } from '@/lib/auth-client';

/**
 * Sends the browser straight to Keycloak's sign-in or registration form.
 * The landing page used to link to /login or /signup, which only showed a
 * card with another button that went to Keycloak - two sign-in screens in a
 * row. The spinner covers the moment before the browser leaves the page.
 */
export function AuthLaunchButton({
  mode,
  className,
  children,
  callbackUrl = '/home',
}: {
  mode: 'login' | 'signup';
  className?: string;
  children: ReactNode;
  callbackUrl?: string;
}) {
  const [pending, setPending] = useState(false);

  return (
    <button
      type="button"
      disabled={pending}
      onClick={() => {
        setPending(true);
        void (mode === 'signup' ? registerWithKeycloak(callbackUrl) : signInWithKeycloak(callbackUrl));
      }}
      className={`inline-flex items-center justify-center gap-2 disabled:cursor-wait disabled:opacity-80 ${className ?? ''}`}
    >
      {pending && <Loader2 className="h-4 w-4 animate-spin" />}
      {children}
    </button>
  );
}
