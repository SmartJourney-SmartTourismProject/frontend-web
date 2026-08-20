'use client'

import { useState } from 'react'
import { Pencil } from 'lucide-react'
import toast from 'react-hot-toast'
import { SettingsShell } from '@/components/settings/SettingsShell'
import { Toggle } from '@/components/ui/Toggle'
import { useAuthStore } from '@/lib/store'

export default function AccountPage() {
  const { user, updateProfile, toggleLocationAccess, changePassword } = useAuthStore()
  const [editingField, setEditingField] = useState<'username' | 'phone' | null>(null)
  const [draft, setDraft] = useState('')

  if (!user) {
    return (
      <SettingsShell title="Account" subtitle="Manage your profile, contact details and login">
        <p className="text-sm text-gray-500">
          You&rsquo;re not signed in. <a href="/login" className="font-medium text-royal-700 underline">Sign in</a> to manage your account.
        </p>
      </SettingsShell>
    )
  }

  function startEdit(field: 'username' | 'phone') {
    setEditingField(field)
    setDraft(field === 'username' ? user!.username : user!.phone ?? '')
  }

  function saveEdit() {
    if (!editingField) return
    updateProfile({ [editingField]: draft } as any)
    setEditingField(null)
    toast.success('Saved')
  }

  return (
    <SettingsShell title="Account" subtitle="Manage your profile, contact details and login">
      <div className="flex items-center gap-4">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-brand-gradient text-xl font-bold text-white">
          {user.avatarInitials}
        </div>
        <div>
          <p className="text-lg font-semibold text-gray-900">{user.username}</p>
          <p className="text-sm text-gray-400">{user.accountType}</p>
        </div>
      </div>

      <div className="mt-8">
        <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-gray-400">Profile</p>
        <FieldRow
          label="Username"
          value={editingField === 'username' ? undefined : user.username}
          editing={editingField === 'username'}
          draft={draft}
          onDraftChange={setDraft}
          onEdit={() => startEdit('username')}
          onSave={saveEdit}
        />
        <div className="border-t border-gray-100 py-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-berry-500">Email</p>
          <p className="mt-1 font-semibold text-gray-900">{user.email}</p>
          <p className="mt-0.5 text-xs text-gray-400">Used for booking confirmations &amp; login</p>
        </div>
        <FieldRow
          label="Phone Number"
          value={editingField === 'phone' ? undefined : user.phone}
          editing={editingField === 'phone'}
          draft={draft}
          onDraftChange={setDraft}
          onEdit={() => startEdit('phone')}
          onSave={saveEdit}
        />
      </div>

      <div className="mt-6">
        <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-gray-400">Privacy</p>
        <div className="flex items-center justify-between border-t border-gray-100 py-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-berry-500">Location Access</p>
            <p className="mt-1 font-semibold text-gray-900">Enable location access</p>
            <p className="mt-0.5 text-xs text-gray-400">Lets SmartJourney tailor nearby stops and live directions</p>
          </div>
          <Toggle checked={user.locationAccessEnabled} onChange={toggleLocationAccess} label="Location access" />
        </div>
      </div>

      <div className="mt-6">
        <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-gray-400">Security</p>
        <div className="flex items-center justify-between border-t border-gray-100 py-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-berry-500">Password</p>
            <p className="mt-1 font-mono text-gray-900">••••••••••</p>
            <p className="mt-0.5 text-xs text-gray-400">Last changed {user.passwordLastChangedLabel}</p>
          </div>
          <a
            href="/reset-password"
            onClick={() => changePassword()}
            className="btn-gradient px-4 py-2 text-sm"
          >
            Change password
          </a>
        </div>
      </div>
    </SettingsShell>
  )
}

function FieldRow({
  label,
  value,
  editing,
  draft,
  onDraftChange,
  onEdit,
  onSave,
}: {
  label: string
  value?: string
  editing: boolean
  draft: string
  onDraftChange: (v: string) => void
  onEdit: () => void
  onSave: () => void
}) {
  return (
    <div className="flex items-center justify-between border-t border-gray-100 py-4">
      <div className="flex-1">
        <p className="text-xs font-semibold uppercase tracking-wide text-berry-500">{label}</p>
        {editing ? (
          <input
            autoFocus
            value={draft}
            onChange={(e) => onDraftChange(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && onSave()}
            className="input mt-1 max-w-xs py-1.5"
          />
        ) : (
          <p className="mt-1 font-semibold text-gray-900">{value}</p>
        )}
      </div>
      <button
        onClick={editing ? onSave : onEdit}
        className="flex items-center gap-1.5 rounded-lg border border-royal-200 px-3 py-1.5 text-sm font-semibold text-royal-700 hover:bg-royal-50"
      >
        <Pencil className="h-3.5 w-3.5" /> {editing ? 'Save' : 'Edit'}
      </button>
    </div>
  )
}
