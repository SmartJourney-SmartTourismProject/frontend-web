'use client';

import { useState } from 'react';
import { Bell, CreditCard, Plane, User, X } from 'lucide-react';
import { useSession } from 'next-auth/react';
import { AccountTab } from './tabs/AccountTab';
import { SubscriptionTab } from './tabs/SubscriptionTab';
import { NotificationsTab } from './tabs/NotificationsTab';

export type SettingsTab = 'account' | 'subscription' | 'notifications';

const TABS: { id: SettingsTab; label: string; icon: typeof User }[] = [
  { id: 'account', label: 'Account', icon: User },
  { id: 'subscription', label: 'Subscription', icon: CreditCard },
  { id: 'notifications', label: 'Notifications', icon: Bell },
];

const TAB_META: Record<SettingsTab, { title: string; subtitle: string }> = {
  account: { title: 'Account', subtitle: 'Manage your profile, contact details and login' },
  subscription: { title: 'Subscription', subtitle: 'Pick the plan that fits how you travel' },
  notifications: { title: 'Notifications', subtitle: 'Choose what SmartJourney lets you know about' },
};

export function SettingsModal({
  open,
  initialTab = 'account',
  onClose,
}: {
  open: boolean;
  initialTab?: SettingsTab;
  onClose: () => void;
}) {
  const [activeTab, setActiveTab] = useState<SettingsTab>(initialTab);
  const user = useSession().data?.user;

  if (!open) return null;
  const meta = TAB_META[activeTab];

  return (
    <div
      // Leaflet's map panes (in RouteMapPanel) use z-index values up to 700
      // internally, and neither <aside> nor <main> establish their own
      // stacking context - so a lower z-index here gets painted over by the
      // map wherever it occupies screen space. z-[1000] guarantees this
      // always wins regardless of what else is on the page.
      className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/40 p-4"
      role="presentation"
      onMouseDown={onClose}
    >
      <div
        className="flex h-[640px] w-full max-w-4xl overflow-hidden rounded-3xl bg-white shadow-2xl"
        role="dialog"
        aria-modal="true"
        aria-labelledby="settings-title"
        onMouseDown={(e) => e.stopPropagation()}
      >
        <aside className="flex w-56 shrink-0 flex-col bg-brand-gradient px-4 py-5 text-white">
          <div className="mb-6 flex items-center gap-2 px-1">
            <Plane className="h-5 w-5 rotate-45" />
            <span className="font-serif text-base font-semibold">SmartJourney</span>
          </div>
          <p className="mb-2 px-1 text-[10px] font-semibold tracking-wider text-white/60">SETTINGS</p>
          <nav className="flex flex-col gap-1">
            {TABS.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setActiveTab(id)}
                className={`flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-left text-sm font-medium transition ${
                  activeTab === id ? 'bg-white text-brand-700' : 'text-white/90 hover:bg-white/10'
                }`}
              >
                <Icon className="h-4 w-4" />
                {label}
              </button>
            ))}
          </nav>
          <div className="mt-auto border-t border-white/20 px-1 pt-4 text-xs text-white/70">
            <p>{user?.roles.includes('admin') ? 'Platform admin' : 'Traveler account'}</p>
            <p className="truncate">Signed in as {user?.name ?? user?.email ?? 'Guest'}</p>
          </div>
        </aside>

        <section className="flex-1 overflow-y-auto">
          <div className="flex items-start justify-between border-b border-gray-100 px-8 py-6">
            <div>
              <h2 id="settings-title" className="font-serif text-2xl font-semibold text-gray-900">
                {meta.title}
              </h2>
              <p className="mt-0.5 text-sm text-gray-500">{meta.subtitle}</p>
            </div>
            <button
              onClick={onClose}
              className="flex h-8 w-8 items-center justify-center rounded-full border border-gray-200 text-gray-500 hover:bg-gray-50"
              aria-label="Close settings"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="px-8 py-6">
            {activeTab === 'account' && <AccountTab />}
            {activeTab === 'subscription' && <SubscriptionTab />}
            {activeTab === 'notifications' && <NotificationsTab />}
          </div>
        </section>
      </div>
    </div>
  );
}
