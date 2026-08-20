import type { Metadata } from 'next'
import { AuthPageShell } from '@/components/marketing/AuthPageShell'

export const metadata: Metadata = { title: 'Sign In · SmartJourney' }

export default function LoginPage() {
  return <AuthPageShell mode="signin" />
}
