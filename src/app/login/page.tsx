import type { Metadata } from 'next';
import { Suspense } from 'react';
import { AuthCard } from '@/components/auth/AuthCard';

export const metadata: Metadata = {
  title: 'Sign in · SmartJourney',
  description: 'Sign in to your SmartJourney account.',
};

export default function LoginPage() {
  // AuthCard reads ?callbackUrl / ?error via useSearchParams, which Next 14
  // requires to sit under a Suspense boundary.
  return (
    <Suspense>
      <AuthCard mode="login" />
    </Suspense>
  );
}
