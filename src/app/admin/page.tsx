'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, CalendarDays, LayoutGrid, MapPinned, Users } from 'lucide-react';
import { adminApi } from '@/lib/api';
import { ModerationPanel } from '@/components/admin/ModerationPanel';
import { UsersPanel } from '@/components/admin/UsersPanel';
import type { AdminStats } from '@/lib/types';

// Reaching this page at all requires the Keycloak realm role `admin`:
// middleware.ts checks it before the page renders, and every /admin API route
// re-checks it server-side, so the UI is a convenience, not the control.
type Tab = 'listings' | 'events' | 'users';

const TABS: { id: Tab; label: string; icon: typeof LayoutGrid }[] = [
  { id: 'listings', label: 'Listings', icon: MapPinned },
  { id: 'events', label: 'Events', icon: CalendarDays },
  { id: 'users', label: 'Users', icon: Users },
];

export default function AdminPage() {
  const [tab, setTab] = useState<Tab>('listings');
  const [stats, setStats] = useState<AdminStats | null>(null);

  const loadStats = useCallback(() => {
    adminApi.stats().then(setStats).catch(() => setStats(null));
  }, []);

  useEffect(loadStats, [loadStats]);

  return (
    <main className="min-h-screen bg-gray-50">
      <header className="border-b border-gray-200 bg-white">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-6 py-5">
          <div>
            <h1 className="font-serif text-2xl font-semibold text-brand-700">Admin</h1>
            <p className="mt-0.5 text-sm text-gray-500">
              Approve what travellers can see, and manage accounts.
            </p>
          </div>
          <Link
            href="/home"
            className="flex items-center gap-1.5 rounded-xl border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            <ArrowLeft className="h-4 w-4" /> Back to app
          </Link>
        </div>
      </header>

      <div className="mx-auto max-w-6xl px-6 py-6">
        <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            label="Awaiting review"
            value={stats?.pending_verifications}
            hint={
              stats ? `${stats.listings.pending} listings · ${stats.events.pending} events` : undefined
            }
            highlight={(stats?.pending_verifications ?? 0) > 0}
          />
          <StatCard
            label="Published"
            value={stats ? stats.listings.approved + stats.events.approved : undefined}
            hint={stats ? `${stats.listings.approved} listings · ${stats.events.approved} events` : undefined}
          />
          <StatCard
            label="Travellers"
            value={stats?.users.travelers}
            hint={stats ? `${stats.users.admins} admin${stats.users.admins === 1 ? '' : 's'}` : undefined}
          />
          <StatCard
            label="Itineraries"
            value={stats?.itineraries}
            hint={stats ? `${stats.chat_sessions} chat sessions` : undefined}
          />
        </section>

        <nav className="mt-7 flex flex-wrap gap-2 border-b border-gray-200">
          {TABS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              type="button"
              onClick={() => setTab(id)}
              className={`-mb-px flex items-center gap-2 border-b-2 px-4 py-2.5 text-sm font-semibold transition ${
                tab === id
                  ? 'border-brand-600 text-brand-700'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <Icon className="h-4 w-4" />
              {label}
              {id === 'listings' && (stats?.listings.pending ?? 0) > 0 && <Pill n={stats!.listings.pending} />}
              {id === 'events' && (stats?.events.pending ?? 0) > 0 && <Pill n={stats!.events.pending} />}
            </button>
          ))}
        </nav>

        <section className="py-6">
          {tab === 'users' ? (
            <UsersPanel onChanged={loadStats} />
          ) : (
            <ModerationPanel key={tab} kind={tab} onChanged={loadStats} />
          )}
        </section>
      </div>
    </main>
  );
}

function Pill({ n }: { n: number }) {
  return (
    <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[11px] font-semibold text-amber-800">{n}</span>
  );
}

function StatCard({
  label,
  value,
  hint,
  highlight,
}: {
  label: string;
  value?: number;
  hint?: string;
  highlight?: boolean;
}) {
  return (
    <div
      className={`rounded-2xl border bg-white p-5 ${highlight ? 'border-amber-300 bg-amber-50/50' : 'border-gray-200'}`}
    >
      <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">{label}</p>
      <p className="mt-1 text-2xl font-bold text-gray-900">{value ?? '—'}</p>
      {hint && <p className="mt-0.5 text-xs text-gray-500">{hint}</p>}
    </div>
  );
}
