'use client';

import { useEffect, useState } from 'react';
import { Bell, Clock, CloudRain, DollarSign, Loader2, Mail, Send, Volume2 } from 'lucide-react';
import { useSession } from 'next-auth/react';
import { Toggle } from '@/components/ui/Toggle';
import { usersApi } from '@/lib/api';
import type { NotificationSettings, UpdateNotificationSettingsPayload } from '@/lib/types';

// Saved to /users/me/notification-settings as you change them. With "Email
// notifications" on, the backend emails the signed-in user for each kind of
// update switched on above it (trip reminders + saved-trip confirmations,
// rain forecast on a trip day, a trip nearing / going over its budget).
// Push and sound are remembered but nothing delivers push yet.
type BoolKey = {
  [K in keyof NotificationSettings]: NotificationSettings[K] extends boolean ? K : never;
}[keyof NotificationSettings];

interface Pref {
  key: BoolKey;
  icon: typeof Bell;
  label: string;
  sub: string;
}

const TRIP_UPDATES: Pref[] = [
  { key: 'trip_reminders', icon: Clock, label: 'Trip reminders', sub: 'A reminder the day before a trip starts, and a confirmation when you save one' },
  { key: 'weather_alerts', icon: CloudRain, label: 'Weather alerts', sub: 'Rain or forecast changes that affect your itinerary' },
  { key: 'budget_alerts', icon: DollarSign, label: 'Budget alerts', sub: 'Notify me when a trip nears its budget limit' },
];

const PUSH: Pref = { key: 'push_enabled', icon: Bell, label: 'Push notifications', sub: 'Alerts on this device' };
const EMAIL: Pref = { key: 'email_enabled', icon: Mail, label: 'Email notifications', sub: 'Send the updates above to my email' };

export function NotificationsTab() {
  const email = useSession().data?.user?.email;
  const [settings, setSettings] = useState<NotificationSettings | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [testState, setTestState] = useState<'idle' | 'sending' | 'sent'>('idle');

  useEffect(() => {
    let cancelled = false;
    usersApi
      .getNotificationSettings()
      .then((s) => !cancelled && setSettings(s))
      .catch(() => !cancelled && setError('Could not load your notification settings.'));
    return () => {
      cancelled = true;
    };
  }, []);

  /** Optimistic: flip it now, roll back if the save fails. */
  const save = async (patch: UpdateNotificationSettingsPayload) => {
    if (!settings) return;
    const previous = settings;
    setSettings({ ...settings, ...patch });
    setError(null);
    try {
      setSettings(await usersApi.updateNotificationSettings(patch));
    } catch {
      setSettings(previous);
      setError('Could not save that change. Try again.');
    }
  };

  const sendTest = async () => {
    setTestState('sending');
    setError(null);
    try {
      await usersApi.sendTestNotification();
      setTestState('sent');
    } catch (err: unknown) {
      const message = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      setError(message ?? 'Could not send the test email.');
      setTestState('idle');
    }
  };

  if (!settings) {
    return error ? (
      <ErrorBanner message={error} />
    ) : (
      <div className="flex items-center gap-2 py-10 text-sm text-gray-500">
        <Loader2 className="h-4 w-4 animate-spin" /> Loading notification settings…
      </div>
    );
  }

  const onChange = (key: BoolKey, value: boolean) => {
    if (key === 'email_enabled') setTestState('idle');
    void save({ [key]: value });
  };

  return (
    <div className="flex flex-col gap-6">
      {error && <ErrorBanner message={error} />}

      <PrefGroup title="Trip updates" prefs={TRIP_UPDATES} values={settings} onChange={onChange} />

      <section>
        <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Delivery</p>
        <PrefRow pref={PUSH} checked={settings.push_enabled} onChange={(v) => onChange('push_enabled', v)} />
        <PrefRow
          pref={{ ...EMAIL, sub: email ? `Send the updates above to ${email}` : EMAIL.sub }}
          checked={settings.email_enabled}
          onChange={(v) => onChange('email_enabled', v)}
        />
        {settings.email_enabled && (
          <div className="ml-12 flex flex-wrap items-center gap-3 pb-3">
            <button
              type="button"
              onClick={sendTest}
              disabled={testState === 'sending'}
              className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-60"
            >
              {testState === 'sending' ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Send className="h-3.5 w-3.5" />}
              Send test email
            </button>
            {testState === 'sent' && <span className="text-xs font-medium text-emerald-700">Sent. Check your inbox.</span>}
          </div>
        )}
      </section>

      <section>
        <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Sound</p>
        <PrefRow
          pref={{ key: 'sound_enabled', icon: Volume2, label: 'Notification sound', sub: 'Play a sound with alerts' }}
          checked={settings.sound_enabled}
          onChange={(v) => onChange('sound_enabled', v)}
        />
      </section>
    </div>
  );
}

function ErrorBanner({ message }: { message: string }) {
  return (
    <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700" role="alert">
      {message}
    </p>
  );
}

function PrefGroup({
  title,
  prefs,
  values,
  onChange,
}: {
  title: string;
  prefs: Pref[];
  values: NotificationSettings;
  onChange: (key: BoolKey, value: boolean) => void;
}) {
  return (
    <section>
      <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">{title}</p>
      {prefs.map((pref) => (
        <PrefRow key={pref.key} pref={pref} checked={values[pref.key]} onChange={(v) => onChange(pref.key, v)} />
      ))}
    </section>
  );
}

function PrefRow({ pref, checked, onChange }: { pref: Pref; checked: boolean; onChange: (value: boolean) => void }) {
  return (
    <div className="flex items-center justify-between border-t border-gray-100 py-3">
      <div className="flex items-center gap-3">
        <IconBadge icon={pref.icon} />
        <div>
          <p className="text-sm font-semibold text-gray-900">{pref.label}</p>
          <p className="text-xs text-gray-500">{pref.sub}</p>
        </div>
      </div>
      <Toggle checked={checked} onChange={onChange} label={pref.label} />
    </div>
  );
}

function IconBadge({ icon: Icon }: { icon: typeof Bell }) {
  return (
    <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
      <Icon className="h-4 w-4" />
    </span>
  );
}
