import type { Metadata } from 'next';
import { Suspense } from 'react';
import { AuthCard } from '@/components/auth/AuthCard';

export const metadata: Metadata = {
  title: 'Create your account · SmartJourney',
  description: 'Create a free SmartJourney account and start planning your Sri Lanka trip.',
};

export default function SignupPage() {
  // AuthCard reads ?callbackUrl / ?error via useSearchParams, which Next 14
  // requires to sit under a Suspense boundary.
  return (
    <Suspense>
      <AuthCard mode="signup" />
    </Suspense>
  );
}
