'use client';

import { Logo } from '@/components/ui/Logo';
import { useState } from 'react';
import { AnimatePresence, LayoutGroup, motion, useReducedMotion } from 'framer-motion';
import { Bell, CreditCard, User, X } from 'lucide-react';
import { useSession } from 'next-auth/react';
import { EASE_OUT, SPRING } from '@/lib/motion';
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
  const reduced = useReducedMotion();
  const meta = TAB_META[activeTab];

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          key="settings-backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          // Leaflet's map panes (in RouteMapPanel) use z-index values up to 700
          // internally, and neither <aside> nor <main> establish their own
          // stacking context - so a lower z-index here gets painted over by the
          // map wherever it occupies screen space. The Home page's own
          // controls (map toggle, split-pane divider) sit at z-[1100], so this
          // has to clear that, not just Leaflet's 1000.
          className="fixed inset-0 z-[1200] flex items-center justify-center bg-black/50 p-4 backdrop-blur-md"
          role="presentation"
          onMouseDown={onClose}
        >
          <motion.div
            initial={reduced ? false : { opacity: 0, y: 40, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={reduced ? undefined : { opacity: 0, y: 24, scale: 0.97 }}
            transition={{ duration: 0.35, ease: EASE_OUT }}
            className="flex h-[720px] w-full max-w-5xl overflow-hidden rounded-3xl bg-white shadow-2xl"
            role="dialog"
            aria-modal="true"
            aria-labelledby="settings-title"
            onMouseDown={(e) => e.stopPropagation()}
          >
            <aside className="flex w-56 shrink-0 flex-col bg-brand-gradient px-4 py-5 text-white">
              <div className="mb-6 flex items-center gap-2 px-1">
                <Logo className="h-7 w-7" />
                <span className="font-serif text-base font-semibold">SmartJourney</span>
              </div>
              <p className="mb-2 px-1 text-[10px] font-semibold tracking-wider text-white/60">SETTINGS</p>
              {/* One white pill is shared by all tabs, so switching tabs slides it. */}
              <LayoutGroup id="settings-nav">
                <nav className="flex flex-col gap-1">
                  {TABS.map(({ id, label, icon: Icon }) => {
                    const active = activeTab === id;
                    return (
                      <button
                        key={id}
                        onClick={() => setActiveTab(id)}
                        aria-current={active ? 'page' : undefined}
                        className={`relative flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-left text-sm font-medium transition-colors ${
                          active ? 'text-brand-700' : 'text-white/90 hover:bg-white/10'
                        }`}
                      >
                        {active && (
                          <motion.span
                            layoutId="settings-tab-pill"
                            transition={reduced ? { duration: 0 } : SPRING}
                            className="absolute inset-0 rounded-xl bg-white shadow-md"
                          />
                        )}
                        <Icon className="relative h-4 w-4" />
                        <span className="relative">{label}</span>
                      </button>
                    );
                  })}
                </nav>
              </LayoutGroup>
              <div className="mt-auto border-t border-white/20 px-1 pt-4 text-xs text-white/70">
                <p>{user?.roles.includes('admin') ? 'Platform admin' : 'Traveler account'}</p>
                <p className="truncate">Signed in as {user?.name ?? user?.email ?? 'Guest'}</p>
              </div>
            </aside>

            <section className="flex flex-1 flex-col overflow-hidden">
              <div className="flex shrink-0 items-start justify-between border-b border-gray-100 px-8 py-6">
                <div>
                  <h2 id="settings-title" className="font-serif text-2xl font-semibold text-gray-900">
                    {meta.title}
                  </h2>
                  <p className="mt-0.5 text-sm text-gray-500">{meta.subtitle}</p>
                </div>
                <button
                  onClick={onClose}
                  className="flex h-8 w-8 items-center justify-center rounded-full border border-gray-200 text-gray-500 transition hover:rotate-90 hover:bg-gray-50"
                  aria-label="Close settings"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto px-8 py-6 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                <AnimatePresence mode="wait" initial={false}>
                  <motion.div
                    key={activeTab}
                    initial={reduced ? false : { opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={reduced ? undefined : { opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                  >
                    {activeTab === 'account' && <AccountTab />}
                    {activeTab === 'subscription' && <SubscriptionTab />}
                    {activeTab === 'notifications' && <NotificationsTab />}
                  </motion.div>
                </AnimatePresence>
              </div>
            </section>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
