'use client';

import { useState } from 'react';
import { Bell, Clock, CloudRain, DollarSign, Mail, Minus, Plus, Volume2 } from 'lucide-react';
import { Toggle } from '@/components/ui/Toggle';

// Static, per smartjourney-ui-build-decisions memory: notification_settings
// stays deferred. Preferences are local-only and reset when the modal
// reopens - this demonstrates the UI, it doesn't persist anything.
interface Pref {
  key: string;
  icon: typeof Bell;
  label: string;
  sub: string;
  defaultOn: boolean;
}

const TRIP_UPDATES: Pref[] = [
  { key: 'trip_reminders', icon: Clock, label: 'Trip reminders', sub: 'Departure times, check-ins and daily plan alerts', defaultOn: true },
  { key: 'weather_alerts', icon: CloudRain, label: 'Weather alerts', sub: 'Rain or forecast changes that affect your itinerary', defaultOn: true },
  { key: 'budget_alerts', icon: DollarSign, label: 'Budget alerts', sub: 'Notify me when a trip nears its budget limit', defaultOn: true },
];

const DELIVERY: Pref[] = [
  { key: 'push', icon: Bell, label: 'Push notifications', sub: 'Alerts on this device', defaultOn: true },
  { key: 'email', icon: Mail, label: 'Email notifications', sub: 'Summaries and booking confirmations by email', defaultOn: false },
];

export function NotificationsTab() {
  const [prefs, setPrefs] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(
      [...TRIP_UPDATES, ...DELIVERY].map((p) => [p.key, p.defaultOn]),
    ),
  );
  const [soundOn, setSoundOn] = useState(true);
  const [volume, setVolume] = useState(65);

  const setPref = (key: string, value: boolean) => setPrefs((prev) => ({ ...prev, [key]: value }));

  return (
    <div className="flex flex-col gap-6">
      <PrefGroup title="Trip updates" prefs={TRIP_UPDATES} values={prefs} onChange={setPref} />
      <PrefGroup title="Delivery" prefs={DELIVERY} values={prefs} onChange={setPref} />

      <section>
        <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Sound</p>
        <div className="mt-3 flex items-center justify-between border-t border-gray-100 py-3">
          <div className="flex items-center gap-3">
            <IconBadge icon={Volume2} />
            <div>
              <p className="text-sm font-semibold text-gray-900">Notification sound</p>
              <p className="text-xs text-gray-500">Play a sound with alerts</p>
            </div>
          </div>
          <Toggle checked={soundOn} onChange={setSoundOn} label="Notification sound" />
        </div>

        <div className="flex items-center justify-between border-t border-gray-100 py-3">
          <div>
            <p className="text-sm font-semibold text-gray-900">Volume</p>
            <p className="text-xs text-gray-500">Adjust how loud alerts play</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setVolume((v) => Math.max(0, v - 5))}
              className="flex h-7 w-7 items-center justify-center rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50"
            >
              <Minus className="h-3.5 w-3.5" />
            </button>
            <input
              type="range"
              min={0}
              max={100}
              value={volume}
              onChange={(e) => setVolume(Number(e.target.value))}
              className="w-32 accent-brand-600"
            />
            <button
              onClick={() => setVolume((v) => Math.min(100, v + 5))}
              className="flex h-7 w-7 items-center justify-center rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50"
            >
              <Plus className="h-3.5 w-3.5" />
            </button>
            <span className="w-10 text-right text-xs font-medium text-gray-600">{volume}%</span>
          </div>
        </div>
      </section>
    </div>
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
  values: Record<string, boolean>;
  onChange: (key: string, value: boolean) => void;
}) {
  return (
    <section>
      <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">{title}</p>
      {prefs.map((pref) => (
        <div key={pref.key} className="flex items-center justify-between border-t border-gray-100 py-3">
          <div className="flex items-center gap-3">
            <IconBadge icon={pref.icon} />
            <div>
              <p className="text-sm font-semibold text-gray-900">{pref.label}</p>
              <p className="text-xs text-gray-500">{pref.sub}</p>
            </div>
          </div>
          <Toggle checked={values[pref.key]} onChange={(v) => onChange(pref.key, v)} label={pref.label} />
        </div>
      ))}
    </section>
  );
}

function IconBadge({ icon: Icon }: { icon: typeof Bell }) {
  return (
    <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
      <Icon className="h-4 w-4" />
    </span>
  );
}
