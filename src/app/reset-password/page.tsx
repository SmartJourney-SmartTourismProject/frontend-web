import type { Metadata } from 'next'
import { AuthPageShell } from '@/components/marketing/AuthPageShell'

export const metadata: Metadata = { title: 'Change Password · SmartJourney' }

export default function ResetPasswordPage() {
  return <AuthPageShell mode="reset" />
}
