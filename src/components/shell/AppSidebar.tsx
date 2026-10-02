'use client';

import { Logo } from '@/components/ui/Logo';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import {
  Compass, Wallet, Calendar, Plus, Search, Settings, LogOut, Trash2, ShieldCheck,
  PanelLeftClose, PanelLeftOpen,
} from 'lucide-react';
import { useSession } from 'next-auth/react';
import { signOutEverywhere } from '@/lib/auth-client';
import { Avatar } from '@/components/ui/Avatar';
import { useProfileStore } from '@/lib/profile-store';
import { chatApi, usersApi } from '@/lib/api';
import { groupByRecency } from '@/lib/group-by-recency';
import { useTripStore } from '@/lib/trip-store';
import { SettingsModal } from '@/components/settings/SettingsModal';
import type { ChatSession } from '@/lib/types';

const NAV_ITEMS = [
  { label: 'Explore', href: '/explore', icon: Compass },
  { label: 'Saved itineraries', href: '/saved-itineraries', icon: Calendar },
  { label: 'Budget tracker', href: '/budget-tracker', icon: Wallet },
];

// Only rendered for holders of the Keycloak realm role `admin`; the route
// itself is gated by middleware.ts and every /admin API route re-checks.
const ADMIN_ITEM = { label: 'Admin', href: '/admin', icon: ShieldCheck };

const COLLAPSED_KEY = 'sj.sidebar.collapsed';

export function AppSidebar() {
  const router = useRouter();
  const pathname = usePathname();
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [search, setSearch] = useState('');
  const [settingsOpen, setSettingsOpen] = useState(false);
  // Collapses to an icon rail rather than to zero width. A fully hidden
  // sidebar needs a floating button elsewhere on the page to bring it back;
  // the rail keeps navigation one click away while still returning most of
  // the width to the chat and map.
  const [collapsed, setCollapsed] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<ChatSession | null>(null);
  const user = useSession().data?.user;
  const isAdmin = user?.roles.includes('admin') ?? false;
  const sessionsVersion = useTripStore((s) => s.sessionsVersion);
  const currentSessionId = useTripStore((s) => s.sessionId);
  const setSessionId = useTripStore((s) => s.setSessionId);
  const resetTrip = useTripStore((s) => s.reset);
  const avatarUrl = useProfileStore((s) => s.avatarUrl);
  const setAvatarUrl = useProfileStore((s) => s.setAvatarUrl);
  const setLocationEnabled = useProfileStore((s) => s.setLocationEnabled);

  // The sidebar is on every app page, so it loads the user record once for
  // everything that reads the profile store (footer avatar, chat location).
  useEffect(() => {
    usersApi
      .me()
      .then((me) => {
        setAvatarUrl(me.avatar_url);
        setLocationEnabled(me.location_enabled);
      })
      // Unknown: behave as the default (on) rather than never asking.
      .catch(() => setLocationEnabled(true));
  }, [setAvatarUrl, setLocationEnabled]);

  // Read after mount: localStorage does not exist during server rendering,
  // and seeding initial state from it would desync the markup.
  useEffect(() => {
    try {
      setCollapsed(window.localStorage.getItem(COLLAPSED_KEY) === '1');
    } catch {
      // Blocked storage just means the sidebar starts expanded.
    }
  }, []);

  const toggleCollapsed = () => {
    setCollapsed((value) => {
      const next = !value;
      try {
        window.localStorage.setItem(COLLAPSED_KEY, next ? '1' : '0');
      } catch {
        // Not worth surfacing; the toggle still works for this session.
      }
      return next;
    });
  };

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

  const handleSessionDeleted = (id: string) => {
    setSessions((prev) => prev.filter((s) => s.id !== id));
    // The deleted chat was open in the panel - clear it rather than leaving
    // the chat showing a conversation that no longer exists (it would 404
    // on the next message).
    if (currentSessionId === id) resetTrip();
    setDeleteTarget(null);
  };

  return (
    <aside
      className={`flex h-full shrink-0 flex-col border-r border-gray-200 bg-white transition-[width] duration-200 ease-in-out ${
        collapsed ? 'w-16' : 'w-[272px]'
      }`}
    >
      <div className={`flex items-center pt-4 ${collapsed ? 'flex-col gap-3 px-2' : 'gap-2 px-4'}`}>
        {!collapsed && (
          <>
            <Logo className="h-8 w-8" />
            <span className="flex-1 font-serif text-lg font-semibold text-gray-900">SmartJourney</span>
          </>
        )}
        <button
          type="button"
          onClick={toggleCollapsed}
          title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          aria-expanded={!collapsed}
          className="rounded-lg p-1.5 text-gray-500 transition hover:bg-gray-100"
        >
          {collapsed ? <PanelLeftOpen className="h-4 w-4" /> : <PanelLeftClose className="h-4 w-4" />}
        </button>
      </div>

      <div className={`flex flex-col gap-2 pt-4 ${collapsed ? 'px-2' : 'px-4'}`}>
        <button
          onClick={handleNewTrip}
          title={collapsed ? 'New trip' : undefined}
          className={`flex items-center justify-center gap-2 rounded-xl bg-brand-gradient text-sm font-semibold text-white shadow transition hover:opacity-90 ${
            collapsed ? 'px-0 py-2.5' : 'px-4 py-2.5'
          }`}
        >
          <Plus className="h-4 w-4" />
          {!collapsed && 'New trip'}
        </button>

        {/* The search box needs a text field to be of any use, so it is
            dropped from the rail rather than shrunk into an unusable stub.
            Expanding restores it with whatever query was typed. */}
        {!collapsed && (
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-brand-300" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search your trips"
              className="w-full rounded-lg bg-brand-50 py-2 pl-9 pr-3 text-sm text-gray-700 placeholder:text-brand-300 focus:outline-none focus:ring-1 focus:ring-brand-300"
            />
          </div>
        )}
      </div>

      <nav className={`mt-4 flex flex-col gap-1 ${collapsed ? 'px-2' : 'px-4'}`}>
        {[...NAV_ITEMS, ...(isAdmin ? [ADMIN_ITEM] : [])].map(({ label, href, icon: Icon }) => {
          const active = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              // The label is the only accessible name these links have, so on
              // the rail it moves to title/aria-label rather than disappearing.
              title={collapsed ? label : undefined}
              aria-label={collapsed ? label : undefined}
              className={`flex items-center rounded-lg py-2 text-sm font-medium transition ${
                collapsed ? 'justify-center px-0' : 'gap-3 px-2'
              } ${active ? 'bg-pink-50 text-brand-700' : 'text-gray-700 hover:bg-gray-50'}`}
            >
              <Icon className="h-4 w-4 shrink-0" />
              {!collapsed && label}
            </Link>
          );
        })}
      </nav>

      {/* The chat history is a list of titles; there is no useful rail form of
          it, so the rail drops it and keeps the space for the panels. */}
      <div className={`mt-4 flex-1 overflow-y-auto pb-4 px-4 ${collapsed ? 'hidden' : ''}`}>
        {groups.length === 0 && (
          <p className="mt-6 text-center text-xs text-gray-500">No trips yet</p>
        )}
        {groups.map((group) => (
          <div key={group.heading} className="mb-4">
            <p className="mb-1 mt-3 text-[11px] font-semibold tracking-wide text-gray-500">
              {group.heading}
            </p>
            <ul className="flex flex-col gap-0.5">
              {group.sessions.map((session) => (
                <li key={session.id} className="group relative">
                  <button
                    onClick={() => handleSelectSession(session.id)}
                    className={`w-full truncate rounded-lg px-2 py-1.5 pr-8 text-left text-sm transition ${
                      session.id === currentSessionId
                        ? 'bg-pink-50 text-brand-700'
                        : 'text-gray-700 hover:bg-gray-50'
                    }`}
                    title={session.title ?? 'Untitled trip'}
                  >
                    {session.title ?? 'Untitled trip'}
                  </button>
                  <button
                    type="button"
                    title="Delete chat"
                    onClick={(e) => {
                      e.stopPropagation();
                      setDeleteTarget(session);
                    }}
                    className="absolute right-1 top-1/2 -translate-y-1/2 rounded-md p-1 text-gray-400 opacity-0 transition hover:bg-gray-200 hover:text-red-600 group-hover:opacity-100"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      {/* mt-auto keeps the footer pinned to the bottom on the rail, where the
          chat-history block that used to fill the space is hidden. */}
      <div
        className={`mt-auto flex border-t border-gray-100 py-3 ${
          collapsed ? 'flex-col items-center gap-2 px-2' : 'items-center gap-2.5 px-4'
        }`}
      >
        <span title={collapsed ? (user?.name ?? user?.email ?? 'Guest') : undefined}>
          <Avatar src={avatarUrl} name={user?.name ?? user?.email} />
        </span>
        {!collapsed && (
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-gray-900">{user?.name ?? user?.email ?? 'Guest'}</p>
            <p className="text-xs text-gray-500">{isAdmin ? 'Platform admin' : 'Traveler account'}</p>
          </div>
        )}
        <button
          type="button"
          title="Settings"
          aria-label="Settings"
          onClick={() => setSettingsOpen(true)}
          className="rounded-lg p-1.5 text-gray-500 hover:bg-gray-100"
        >
          <Settings className="h-4 w-4" />
        </button>
        <button
          type="button"
          title="Sign out"
          aria-label="Sign out"
          onClick={() => signOutEverywhere()}
          className="rounded-lg p-1.5 text-gray-500 hover:bg-gray-100"
        >
          <LogOut className="h-4 w-4" />
        </button>
      </div>

      <SettingsModal open={settingsOpen} onClose={() => setSettingsOpen(false)} />
      <DeleteChatDialog
        session={deleteTarget}
        onCancel={() => setDeleteTarget(null)}
        onDeleted={handleSessionDeleted}
      />
    </aside>
  );
}

function DeleteChatDialog({
  session,
  onCancel,
  onDeleted,
}: {
  session: ChatSession | null;
  onCancel: () => void;
  onDeleted: (id: string) => void;
}) {
  const [deleteSaved, setDeleteSaved] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // Reset the checkbox each time a new chat is targeted, rather than
  // carrying a previous chat's choice into this one.
  useEffect(() => {
    setDeleteSaved(false);
  }, [session?.id]);

  if (!session) return null;

  const handleDelete = async () => {
    if (deleting) return;
    setDeleting(true);
    try {
      await chatApi.deleteSession(session.id, deleteSaved);
      onDeleted(session.id);
    } catch {
      setDeleting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/40 p-4"
      role="presentation"
      onMouseDown={onCancel}
    >
      <div
        className="w-full max-w-sm rounded-2xl bg-white p-5 shadow-2xl"
        role="dialog"
        aria-modal="true"
        aria-labelledby="delete-chat-title"
        onMouseDown={(e) => e.stopPropagation()}
      >
        <h2 id="delete-chat-title" className="text-base font-semibold text-gray-900">
          Delete this chat?
        </h2>
        <p className="mt-1 text-sm text-gray-500">
          &ldquo;{session.title ?? 'Untitled trip'}&rdquo; will be permanently deleted.
        </p>

        <label className="mt-4 flex items-start gap-2 rounded-lg bg-gray-50 p-3 text-sm text-gray-700">
          <input
            type="checkbox"
            checked={deleteSaved}
            onChange={(e) => setDeleteSaved(e.target.checked)}
            className="mt-0.5 h-4 w-4 rounded border-gray-300 text-brand-600 focus:ring-brand-500"
          />
          Also delete related saved itineraries corresponding to this chat
        </label>

        <div className="mt-5 flex justify-end gap-2">
          <button
            type="button"
            onClick={onCancel}
            disabled={deleting}
            className="rounded-lg px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-100 disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleDelete}
            disabled={deleting}
            className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-red-700 disabled:opacity-50"
          >
            {deleting ? 'Deleting…' : 'Delete'}
          </button>
        </div>
      </div>
    </div>
  );
}
