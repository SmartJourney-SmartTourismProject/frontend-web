import { Suspense } from 'react';
import { AuthCard } from '@/components/auth/AuthCard';

export default function SignupPage() {
  // AuthCard reads ?callbackUrl / ?error via useSearchParams, which Next 14
  // requires to sit under a Suspense boundary.
  return (
    <Suspense>
      <AuthCard mode="signup" />
    </Suspense>
  );
}
