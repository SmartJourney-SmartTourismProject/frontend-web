'use client';

import { useState } from 'react';
import { Pencil } from 'lucide-react';
import { Toggle } from '@/components/ui/Toggle';

// Auth (BACKEND_PLAN.md §7 Phase 2) is deliberately last, and there's no
// /users endpoint yet - so this is static UI: edits are local-only and
// reset when the modal reopens, matching the pattern already used for
// Subscription/Notifications. See smartjourney-ui-build-decisions memory.
export function AccountTab() {
  const [username, setUsername] = useState('STT');
  const [phone, setPhone] = useState('+94 71 000 0000');
  const [editingUsername, setEditingUsername] = useState(false);
  const [editingPhone, setEditingPhone] = useState(false);
  const [locationEnabled, setLocationEnabled] = useState(true);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-4">
        <span className="flex h-14 w-14 items-center justify-center rounded-full bg-brand-gradient text-lg font-semibold text-white">
          {username.slice(0, 2).toUpperCase()}
        </span>
        <div>
          <p className="text-base font-bold text-gray-900">{username}</p>
          <p className="text-sm text-gray-500">Traveler account</p>
        </div>
      </div>

      <section>
        <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">Profile</p>

        <Field
          label="Username"
          value={
            editingUsername ? (
              <input
                autoFocus
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                onBlur={() => setEditingUsername(false)}
                className="rounded-lg border border-gray-300 px-2 py-1 text-sm"
              />
            ) : (
              <span className="text-sm font-medium text-gray-900">{username}</span>
            )
          }
          action={<EditButton onClick={() => setEditingUsername((v) => !v)} />}
        />

        <Field
          label="Email"
          sub="Used for booking confirmations & login"
          value={<span className="text-sm font-medium text-gray-900">stt@gmail.com</span>}
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
            <p className="text-xs text-gray-500">Last changed 3 months ago</p>
          </div>
          <button className="rounded-xl bg-brand-gradient px-4 py-2 text-xs font-semibold text-white hover:opacity-90">
            Change password
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
