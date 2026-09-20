'use client'

import { ExternalLink, LogOut } from 'lucide-react'
import { useSession } from 'next-auth/react'
import { SettingsShell } from '@/components/settings/SettingsShell'
import { Toggle } from '@/components/ui/Toggle'
import { changePasswordInKeycloak, signOutEverywhere } from '@/lib/auth-client'
import { usePreferencesStore } from '@/lib/store'
import { initials } from '@/lib/utils'

// Name, email and password live in Keycloak. Editing them happens either
// through Keycloak's own screens (password: application-initiated action;
// everything else: the realm's account console) - not here, so the realm's
// policies always apply. Phone / travel preferences will come from NestJS
// `/users/me` once that exists (BACKEND_PLAN.md §5.2).
const ACCOUNT_CONSOLE_URL = `${process.env.NEXT_PUBLIC_KEYCLOAK_ISSUER ?? 'http://localhost:8081/realms/smartjourney'}/account`

export default function AccountPage() {
  const { data: session, status } = useSession()
  const { locationAccessEnabled, toggleLocationAccess } = usePreferencesStore()
  const user = session?.user

  if (status === 'loading') {
    return (
      <SettingsShell title="Account" subtitle="Manage your profile, contact details and login">
        <p className="text-sm text-gray-400">Loading…</p>
      </SettingsShell>
    )
  }

  if (!user) {
    return (
      <SettingsShell title="Account" subtitle="Manage your profile, contact details and login">
        <p className="text-sm text-gray-500">
          You&rsquo;re not signed in. <a href="/login" className="font-medium text-royal-700 underline">Sign in</a> to manage your account.
        </p>
      </SettingsShell>
    )
  }

  const isAdmin = user.roles.includes('admin')

  return (
    <SettingsShell title="Account" subtitle="Manage your profile, contact details and login">
      <div className="flex items-center gap-4">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-brand-gradient text-xl font-bold text-white">
          {initials(user.name ?? user.email)}
        </div>
        <div>
          <p className="text-lg font-semibold text-gray-900">{user.name ?? user.email}</p>
          <p className="text-sm text-gray-400">{isAdmin ? 'Platform admin' : 'Traveler account'}</p>
        </div>
      </div>

      <div className="mt-8">
        <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-gray-400">Profile</p>
        <Row label="Name" value={user.name ?? '—'} />
        <Row label="Email" value={user.email ?? '—'} hint="Used for booking confirmations & login" />
        <div className="flex items-center justify-between border-t border-gray-100 py-4">
          <p className="text-xs text-gray-400">Name and email are managed in your SmartJourney account console.</p>
          <a
            href={ACCOUNT_CONSOLE_URL}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-1.5 rounded-lg border border-royal-200 px-3 py-1.5 text-sm font-semibold text-royal-700 hover:bg-royal-50"
          >
            Edit profile <ExternalLink className="h-3.5 w-3.5" />
          </a>
        </div>
      </div>

      <div className="mt-6">
        <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-gray-400">Privacy</p>
        <div className="flex items-center justify-between border-t border-gray-100 py-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-berry-500">Location Access</p>
            <p className="mt-1 font-semibold text-gray-900">Enable location access</p>
            <p className="mt-0.5 text-xs text-gray-400">Lets SmartJourney tailor nearby stops and live directions</p>
          </div>
          <Toggle checked={locationAccessEnabled} onChange={toggleLocationAccess} label="Location access" />
        </div>
      </div>

      <div className="mt-6">
        <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-gray-400">Security</p>
        <div className="flex items-center justify-between border-t border-gray-100 py-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-berry-500">Password</p>
            <p className="mt-1 font-mono text-gray-900">••••••••••</p>
            <p className="mt-0.5 text-xs text-gray-400">You&rsquo;ll confirm your current password, then choose a new one</p>
          </div>
          <button onClick={() => changePasswordInKeycloak('/account')} className="btn-gradient px-4 py-2 text-sm">
            Change password
          </button>
        </div>
        <div className="flex items-center justify-between border-t border-gray-100 py-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-berry-500">Session</p>
            <p className="mt-1 font-semibold text-gray-900">Sign out of SmartJourney</p>
            <p className="mt-0.5 text-xs text-gray-400">Signs you out on this device, including single sign-on</p>
          </div>
          <button
            onClick={() => signOutEverywhere()}
            className="flex items-center gap-1.5 rounded-lg border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50"
          >
            <LogOut className="h-4 w-4" /> Sign out
          </button>
        </div>
      </div>
    </SettingsShell>
  )
}

function Row({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <div className="border-t border-gray-100 py-4">
      <p className="text-xs font-semibold uppercase tracking-wide text-berry-500">{label}</p>
      <p className="mt-1 font-semibold text-gray-900">{value}</p>
      {hint && <p className="mt-0.5 text-xs text-gray-400">{hint}</p>}
    </div>
  )
}
