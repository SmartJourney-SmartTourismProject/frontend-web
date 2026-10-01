'use client';

import { Logo } from '@/components/ui/Logo';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { useSession } from 'next-auth/react';
import type { ReactNode } from 'react';
import {
  motion,
  useMotionValue,
  useReducedMotion,
  useSpring,
  useTransform,
} from 'framer-motion';
import { KeyRound, Loader2, LogIn, LogOut, UserPlus } from 'lucide-react';
import { EASE_OUT } from '@/lib/motion';
import {
  registerWithKeycloak,
  signInWithGoogle,
  signInWithKeycloak,
  signOutEverywhere,
} from '@/lib/auth-client';

type AuthMode = 'login' | 'signup';

// Login and registration happen on Keycloak's own pages (realm
// `smartjourney`, themed from backend/keycloak/themes/smartjourney) - that's
// where the accounts, the password policy and the Google identity provider
// live. This page forwards straight there; the card itself only shows when
// sign-in failed (?error=...), so the user can read why and retry.
// Nothing here ever sees a password. Middleware sends unauthenticated users
// here with ?callbackUrl=<page they wanted>.

// next-auth's error codes surface as ?error=... on the sign-in page.
const ERROR_MESSAGES: Record<string, string> = {
  OAuthCallback: 'Sign-in was cancelled or Keycloak returned an error. Please try again.',
  OAuthSignin: 'Could not reach the sign-in server. Is Keycloak running?',
  AccessDenied: 'You do not have access to that page.',
  SessionRequired: 'Please sign in to continue.',
  Default: 'Something went wrong while signing in. Please try again.',
};

export function AuthCard({ mode }: { mode: AuthMode }) {
  const params = useSearchParams();
  const callbackUrl = params.get('callbackUrl') ?? '/home';
  const errorCode = params.get('error');
  const [pending, setPending] = useState<'keycloak' | 'google' | null>(null);

  const go = (kind: 'keycloak' | 'google') => {
    setPending(kind);
    if (kind === 'google') return signInWithGoogle(callbackUrl);
    return mode === 'signup' ? registerWithKeycloak(callbackUrl) : signInWithKeycloak(callbackUrl);
  };
  const PrimaryIcon = mode === 'login' ? LogIn : UserPlus;

  // Already signed in (typically: Back from the app into the sign-in
  // pages). Sending this user to Keycloak again either logs the same
  // account straight back in or, if they type another account's password,
  // fails with "already authenticated as different user" - so say who
  // they are and offer the two real choices instead. A session whose token
  // refresh failed doesn't count; the middleware sends those here to sign in
  // again.
  const { data: session, status } = useSession();
  const signedIn = status === 'authenticated' && !session?.error;

  // Straight on to Keycloak's (themed) form: this page is reached from the
  // middleware, an expired session and sign-out, and showing a card whose
  // only job is another sign-in button made two sign-in screens in a row.
  // Not when there's an error - redirecting then would loop on a failing
  // Keycloak, and the user needs to see what went wrong.
  const autoRedirect = !errorCode && status !== 'loading' && !signedIn;
  const redirected = useRef(false);
  useEffect(() => {
    if (!autoRedirect || redirected.current) return;
    redirected.current = true;
    void (mode === 'signup' ? registerWithKeycloak(callbackUrl) : signInWithKeycloak(callbackUrl));
  }, [autoRedirect, mode, callbackUrl]);

  if (signedIn) {
    return <AlreadySignedIn email={session.user?.email} roles={session.user?.roles} callbackUrl={callbackUrl} />;
  }

  if (autoRedirect || (status === 'loading' && !errorCode)) {
    return (
      <main className="relative flex min-h-screen items-center justify-center overflow-hidden">
<AuthBackdrop />
        <p className="glass-strong relative flex items-center gap-3 rounded-2xl px-5 py-3 text-sm font-medium text-gray-800 shadow-lg">
          <span className="relative flex h-9 w-9 items-center justify-center">
            <span aria-hidden className="absolute inset-0 animate-pulse-ring rounded-full bg-accent-500/40" />
            <Logo className="relative h-9 w-9" />
          </span>
          {mode === 'signup' ? 'Taking you to sign-up…' : 'Taking you to sign-in…'}
        </p>
      </main>
    );
  }

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden">
<AuthBackdrop />

      <AuthPanel>
        <Link href="/" className="mb-4 block text-right text-sm text-gray-700 hover:underline">
          ← Back
        </Link>

        <div className="mb-6 flex items-center gap-3">
          <Logo className="h-11 w-11" />
          <span className="font-serif text-xl font-semibold text-brand-600">SmartJourney</span>
        </div>

        <h1 className="text-center text-3xl font-bold text-gray-900">{mode === 'login' ? 'Welcome Back' : 'Create Your Account'}</h1>
        <p className="mt-1 text-center text-sm text-gray-600">
          {mode === 'login' ? 'Sign in to access your account' : 'Create your account'}
        </p>

        <div className="mt-6 grid grid-cols-2 gap-1 rounded-xl bg-white/60 p-1">
          {(
            [
              { href: '/login', label: 'Sign In', tab: 'login' },
              { href: '/signup', label: 'Sign Up', tab: 'signup' },
            ] as const
          ).map(({ href, label, tab }) => (
            <Link
              key={tab}
              href={href}
              className={`relative rounded-lg py-2 text-center text-sm font-semibold transition-colors ${
                mode === tab ? 'text-brand-700' : 'text-gray-500 hover:text-brand-600'
              }`}
            >
              {mode === tab && (
                // Each tab is its own route, so the page remounts; the thumb
                // starts over where the other tab sits and slides into place.
                <motion.span
                  aria-hidden
                  initial={{ x: tab === 'login' ? '105%' : '-105%' }}
                  animate={{ x: 0 }}
                  transition={{ duration: 0.45, ease: EASE_OUT }}
                  className="absolute inset-0 rounded-lg bg-white shadow"
                />
              )}
              <span className="relative">{label}</span>
            </Link>
          ))}
        </div>

        {errorCode && (
          <p className="mt-5 animate-shake rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700" role="alert">
            {ERROR_MESSAGES[errorCode] ?? ERROR_MESSAGES.Default}
          </p>
        )}

        <div className="mt-6 flex flex-col gap-3">
          <button
            type="button"
            disabled={pending !== null}
            onClick={() => go('keycloak')}
            className="btn-shimmer flex items-center justify-center gap-2 rounded-xl bg-brand-gradient px-5 py-3 text-sm font-bold text-white shadow-md transition duration-200 hover:-translate-y-0.5 hover:shadow-glow active:scale-[0.98] disabled:opacity-60"
          >
            {pending === 'keycloak' ? <Loader2 className="h-4 w-4 animate-spin" /> : <PrimaryIcon className="h-4 w-4" />}
            {mode === 'login' ? 'Sign In' : 'Sign Up'}
          </button>
          <p className="text-center text-xs text-gray-600">
            {mode === 'signup'
              ? 'Passwords need 8–12 characters with upper & lower case, a number and a symbol.'
              : 'You will be taken to the secure SmartJourney sign-in page.'}
          </p>
          {mode === 'login' && (
            <p className="flex items-center justify-center gap-1 text-sm text-gray-700">
              <KeyRound className="h-3.5 w-3.5" />
              <Link href="/reset-password" className="font-medium text-accent-600 hover:underline">
                Forgot password?
              </Link>
            </p>
          )}
        </div>

        <div className="my-5 flex items-center gap-3 text-xs text-gray-500">
          <span className="h-px flex-1 bg-gray-300" />
          or continue with
          <span className="h-px flex-1 bg-gray-300" />
        </div>

        <button
          type="button"
          disabled={pending !== null}
          onClick={() => go('google')}
          className="flex w-full items-center justify-center gap-2 rounded-xl border border-gray-300 bg-white px-5 py-2.5 text-sm font-medium text-gray-700 shadow-sm transition hover:bg-gray-50 disabled:opacity-60"
        >
          {pending === 'google' ? <Loader2 className="h-4 w-4 animate-spin" /> : <GoogleIcon />}
          Google
        </button>
      </AuthPanel>
    </main>
  );
}

/** Blurred mountain photo behind the glass card. */
function AuthBackdrop() {
  return (
    <>
      <Image
        src="/images/hero-mountains.png"
        alt=""
        fill
        priority
        className="scale-105 object-cover blur-sm"
      />
      <div className="absolute inset-0 bg-black/10" />
    </>
  );
}

/**
 * The glass card: rises in with a scale, has a soft gradient glow behind its
 * edge, and tilts a few degrees toward the cursor (off under reduced motion).
 */
function AuthPanel({ children }: { children: ReactNode }) {
  const reduced = useReducedMotion();
  const px = useMotionValue(0);
  const py = useMotionValue(0);
  const rotateX = useSpring(useTransform(py, [-0.5, 0.5], [5, -5]), { stiffness: 120, damping: 18 });
  const rotateY = useSpring(useTransform(px, [-0.5, 0.5], [-5, 5]), { stiffness: 120, damping: 18 });

  return (
    <div
      className="relative w-full max-w-md [perspective:1000px]"
      onPointerMove={(e) => {
        if (reduced) return;
        const r = e.currentTarget.getBoundingClientRect();
        px.set((e.clientX - r.left) / r.width - 0.5);
        py.set((e.clientY - r.top) / r.height - 0.5);
      }}
      onPointerLeave={() => {
        px.set(0);
        py.set(0);
      }}
    >
      <div
        aria-hidden
        className="absolute -inset-px animate-gradient-shift rounded-3xl bg-brand-gradient-wide bg-[length:200%_100%] opacity-50 blur-md"
      />
      <motion.section
        initial={reduced ? false : { opacity: 0, y: 40, scale: 0.94 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.6, ease: EASE_OUT }}
        style={reduced ? undefined : { rotateX, rotateY }}
        className="glass-strong relative rounded-3xl p-8 shadow-2xl"
      >
        {children}
      </motion.section>
    </div>
  );
}

function AlreadySignedIn({
  email,
  roles,
  callbackUrl,
}: {
  email?: string | null;
  roles?: string[];
  callbackUrl: string;
}) {
  const router = useRouter();
  const [signingOut, setSigningOut] = useState(false);
  // A signed-in non-admin bounced off /admin lands here with that as the
  // callback; continuing there would just bounce again.
  const target = callbackUrl.startsWith('/admin') && !roles?.includes('admin') ? '/home' : callbackUrl;

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden">
<AuthBackdrop />

      <AuthPanel>
        <div className="mb-6 flex items-center gap-3">
          <Logo className="h-11 w-11" />
          <span className="font-serif text-xl font-semibold text-brand-600">SmartJourney</span>
        </div>

        <h1 className="text-center text-2xl font-bold text-gray-900">You&rsquo;re already signed in</h1>
        <p className="mt-2 text-center text-sm text-gray-600">
          {email ? (
            <>
              Signed in as <span className="font-semibold text-gray-800">{email}</span>.
            </>
          ) : (
            'You have an active session.'
          )}{' '}
          To use a different account, sign out first.
        </p>

        <div className="mt-6 flex flex-col gap-3">
          <button
            type="button"
            disabled={signingOut}
            // replace, not push: this page shouldn't be a Back stop either.
            onClick={() => router.replace(target)}
            className="flex items-center justify-center gap-2 rounded-xl bg-brand-gradient px-5 py-3 text-sm font-bold text-white shadow-md transition hover:opacity-90 disabled:opacity-60"
          >
            Continue to SmartJourney
          </button>
          <button
            type="button"
            disabled={signingOut}
            onClick={() => {
              setSigningOut(true);
              void signOutEverywhere();
            }}
            className="flex items-center justify-center gap-2 rounded-xl border border-gray-300 bg-white px-5 py-2.5 text-sm font-medium text-gray-700 shadow-sm transition hover:bg-gray-50 disabled:opacity-60"
          >
            {signingOut ? <Loader2 className="h-4 w-4 animate-spin" /> : <LogOut className="h-4 w-4" />}
            {signingOut ? 'Signing out…' : 'Sign out and use another account'}
          </button>
        </div>
      </AuthPanel>
    </main>
  );
}

function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4">
      <path
        fill="#4285F4"
        d="M23.49 12.27c0-.79-.07-1.54-.19-2.27H12v4.51h6.47a5.6 5.6 0 0 1-2.4 3.62v3h3.86c2.26-2.09 3.56-5.17 3.56-8.86z"
      />
      <path
        fill="#34A853"
        d="M12 24c3.24 0 5.95-1.08 7.93-2.87l-3.86-3c-1.08.72-2.45 1.15-4.07 1.15-3.13 0-5.78-2.11-6.73-4.96H1.29v3.11A12 12 0 0 0 12 24z"
      />
      <path
        fill="#FBBC05"
        d="M5.27 14.32A7.2 7.2 0 0 1 4.9 12c0-.81.14-1.6.37-2.32V6.57H1.29A12 12 0 0 0 0 12c0 1.94.46 3.77 1.29 5.43z"
      />
      <path
        fill="#EA4335"
        d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.94 1.19 15.24 0 12 0A12 12 0 0 0 1.29 6.57L5.27 9.68C6.22 6.83 8.87 4.75 12 4.75z"
      />
    </svg>
  );
}
