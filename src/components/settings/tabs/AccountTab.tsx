'use client';

import { useEffect, useState } from 'react';
import { ExternalLink, LogOut, Pencil } from 'lucide-react';
import { useSession } from 'next-auth/react';
import { Toggle } from '@/components/ui/Toggle';
import { exploreApi, usersApi } from '@/lib/api';
import { changePasswordInKeycloak, signOutEverywhere } from '@/lib/auth-client';
import { initials } from '@/lib/initials';
import type { Me, Tag, TravelStyle, UpdatePreferencesPayload } from '@/lib/types';

// Name, email and password live in Keycloak and come from the next-auth
// session; editing them happens on Keycloak's own screens (password:
// application-initiated action; name/email: the realm's account console) so
// the realm's policies always apply. Everything else on this tab is the
// NestJS `/users/me` record: phone + location toggle on app_user, and the
// travel preferences on traveler_profile that the AI backend reads to fill
// in a trip request the user left vague ("plan me something in Kandy").
const ACCOUNT_CONSOLE_URL = `${
  process.env.NEXT_PUBLIC_KEYCLOAK_ISSUER ?? 'http://localhost:8081/realms/smartjourney'
}/account`;

const TRAVEL_STYLES: { id: TravelStyle; label: string; hint: string }[] = [
  { id: 'budget', label: 'Budget', hint: 'Hostels, local eats, public transport' },
  { id: 'balanced', label: 'Balanced', hint: 'Mid-range stays, a few splurges' },
  { id: 'luxury', label: 'Luxury', hint: 'Top hotels and private transfers' },
];

const CURRENCIES = ['LKR', 'USD', 'EUR', 'GBP', 'INR', 'AUD'];

export function AccountTab() {
  const user = useSession().data?.user;
  const displayName = user?.name ?? user?.email ?? 'Guest';
  const isAdmin = user?.roles.includes('admin') ?? false;

  const [me, setMe] = useState<Me | null>(null);
  const [tags, setTags] = useState<Tag[]>([]);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [saving, setSaving] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);

  const [phoneDraft, setPhoneDraft] = useState('');
  const [editingPhone, setEditingPhone] = useState(false);
  const [budgetDraft, setBudgetDraft] = useState('');

  useEffect(() => {
    let cancelled = false;
    Promise.all([usersApi.me(), exploreApi.getTags()])
      .then(([meRes, tagsRes]) => {
        if (cancelled) return;
        setMe(meRes);
        setTags(tagsRes);
        setBudgetDraft(meRes.preferences.default_budget?.toString() ?? '');
      })
      .catch((err: unknown) => {
        if (!cancelled) setLoadError(err instanceof Error ? err.message : 'Could not load your account');
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const savePhone = async () => {
    if (!me) return;
    setSaving('phone');
    setSaveError(null);
    try {
      const updated = await usersApi.updateMe({ phone: phoneDraft.trim() || null });
      setMe({ ...me, ...updated });
      setEditingPhone(false);
    } catch {
      setSaveError('Could not save your phone number.');
    } finally {
      setSaving(null);
    }
  };

  const saveLocation = async (enabled: boolean) => {
    if (!me) return;
    const previous = me.location_enabled;
    setMe({ ...me, location_enabled: enabled }); // optimistic - it's a toggle
    try {
      await usersApi.updateMe({ location_enabled: enabled });
    } catch {
      setMe((m) => (m ? { ...m, location_enabled: previous } : m));
      setSaveError('Could not update location access.');
    }
  };

  const savePreferences = async (patch: UpdatePreferencesPayload, key: string) => {
    if (!me) return;
    setSaving(key);
    setSaveError(null);
    try {
      const preferences = await usersApi.updatePreferences(patch);
      setMe({ ...me, preferences });
    } catch (err: unknown) {
      const message = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      setSaveError(message ?? 'Could not save your preferences.');
    } finally {
      setSaving(null);
    }
  };

  const toggleInterest = (tag: string) => {
    if (!me) return;
    const current = me.preferences.travel_interests;
    const next = current.includes(tag) ? current.filter((t) => t !== tag) : [...current, tag];
    void savePreferences({ travel_interests: next }, `tag:${tag}`);
  };

  const commitBudget = () => {
    if (!me) return;
    const trimmed = budgetDraft.trim();
    const value = trimmed === '' ? null : Number(trimmed);
    if (value !== null && (!Number.isFinite(value) || value < 0)) {
      setSaveError('Budget must be a positive number.');
      return;
    }
    if (value === me.preferences.default_budget) return;
    void savePreferences({ default_budget: value }, 'budget');
  };

  const prefs = me?.preferences;

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

      {loadError && (
        <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700" role="alert">
          {loadError}
        </p>
      )}
      {saveError && (
        <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700" role="alert">
          {saveError}
        </p>
      )}

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
                value={phoneDraft}
                onChange={(e) => setPhoneDraft(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && void savePhone()}
                placeholder="+94 7X XXX XXXX"
                className="rounded-lg border border-gray-300 px-2 py-1 text-sm"
              />
            ) : (
              <span className="text-sm font-medium text-gray-900">{me ? (me.phone ?? 'Not set') : '…'}</span>
            )
          }
          action={
            editingPhone ? (
              <button
                onClick={() => void savePhone()}
                disabled={saving === 'phone'}
                className="rounded-lg bg-brand-gradient px-3 py-1 text-xs font-semibold text-white disabled:opacity-60"
              >
                {saving === 'phone' ? 'Saving…' : 'Save'}
              </button>
            ) : (
              <EditButton
                disabled={!me}
                onClick={() => {
                  setPhoneDraft(me?.phone ?? '');
                  setEditingPhone(true);
                }}
              />
            )
          }
        />
      </section>

      <section>
        <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">Travel preferences</p>
        <p className="mt-1 text-xs text-gray-500">
          Used to fill in what you leave out of a trip request — interests, pace and budget.
        </p>

        <div className="mt-3 border-t border-gray-100 py-3">
          <p className="text-xs font-semibold text-brand-600">INTERESTS</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {tags.length === 0 && <span className="text-xs text-gray-400">{me ? 'No interest tags available yet.' : '…'}</span>}
            {tags.map((t) => {
              const selected = prefs?.travel_interests.includes(t.tag) ?? false;
              return (
                <button
                  key={t.tag}
                  type="button"
                  onClick={() => toggleInterest(t.tag)}
                  disabled={!me || saving === `tag:${t.tag}`}
                  aria-pressed={selected}
                  className={`rounded-full border px-3 py-1 text-xs font-medium transition disabled:opacity-60 ${
                    selected
                      ? 'border-brand-600 bg-brand-gradient text-white'
                      : 'border-gray-300 bg-white text-gray-700 hover:border-brand-300 hover:bg-brand-50'
                  }`}
                >
                  {t.label}
                </button>
              );
            })}
          </div>
        </div>

        <div className="border-t border-gray-100 py-3">
          <p className="text-xs font-semibold text-brand-600">TRAVEL STYLE</p>
          <div className="mt-2 grid grid-cols-3 gap-2">
            {TRAVEL_STYLES.map((s) => {
              const selected = prefs?.travel_style === s.id;
              return (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => void savePreferences({ travel_style: selected ? null : s.id }, 'style')}
                  disabled={!me || saving === 'style'}
                  aria-pressed={selected}
                  className={`rounded-xl border p-3 text-left transition disabled:opacity-60 ${
                    selected ? 'border-brand-600 bg-brand-50' : 'border-gray-200 hover:border-brand-300'
                  }`}
                >
                  <p className="text-sm font-semibold text-gray-900">{s.label}</p>
                  <p className="mt-0.5 text-xs text-gray-500">{s.hint}</p>
                </button>
              );
            })}
          </div>
        </div>

        <div className="flex items-center justify-between gap-4 border-t border-gray-100 py-3">
          <div>
            <p className="text-xs font-semibold text-brand-600">DEFAULT BUDGET</p>
            <p className="mt-0.5 text-xs text-gray-500">Per trip, when you don&apos;t say otherwise</p>
          </div>
          <div className="flex items-center gap-2">
            <input
              inputMode="numeric"
              value={budgetDraft}
              onChange={(e) => setBudgetDraft(e.target.value)}
              onBlur={commitBudget}
              onKeyDown={(e) => e.key === 'Enter' && (e.target as HTMLInputElement).blur()}
              disabled={!me || saving === 'budget'}
              placeholder="e.g. 60000"
              className="w-28 rounded-lg border border-gray-300 px-2 py-1 text-right text-sm disabled:opacity-60"
            />
            <select
              value={prefs?.currency ?? 'LKR'}
              onChange={(e) => void savePreferences({ currency: e.target.value }, 'currency')}
              disabled={!me || saving === 'currency'}
              className="rounded-lg border border-gray-300 px-2 py-1 text-sm disabled:opacity-60"
              aria-label="Currency"
            >
              {CURRENCIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
        </div>
      </section>

      <section>
        <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">Privacy</p>
        <div className="mt-3 flex items-center justify-between border-t border-gray-100 py-3">
          <div>
            <p className="text-sm font-semibold text-gray-900">Enable location access</p>
            <p className="text-xs text-gray-500">Lets SmartJourney tailor nearby stops and live directions</p>
          </div>
          <Toggle
            checked={me?.location_enabled ?? false}
            onChange={(v) => void saveLocation(v)}
            label="Enable location access"
          />
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

function EditButton({ onClick, disabled }: { onClick: () => void; disabled?: boolean }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="flex items-center gap-1 rounded-lg border border-brand-200 px-2.5 py-1 text-xs font-medium text-brand-700 hover:bg-brand-50 disabled:opacity-60"
    >
      <Pencil className="h-3 w-3" /> Edit
    </button>
  );
}
