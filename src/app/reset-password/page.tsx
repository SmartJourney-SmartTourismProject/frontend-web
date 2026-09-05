import Link from 'next/link';

// Stub: BACKEND_PLAN.md §1 defers password-reset emails pending a mail
// provider, so there's no real endpoint to wire this to yet.
export default function ResetPasswordPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-3 bg-gray-50 px-4 text-center">
      <h1 className="font-serif text-2xl font-semibold text-brand-600">Password reset</h1>
      <p className="max-w-sm text-gray-600">
        Password reset isn&apos;t available yet. Please contact support in the meantime.
      </p>
      <Link href="/login" className="text-sm font-medium text-accent-600 hover:underline">
        ← Back to Sign In
      </Link>
    </main>
  );
}
