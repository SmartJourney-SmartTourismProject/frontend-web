'use client'

import { Clock, CloudRain, DollarSign, Bell, Mail, Volume2, Minus, Plus } from 'lucide-react'
import { SettingsShell } from '@/components/settings/SettingsShell'
import { Toggle } from '@/components/ui/Toggle'
import { useNotificationStore } from '@/lib/store'

export default function NotificationsPage() {
  const settings = useNotificationStore()

  return (
    <SettingsShell title="Notifications" subtitle="Choose what SmartJourney lets you know about">
      <Section title="Trip updates">
        <Row
          icon={Clock}
          label="Trip reminders"
          sub="Departure times, check-ins and daily plan alerts"
          checked={settings.tripReminders}
          onChange={(v) => settings.setSetting('tripReminders', v)}
        />
        <Row
          icon={CloudRain}
          label="Weather alerts"
          sub="Rain or forecast changes that affect your itinerary"
          checked={settings.weatherAlerts}
          onChange={(v) => settings.setSetting('weatherAlerts', v)}
        />
        <Row
          icon={DollarSign}
          label="Budget alerts"
          sub="Notify me when a trip nears its budget limit"
          checked={settings.budgetAlerts}
          onChange={(v) => settings.setSetting('budgetAlerts', v)}
        />
      </Section>

      <Section title="Delivery">
        <Row
          icon={Bell}
          label="Push notifications"
          sub="Alerts on this device"
          checked={settings.pushNotifications}
          onChange={(v) => settings.setSetting('pushNotifications', v)}
        />
        <Row
          icon={Mail}
          label="Email notifications"
          sub="Summaries and booking confirmations by email"
          checked={settings.emailNotifications}
          onChange={(v) => settings.setSetting('emailNotifications', v)}
        />
      </Section>

      <Section title="Sound">
        <Row
          icon={Volume2}
          label="Notification sound"
          sub="Play a sound with alerts"
          checked={settings.notificationSound}
          onChange={(v) => settings.setSetting('notificationSound', v)}
        />
        <div className="flex items-center justify-between border-t border-gray-100 py-4">
          <div>
            <p className="font-semibold text-gray-900">Volume</p>
            <p className="text-xs text-gray-400">Adjust how loud alerts play</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => settings.setSetting('volume', Math.max(0, settings.volume - 5))}
              className="flex h-7 w-7 items-center justify-center rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50"
              aria-label="Decrease volume"
            >
              <Minus className="h-3.5 w-3.5" />
            </button>
            <input
              type="range"
              min={0}
              max={100}
              value={settings.volume}
              onChange={(e) => settings.setSetting('volume', Number(e.target.value))}
              className="h-1.5 w-32 accent-royal-700"
            />
            <button
              onClick={() => settings.setSetting('volume', Math.min(100, settings.volume + 5))}
              className="flex h-7 w-7 items-center justify-center rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50"
              aria-label="Increase volume"
            >
              <Plus className="h-3.5 w-3.5" />
            </button>
            <span className="w-10 text-right text-sm font-semibold text-royal-700">{settings.volume}%</span>
          </div>
        </div>
      </Section>
    </SettingsShell>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-6">
      <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-gray-400">{title}</p>
      {children}
    </div>
  )
}

function Row({
  icon: Icon,
  label,
  sub,
  checked,
  onChange,
}: {
  icon: React.ComponentType<{ className?: string }>
  label: string
  sub: string
  checked: boolean
  onChange: (v: boolean) => void
}) {
  return (
    <div className="flex items-center justify-between border-t border-gray-100 py-4">
      <div className="flex items-start gap-3">
        <div className="mt-0.5 flex h-9 w-9 items-center justify-center rounded-xl bg-royal-50 text-royal-700">
          <Icon className="h-4 w-4" />
        </div>
        <div>
          <p className="font-semibold text-gray-900">{label}</p>
          <p className="text-xs text-gray-400">{sub}</p>
        </div>
      </div>
      <Toggle checked={checked} onChange={onChange} label={label} />
    </div>
  )
}
