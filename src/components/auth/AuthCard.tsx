'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState, type FormEvent } from 'react';
import { Eye, EyeOff, Plane } from 'lucide-react';

type AuthMode = 'login' | 'signup';

// Auth (BACKEND_PLAN.md §7 Phase 2) is deliberately built last - see
// smartjourney-ui-build-decisions memory. Until it exists, every request
// already runs as the seeded demo user server-side (backend/src/common/
// demo-user.ts), so this form is static UI: it validates shape, then just
// forwards into the app rather than calling a real endpoint.
export function AuthCard({ mode }: { mode: AuthMode }) {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    router.push('/home');
  };

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden">
      <Image src="/images/hero-mountains.png" alt="" fill priority className="object-cover" />
      <div className="absolute inset-0 bg-black/10" />

      <section className="relative w-full max-w-md rounded-3xl bg-white/70 p-8 shadow-2xl backdrop-blur-md">
        <Link href="/" className="mb-4 block text-right text-sm text-gray-700 hover:underline">
          ← Back
        </Link>

        <div className="mb-6 flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-gradient">
            <Plane className="h-6 w-6 rotate-45 text-white" />
          </span>
          <span className="font-serif text-xl font-semibold text-brand-600">SmartJourney</span>
        </div>

        <h1 className="text-center text-3xl font-bold text-gray-900">Welcome Back</h1>
        <p className="mt-1 text-center text-sm text-gray-600">
          {mode === 'login' ? 'Sign in to access your account' : 'Create your account'}
        </p>

        <div className="mt-6 grid grid-cols-2 gap-1 rounded-xl bg-white/60 p-1">
          <Link
            href="/login"
            className={`rounded-lg py-2 text-center text-sm font-semibold transition ${
              mode === 'login' ? 'bg-white text-brand-700 shadow' : 'text-gray-500'
            }`}
          >
            Sign In
          </Link>
          <Link
            href="/signup"
            className={`rounded-lg py-2 text-center text-sm font-semibold transition ${
              mode === 'signup' ? 'bg-white text-brand-700 shadow' : 'text-gray-500'
            }`}
          >
            Sign Up
          </Link>
        </div>

        <form className="mt-6 flex flex-col gap-4" onSubmit={handleSubmit}>
          <label className="flex flex-col gap-1.5 text-sm font-semibold text-gray-800">
            Email Address
            <input
              type="email"
              name="email"
              autoComplete="email"
              required
              placeholder="abc@gmail.com"
              className="rounded-lg border border-gray-300 bg-white/80 px-3 py-2.5 text-sm placeholder:text-gray-400 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
            />
          </label>

          <label className="flex flex-col gap-1.5 text-sm font-semibold text-gray-800">
            Password
            <span className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                minLength={8}
                required
                placeholder="Enter your password"
                className="w-full rounded-lg border border-gray-300 bg-white/80 px-3 py-2.5 pr-10 text-sm placeholder:text-gray-400 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </span>
          </label>

          {mode === 'signup' && (
            <label className="flex flex-col gap-1.5 text-sm font-semibold text-gray-800">
              Re-enter Password
              <span className="relative">
                <input
                  type={showConfirm ? 'text' : 'password'}
                  name="confirmPassword"
                  autoComplete="new-password"
                  minLength={8}
                  required
                  placeholder="Confirm your password"
                  className="w-full rounded-lg border border-gray-300 bg-white/80 px-3 py-2.5 pr-10 text-sm placeholder:text-gray-400 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
                  aria-label={showConfirm ? 'Hide password' : 'Show password'}
                >
                  {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </span>
            </label>
          )}

          {mode === 'login' ? (
            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center gap-2 text-gray-700">
                <input type="checkbox" className="rounded border-gray-300" />
                Remember me
              </label>
              <Link href="/reset-password" className="font-medium text-accent-600 hover:underline">
                Forgot password?
              </Link>
            </div>
          ) : (
            <label className="flex items-center gap-2 text-sm text-gray-700">
              <input type="checkbox" required className="rounded border-gray-300" />
              Agree to Terms &amp; Policies
            </label>
          )}

          <button
            type="submit"
            className="mt-1 rounded-xl bg-brand-gradient px-5 py-3 text-sm font-bold text-white shadow-md transition hover:opacity-90"
          >
            {mode === 'login' ? 'Sign In' : 'Sign Up'}
          </button>
        </form>

        <div className="my-5 flex items-center gap-3 text-xs text-gray-500">
          <span className="h-px flex-1 bg-gray-300" />
          or continue with
          <span className="h-px flex-1 bg-gray-300" />
        </div>

        <button
          type="button"
          onClick={() => router.push('/home')}
          className="flex w-full items-center justify-center gap-2 rounded-xl border border-gray-300 bg-white px-5 py-2.5 text-sm font-medium text-gray-700 shadow-sm transition hover:bg-gray-50"
        >
          <GoogleIcon />
          Google
        </button>
      </section>
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
