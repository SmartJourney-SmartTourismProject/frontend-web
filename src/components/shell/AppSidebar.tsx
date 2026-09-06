'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Compass, Wallet, Calendar, Plus, Search, Settings, Plane } from 'lucide-react';
import { chatApi } from '@/lib/api';
import { groupByRecency } from '@/lib/group-by-recency';
import { useTripStore } from '@/lib/trip-store';
import { SettingsModal } from '@/components/settings/SettingsModal';
import type { ChatSession } from '@/lib/types';

const NAV_ITEMS = [
  { label: 'Explore', href: '/explore', icon: Compass },
  { label: 'Saved itineraries', href: '/saved-itineraries', icon: Calendar },
  { label: 'Budget tracker', href: '/budget-tracker', icon: Wallet },
];

export function AppSidebar() {
  const router = useRouter();
  const pathname = usePathname();
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [search, setSearch] = useState('');
  const [settingsOpen, setSettingsOpen] = useState(false);
  const sessionsVersion = useTripStore((s) => s.sessionsVersion);
  const currentSessionId = useTripStore((s) => s.sessionId);
  const setSessionId = useTripStore((s) => s.setSessionId);
  const resetTrip = useTripStore((s) => s.reset);

  useEffect(() => {
    chatApi
      .listSessions()
      .then(setSessions)
      .catch(() => setSessions([]));
  }, [sessionsVersion]);

  const filtered = search.trim()
    ? sessions.filter((s) => (s.title ?? '').toLowerCase().includes(search.trim().toLowerCase()))
    : sessions;
  const groups = groupByRecency(filtered);

  const handleNewTrip = () => {
    resetTrip();
    if (pathname !== '/home') router.push('/home');
  };

  const handleSelectSession = (id: string) => {
    setSessionId(id);
    if (pathname !== '/home') router.push('/home');
  };

  return (
    <aside className="flex h-full w-[272px] shrink-0 flex-col border-r border-gray-200 bg-white">
      <div className="flex items-center gap-2 px-4 pt-4">
        <Plane className="h-5 w-5 rotate-45 text-brand-600" />
        <span className="font-serif text-lg font-semibold text-gray-900">SmartJourney</span>
      </div>

      <div className="flex flex-col gap-2 px-4 pt-4">
        <button
          onClick={handleNewTrip}
          className="flex items-center justify-center gap-2 rounded-xl bg-brand-gradient px-4 py-2.5 text-sm font-semibold text-white shadow transition hover:opacity-90"
        >
          <Plus className="h-4 w-4" />
          New trip
        </button>

        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-brand-300" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search your trips"
            className="w-full rounded-lg bg-brand-50 py-2 pl-9 pr-3 text-sm text-gray-700 placeholder:text-brand-300 focus:outline-none focus:ring-1 focus:ring-brand-300"
          />
        </div>
      </div>

      <nav className="mt-4 flex flex-col gap-1 px-4">
        {NAV_ITEMS.map(({ label, href, icon: Icon }) => {
          const active = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 rounded-lg px-2 py-2 text-sm font-medium transition ${
                active ? 'bg-pink-50 text-brand-700' : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              <Icon className="h-4 w-4" />
              {label}
            </Link>
          );
        })}
      </nav>

      <div className="mt-4 flex-1 overflow-y-auto px-4 pb-4">
        {groups.length === 0 && (
          <p className="mt-6 text-center text-xs text-gray-400">No trips yet</p>
        )}
        {groups.map((group) => (
          <div key={group.heading} className="mb-4">
            <p className="mb-1 mt-3 text-[11px] font-semibold tracking-wide text-gray-400">
              {group.heading}
            </p>
            <ul className="flex flex-col gap-0.5">
              {group.sessions.map((session) => (
                <li key={session.id}>
                  <button
                    onClick={() => handleSelectSession(session.id)}
                    className={`w-full truncate rounded-lg px-2 py-1.5 text-left text-sm transition ${
                      session.id === currentSessionId
                        ? 'bg-pink-50 text-brand-700'
                        : 'text-gray-700 hover:bg-gray-50'
                    }`}
                    title={session.title ?? 'Untitled trip'}
                  >
                    {session.title ?? 'Untitled trip'}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="flex items-center gap-2.5 border-t border-gray-100 px-4 py-3">
        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-gradient text-xs font-semibold text-white">
          ST
        </span>
        <div className="flex-1">
          <p className="text-sm font-semibold text-gray-900">Stt</p>
          <p className="text-xs text-gray-500">Traveler account</p>
        </div>
        <button
          type="button"
          title="Settings"
          onClick={() => setSettingsOpen(true)}
          className="rounded-lg p-1.5 text-gray-500 hover:bg-gray-100"
        >
          <Settings className="h-4 w-4" />
        </button>
      </div>

      <SettingsModal open={settingsOpen} onClose={() => setSettingsOpen(false)} />
    </aside>
  );
}
