'use client';

import { useState } from 'react';
import { ExternalLink, LogOut, Pencil } from 'lucide-react';
import { useSession } from 'next-auth/react';
import { Toggle } from '@/components/ui/Toggle';
import { changePasswordInKeycloak, signOutEverywhere } from '@/lib/auth-client';
import { initials } from '@/lib/initials';

// Name, email and password live in Keycloak and come from the next-auth
// session. Editing them happens on Keycloak's own screens (password:
// application-initiated action; name/email: the realm's account console) so
// the realm's policies always apply. Phone and the location toggle have no
// server home until NestJS /users/me exists (BACKEND_PLAN.md §5.2), so they
// stay local-only, matching Subscription/Notifications.
const ACCOUNT_CONSOLE_URL = `${
  process.env.NEXT_PUBLIC_KEYCLOAK_ISSUER ?? 'http://localhost:8081/realms/smartjourney'
}/account`;

export function AccountTab() {
  const user = useSession().data?.user;
  const displayName = user?.name ?? user?.email ?? 'Guest';
  const isAdmin = user?.roles.includes('admin') ?? false;
  const [phone, setPhone] = useState('+94 71 000 0000');
  const [editingPhone, setEditingPhone] = useState(false);
  const [locationEnabled, setLocationEnabled] = useState(true);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-4">
        <span className="flex h-14 w-14 items-center justify-center rounded-full bg-brand-gradient text-lg font-semibold text-white">
          {initials(user?.name ?? user?.email)}
        </span>
        <div>
          <p className="text-base font-bold text-gray-900">{displayName}</p>
          <p className="text-sm text-gray-500">{isAdmin ? 'Platform admin' : 'Traveler account'}</p>
        </div>
      </div>

      <section>
        <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">Profile</p>

        <Field
          label="Name"
          value={<span className="text-sm font-medium text-gray-900">{user?.name ?? '—'}</span>}
          action={
            <a
              href={ACCOUNT_CONSOLE_URL}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1 rounded-lg border border-brand-200 px-2.5 py-1 text-xs font-medium text-brand-700 hover:bg-brand-50"
            >
              <ExternalLink className="h-3 w-3" /> Edit
            </a>
          }
        />

        <Field
          label="Email"
          sub="Used for booking confirmations & login"
          value={<span className="text-sm font-medium text-gray-900">{user?.email ?? '—'}</span>}
        />

        <Field
          label="Phone number"
          value={
            editingPhone ? (
              <input
                autoFocus
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                onBlur={() => setEditingPhone(false)}
                className="rounded-lg border border-gray-300 px-2 py-1 text-sm"
              />
            ) : (
              <span className="text-sm font-medium text-gray-900">{phone}</span>
            )
          }
          action={<EditButton onClick={() => setEditingPhone((v) => !v)} />}
        />
      </section>

      <section>
        <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">Privacy</p>
        <div className="mt-3 flex items-center justify-between border-t border-gray-100 py-3">
          <div>
            <p className="text-sm font-semibold text-gray-900">Enable location access</p>
            <p className="text-xs text-gray-500">Lets SmartJourney tailor nearby stops and live directions</p>
          </div>
          <Toggle checked={locationEnabled} onChange={setLocationEnabled} label="Enable location access" />
        </div>
      </section>

      <section>
        <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">Security</p>
        <div className="mt-3 flex items-center justify-between border-t border-gray-100 py-3">
          <div>
            <p className="text-sm font-semibold tracking-widest text-gray-900">••••••••••</p>
            <p className="text-xs text-gray-500">You&apos;ll confirm your current password, then choose a new one</p>
          </div>
          <button
            type="button"
            onClick={() => changePasswordInKeycloak('/home')}
            className="rounded-xl bg-brand-gradient px-4 py-2 text-xs font-semibold text-white hover:opacity-90"
          >
            Change password
          </button>
        </div>
        <div className="flex items-center justify-between border-t border-gray-100 py-3">
          <div>
            <p className="text-sm font-semibold text-gray-900">Sign out of SmartJourney</p>
            <p className="text-xs text-gray-500">Signs you out on this device, including single sign-on</p>
          </div>
          <button
            type="button"
            onClick={() => signOutEverywhere()}
            className="flex items-center gap-1.5 rounded-xl border border-gray-300 px-4 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50"
          >
            <LogOut className="h-3.5 w-3.5" /> Sign out
          </button>
        </div>
      </section>
    </div>
  );
}

function Field({
  label,
  sub,
  value,
  action,
}: {
  label: string;
  sub?: string;
  value: React.ReactNode;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between border-t border-gray-100 py-3">
      <div>
        <p className="text-xs font-semibold text-brand-600">{label.toUpperCase()}</p>
        <div className="mt-0.5">{value}</div>
        {sub && <p className="mt-0.5 text-xs text-gray-400">{sub}</p>}
      </div>
      {action}
    </div>
  );
}

function EditButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-1 rounded-lg border border-brand-200 px-2.5 py-1 text-xs font-medium text-brand-700 hover:bg-brand-50"
    >
      <Pencil className="h-3 w-3" /> Edit
    </button>
  );
}
