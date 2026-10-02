'use client';

import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, LayoutGroup, motion, useReducedMotion, type Variants } from 'framer-motion';
import { Camera, Check, ExternalLink, Loader2, LogOut, Pencil, Trash2 } from 'lucide-react';
import { useSession } from 'next-auth/react';
import { Toggle } from '@/components/ui/Toggle';
import { exploreApi, usersApi } from '@/lib/api';
import { changePasswordInKeycloak, signOutEverywhere } from '@/lib/auth-client';
import { Avatar } from '@/components/ui/Avatar';
import { useProfileStore } from '@/lib/profile-store';
import { resizeAvatar } from '@/lib/resize-avatar';
import type { Me, Tag, TravelStyle, UpdatePreferencesPayload } from '@/lib/types';
import { EASE_OUT, SPRING, SPRING_BOUNCY } from '@/lib/motion';

// Sections rise in one after another when the tab opens.
const STAGGER: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08 } },
};
const SECTION: Variants = {
  hidden: { opacity: 0, y: 14 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: EASE_OUT } },
};

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

  const reduced = useReducedMotion();
  // Every change here saves as you make it (there is no Save-all button), so
  // a brief "Saved" confirmation is what tells the traveler it worked.
  const [justSaved, setJustSaved] = useState(false);
  const savedTimer = useRef<ReturnType<typeof setTimeout>>();
  const flashSaved = () => {
    setJustSaved(true);
    clearTimeout(savedTimer.current);
    savedTimer.current = setTimeout(() => setJustSaved(false), 1800);
  };
  useEffect(() => () => clearTimeout(savedTimer.current), []);

  const [phoneDraft, setPhoneDraft] = useState('');
  const [editingPhone, setEditingPhone] = useState(false);
  const [budgetDraft, setBudgetDraft] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);
  const avatarUrl = useProfileStore((s) => s.avatarUrl);
  const setAvatarUrl = useProfileStore((s) => s.setAvatarUrl);
  const setLocationEnabled = useProfileStore((s) => s.setLocationEnabled);

  useEffect(() => {
    let cancelled = false;
    Promise.all([usersApi.me(), exploreApi.getTags()])
      .then(([meRes, tagsRes]) => {
        if (cancelled) return;
        setMe(meRes);
        setAvatarUrl(meRes.avatar_url);
        setTags(tagsRes);
        setBudgetDraft(meRes.preferences.default_budget?.toString() ?? '');
      })
      .catch((err: unknown) => {
        if (!cancelled) setLoadError(err instanceof Error ? err.message : 'Could not load your account');
      });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- load once on open
  }, []);

  const savePhone = async () => {
    if (!me) return;
    setSaving('phone');
    setSaveError(null);
    try {
      const updated = await usersApi.updateMe({ phone: phoneDraft.trim() || null });
      setMe({ ...me, ...updated });
      setEditingPhone(false);
      flashSaved();
    } catch {
      setSaveError('Could not save your phone number.');
    } finally {
      setSaving(null);
    }
  };

  const saveAvatar = async (next: string | null) => {
    setSaving('avatar');
    setSaveError(null);
    try {
      await usersApi.updateMe({ avatar_url: next });
      setAvatarUrl(next);
      flashSaved();
    } catch {
      setSaveError('Could not save your profile picture.');
    } finally {
      setSaving(null);
    }
  };

  const onPickAvatar = async (file: File | undefined) => {
    if (!file) return;
    try {
      await saveAvatar(await resizeAvatar(file));
    } catch (err: unknown) {
      setSaveError(err instanceof Error ? err.message : 'Could not use that image.');
    }
  };

  const saveLocation = async (enabled: boolean) => {
    if (!me) return;
    const previous = me.location_enabled;
    setMe({ ...me, location_enabled: enabled }); // optimistic - it's a toggle
    setLocationEnabled(enabled); // the open chat starts/stops using location now
    try {
      await usersApi.updateMe({ location_enabled: enabled });
      flashSaved();
    } catch {
      setMe((m) => (m ? { ...m, location_enabled: previous } : m));
      setLocationEnabled(previous);
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
      flashSaved();
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
    <motion.div
      initial={reduced ? false : 'hidden'}
      animate="visible"
      variants={STAGGER}
      className="flex flex-col gap-6"
    >
      <motion.div variants={SECTION} className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="relative">
            <Avatar src={avatarUrl} name={user?.name ?? user?.email} className="h-16 w-16 text-xl" />
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              disabled={saving === 'avatar'}
              aria-label="Change profile picture"
              title="Change profile picture"
              className="absolute -bottom-1 -right-1 flex h-7 w-7 items-center justify-center rounded-full border-2 border-white bg-brand-600 text-white shadow transition hover:bg-brand-700 disabled:opacity-60"
            >
              {saving === 'avatar' ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Camera className="h-3.5 w-3.5" />}
            </button>
            <input
              ref={fileRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="hidden"
              onChange={(e) => {
                void onPickAvatar(e.target.files?.[0]);
                e.target.value = ''; // allow picking the same file again
              }}
            />
          </div>
          <div>
            <p className="text-base font-bold text-gray-900">{displayName}</p>
            <p className="text-sm text-gray-500">{isAdmin ? 'Platform admin' : 'Traveler account'}</p>
            {avatarUrl && (
              <button
                type="button"
                onClick={() => void saveAvatar(null)}
                disabled={saving === 'avatar'}
                className="mt-1 flex items-center gap-1 text-xs font-medium text-gray-500 hover:text-red-600 disabled:opacity-60"
              >
                <Trash2 className="h-3 w-3" /> Remove photo
              </button>
            )}
          </div>
        </div>
        <SaveStatus saving={saving !== null} saved={justSaved} />
      </motion.div>

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

      <motion.section variants={SECTION}>
        <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Profile</p>

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
      </motion.section>

      <motion.section variants={SECTION}>
        <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Travel preferences</p>
        <p className="mt-1 text-xs text-gray-500">
          Used to fill in what you leave out of a trip request — interests, pace and budget.
        </p>

        <div className="mt-3 border-t border-gray-100 py-3">
          <p className="text-xs font-semibold text-brand-600">INTERESTS</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {tags.length === 0 && <span className="text-xs text-gray-500">{me ? 'No interest tags available yet.' : '…'}</span>}
            {tags.map((t) => {
              const selected = prefs?.travel_interests.includes(t.tag) ?? false;
              return (
                <motion.button
                  key={t.tag}
                  type="button"
                  onClick={() => toggleInterest(t.tag)}
                  disabled={!me || saving === `tag:${t.tag}`}
                  aria-pressed={selected}
                  whileTap={reduced ? undefined : { scale: 0.9 }}
                  transition={SPRING}
                  className={`relative overflow-hidden rounded-full border px-3 py-1 text-xs font-medium transition-colors duration-200 disabled:opacity-60 ${
                    selected ? 'border-brand-600' : 'border-gray-300 hover:border-brand-300'
                  }`}
                >
                  {/* The brand gradient can't be color-transitioned, so it grows in on its own layer. */}
                  <motion.span
                    aria-hidden
                    className="absolute inset-0 bg-brand-gradient"
                    initial={false}
                    animate={{ opacity: selected ? 1 : 0, scale: selected ? 1 : 0.6 }}
                    transition={reduced ? { duration: 0 } : SPRING}
                  />
                  <span
                    className={`relative transition-colors duration-200 ${
                      selected ? 'text-white' : 'text-gray-700'
                    }`}
                  >
                    {t.label}
                  </span>
                </motion.button>
              );
            })}
          </div>
        </div>

        <div className="border-t border-gray-100 py-3">
          <p className="text-xs font-semibold text-brand-600">TRAVEL STYLE</p>
          <LayoutGroup id="travel-style">
            <div className="mt-2 grid grid-cols-3 gap-2">
              {TRAVEL_STYLES.map((s) => {
                const selected = prefs?.travel_style === s.id;
                return (
                  <motion.button
                    key={s.id}
                    type="button"
                    onClick={() => void savePreferences({ travel_style: selected ? null : s.id }, 'style')}
                    disabled={!me || saving === 'style'}
                    aria-pressed={selected}
                    whileTap={reduced ? undefined : { scale: 0.96 }}
                    transition={SPRING}
                    className="relative rounded-xl border border-gray-200 p-3 text-left transition-colors hover:border-brand-300 disabled:opacity-60"
                  >
                    {selected && (
                      // One highlight shared by the three cards: it glides to whichever is picked.
                      <motion.span
                        layoutId="travel-style-active"
                        transition={reduced ? { duration: 0 } : SPRING}
                        className="absolute inset-0 rounded-xl border-2 border-brand-600 bg-brand-50"
                      />
                    )}
                    <p className="relative text-sm font-semibold text-gray-900">{s.label}</p>
                    <p className="relative mt-0.5 text-xs text-gray-500">{s.hint}</p>
                  </motion.button>
                );
              })}
            </div>
          </LayoutGroup>
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
      </motion.section>

      <motion.section variants={SECTION}>
        <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Privacy</p>
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
      </motion.section>

      <motion.section variants={SECTION}>
        <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Security</p>
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
      </motion.section>
    </motion.div>
  );
}

function SaveStatus({ saving, saved }: { saving: boolean; saved: boolean }) {
  return (
    <div className="h-7 min-w-[6rem] text-right" aria-live="polite">
      <AnimatePresence mode="wait" initial={false}>
        {saving ? (
          <motion.span
            key="saving"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="inline-flex items-center gap-1.5 rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-600"
          >
            <Loader2 className="h-3.5 w-3.5 animate-spin" /> Saving…
          </motion.span>
        ) : saved ? (
          <motion.span
            key="saved"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700"
          >
            {/* The spinner "morphs" into a check that pops in with a spring. */}
            <motion.span initial={{ scale: 0, rotate: -30 }} animate={{ scale: 1, rotate: 0 }} transition={SPRING_BOUNCY}>
              <Check className="h-3.5 w-3.5" />
            </motion.span>
            Saved
          </motion.span>
        ) : null}
      </AnimatePresence>
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
        {sub && <p className="mt-0.5 text-xs text-gray-500">{sub}</p>}
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
