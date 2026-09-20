'use client'

import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { useState } from 'react'
import { ArrowLeft, KeyRound, Loader2, LogIn, UserPlus } from 'lucide-react'
import { LogoWordmark } from '@/components/ui/Logo'
import {
  changePasswordInKeycloak,
  registerWithKeycloak,
  signInWithGoogle,
  signInWithKeycloak,
} from '@/lib/auth-client'

// Login, registration and password changes all happen on Keycloak's own
// pages (realm `smartjourney`) - that's where the accounts, the password
// policy and the Google identity provider live. This card is the launcher:
// it explains what's about to happen and sends the browser to the right
// Keycloak screen. Nothing here ever sees a password.

type Mode = 'signin' | 'signup' | 'reset'

const TABS: { id: Mode; label: string; href: string }[] = [
  { id: 'signin', label: 'Sign In', href: '/login' },
  { id: 'signup', label: 'Sign Up', href: '/signup' },
]

// next-auth's error codes surface as ?error=… on the sign-in page.
const ERROR_MESSAGES: Record<string, string> = {
  OAuthCallback: 'Sign-in was cancelled or Keycloak returned an error. Please try again.',
  OAuthSignin: 'Could not reach the sign-in server. Is Keycloak running?',
  AccessDenied: 'You do not have access to that page.',
  SessionRequired: 'Please sign in to continue.',
  Default: 'Something went wrong while signing in. Please try again.',
}

export function AuthCard({ mode }: { mode: Mode }) {
  const params = useSearchParams()
  const callbackUrl = params.get('callbackUrl') ?? '/home'
  const errorCode = params.get('error')
  const [pending, setPending] = useState<'keycloak' | 'google' | null>(null)

  const tabs =
    mode === 'reset'
      ? [
          { id: 'signin' as Mode, label: 'Sign In', href: '/login' },
          { id: 'reset' as Mode, label: 'Change Password', href: '/reset-password' },
        ]
      : TABS

  const title = mode === 'signin' ? 'Welcome Back' : mode === 'signup' ? 'Create Your Account' : 'Change Your Password'
  const subtitle =
    mode === 'signin'
      ? 'Sign in to access your account'
      : mode === 'signup'
        ? 'Join SmartJourney in a few seconds'
        : 'You will be asked to sign in, then to choose a new password'

  async function go(kind: 'keycloak' | 'google') {
    setPending(kind)
    if (kind === 'google') return signInWithGoogle(callbackUrl)
    if (mode === 'signup') return registerWithKeycloak(callbackUrl)
    if (mode === 'reset') return changePasswordInKeycloak('/account')
    return signInWithKeycloak(callbackUrl)
  }

  const primaryLabel = mode === 'signin' ? 'Sign In' : mode === 'signup' ? 'Sign Up' : 'Change Password'
  const PrimaryIcon = mode === 'signin' ? LogIn : mode === 'signup' ? UserPlus : KeyRound

  return (
    <div className="relative w-full max-w-md rounded-3xl border border-white/40 bg-white/85 p-8 shadow-2xl shadow-royal-950/20 backdrop-blur-xl sm:p-10">
      <Link
        href="/"
        className="absolute right-6 top-6 flex items-center gap-1 text-sm text-gray-500 hover:text-gray-800"
      >
        <ArrowLeft className="h-3.5 w-3.5" /> Back
      </Link>

      <LogoWordmark className="mb-6" textClassName="text-royal-700 uppercase" />

      <h1 className="font-display text-3xl font-bold text-gray-900">{title}</h1>
      <p className="mt-1 text-sm text-gray-500">{subtitle}</p>

      <div className="mt-6 grid grid-cols-2 gap-1 rounded-xl bg-gray-100 p-1">
        {tabs.map((tab) => (
          <Link
            key={tab.id}
            href={tab.href}
            className={`rounded-lg py-2 text-center text-sm font-semibold transition ${
              tab.id === mode ? 'bg-white text-royal-700 shadow-sm' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {tab.label}
          </Link>
        ))}
      </div>

      {errorCode && (
        <p className="mt-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700" role="alert">
          {ERROR_MESSAGES[errorCode] ?? ERROR_MESSAGES.Default}
        </p>
      )}

      <div className="mt-6 space-y-3">
        <button
          type="button"
          disabled={pending !== null}
          onClick={() => go('keycloak')}
          className="btn-gradient flex w-full items-center justify-center gap-2 py-3.5 text-base disabled:opacity-60"
        >
          {pending === 'keycloak' ? <Loader2 className="h-4 w-4 animate-spin" /> : <PrimaryIcon className="h-4 w-4" />}
          {primaryLabel}
        </button>
        <p className="text-center text-xs text-gray-400">
          {mode === 'signup'
            ? 'Passwords need 8–12 characters with upper & lower case, a number and a symbol.'
            : 'You will be taken to the secure SmartJourney sign-in page.'}
        </p>
      </div>

      {mode !== 'reset' && (
        <>
          <div className="my-6 flex items-center gap-3">
            <div className="h-px flex-1 bg-gray-200" />
            <span className="text-xs text-gray-400">or continue with</span>
            <div className="h-px flex-1 bg-gray-200" />
          </div>
          <button
            type="button"
            disabled={pending !== null}
            onClick={() => go('google')}
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-gray-300 bg-white py-3 text-sm font-semibold text-gray-700 shadow-sm transition hover:bg-gray-50 disabled:opacity-60"
          >
            {pending === 'google' ? <Loader2 className="h-4 w-4 animate-spin" /> : <GoogleIcon className="h-4 w-4" />} Google
          </button>
          {mode === 'signin' && (
            <p className="mt-5 text-center text-sm text-gray-500">
              Forgot your password?{' '}
              <Link href="/reset-password" className="font-medium text-berry-600 hover:text-berry-700">
                Change it here
              </Link>
            </p>
          )}
        </>
      )}
    </div>
  )
}

function GoogleIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" />
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.99.66-2.25 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A10.99 10.99 0 0 0 12 23z" />
      <path fill="#FBBC05" d="M5.84 14.1a6.6 6.6 0 0 1 0-4.2V7.06H2.18a11 11 0 0 0 0 9.88l3.66-2.84z" />
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84C6.71 7.3 9.14 5.38 12 5.38z" />
    </svg>
  )
}
