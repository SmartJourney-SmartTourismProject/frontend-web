import type { Metadata } from 'next'
import { AuthPageShell } from '@/components/marketing/AuthPageShell'

export const metadata: Metadata = { title: 'Sign Up · SmartJourney' }

export default function SignUpPage() {
  return <AuthPageShell mode="signup" />
}
