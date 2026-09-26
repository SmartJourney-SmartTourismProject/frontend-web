'use client';

import { useCallback, useEffect, useState } from 'react';
import { History, Loader2, Search, ShieldCheck, ShieldOff, UserCheck, UserX, X } from 'lucide-react';
import { useSession } from 'next-auth/react';
import { adminApi } from '@/lib/api';
import type { AdminActivity, AdminUser } from '@/lib/types';

/**
 * Role and account status are Keycloak's, not ours: PATCH /admin/users/:id
 * writes them there first and mirrors into app_user. A user's own token keeps
 * its old roles until it refreshes (≤5 min), which is inherent to JWT auth -
 * deactivating is immediate for new logins, not for a session already open.
 */
export function UsersPanel({ onChanged }: { onChanged: () => void }) {
  const meEmail = useSession().data?.user?.email;
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [total, setTotal] = useState(0);
  const [query, setQuery] = useState('');
  const [role, setRole] = useState('');
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  // SRS §3.1.13: "monitor account activities".
  const [activityFor, setActivityFor] = useState<AdminUser | null>(null);
  const [activity, setActivity] = useState<AdminActivity[] | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await adminApi.users({
        ...(query.trim() && { q: query.trim() }),
        ...(role && { role }),
        ...(status && { status }),
      });
      setUsers(res.items);
      setTotal(res.total);
    } catch {
      setError('Could not load users.');
    } finally {
      setLoading(false);
    }
  }, [query, role, status]);

  useEffect(() => {
    const t = setTimeout(load, query ? 300 : 0);
    return () => clearTimeout(t);
  }, [load, query]);

  const patch = async (user: AdminUser, body: { role?: 'traveler' | 'admin'; is_active?: boolean }) => {
    setBusyId(user.id);
    setError(null);
    try {
      const updated = await adminApi.updateUser(user.id, body);
      setUsers((list) => list.map((u) => (u.id === user.id ? { ...u, ...updated } : u)));
      // Role changes move a user between the traveller/admin counters.
      onChanged();
    } catch (err: unknown) {
      const message = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      setError(message ?? 'Could not update this user.');
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search name or email"
            className="w-64 rounded-xl border border-gray-300 py-2 pl-9 pr-3 text-sm focus:border-brand-500 focus:outline-none"
          />
        </div>
        <select
          value={role}
          onChange={(e) => setRole(e.target.value)}
          className="rounded-xl border border-gray-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none"
          aria-label="Filter by role"
        >
          <option value="">All roles</option>
          <option value="traveler">Travelers</option>
          <option value="admin">Admins</option>
        </select>
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="rounded-xl border border-gray-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none"
          aria-label="Filter by status"
        >
          <option value="">Any status</option>
          <option value="active">Active</option>
          <option value="inactive">Deactivated</option>
        </select>
      </div>

      {error && (
        <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700" role="alert">
          {error}
        </p>
      )}

      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white">
        <div className="border-b border-gray-100 px-5 py-3">
          <p className="text-sm font-semibold text-gray-900">
            {loading ? 'Loading…' : `${total} user${total === 1 ? '' : 's'}`}
          </p>
        </div>

        {!loading && users.length === 0 && (
          <p className="px-5 py-10 text-center text-sm text-gray-500">No matching users.</p>
        )}

        <ul className="divide-y divide-gray-100">
          {users.map((user) => {
            const isSelf = user.email === meEmail;
            const locked = isSelf || !user.managed;
            const lockReason = isSelf
              ? 'You cannot change your own role or status'
              : 'This account predates Keycloak and cannot be managed here';
            return (
              <li key={user.id} className="flex flex-wrap items-center gap-3 px-5 py-4">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="truncate font-semibold text-gray-900">{user.name ?? user.email}</p>
                    {user.role === 'admin' && (
                      <span className="rounded-full bg-brand-100 px-2 py-0.5 text-[11px] font-semibold uppercase text-brand-700">
                        admin
                      </span>
                    )}
                    {!user.is_active && (
                      <span className="rounded-full bg-red-100 px-2 py-0.5 text-[11px] font-semibold uppercase text-red-700">
                        deactivated
                      </span>
                    )}
                    {isSelf && <span className="text-[11px] text-gray-400">(you)</span>}
                    {!user.managed && (
                      <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[11px] text-gray-500">
                        no sign-in
                      </span>
                    )}
                  </div>
                  <p className="mt-1 flex flex-wrap gap-x-3 text-xs text-gray-500">
                    <span>{user.email}</span>
                    {user._count && (
                      <span>
                        {user._count.itinerary} trip{user._count.itinerary === 1 ? '' : 's'} ·{' '}
                        {user._count.chat_session} chat{user._count.chat_session === 1 ? '' : 's'}
                      </span>
                    )}
                    <span>joined {new Date(user.created_at).toLocaleDateString()}</span>
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  {busyId === user.id && <Loader2 className="h-4 w-4 animate-spin text-gray-400" />}
                  <button
                    type="button"
                    onClick={() => {
                      setActivityFor(user);
                      setActivity(null);
                      adminApi.userActivity(user.id).then(setActivity).catch(() => setActivity([]));
                    }}
                    className="flex items-center gap-1 rounded-lg border border-gray-300 px-3 py-1.5 text-xs font-semibold text-gray-700 transition hover:bg-gray-50"
                  >
                    <History className="h-3 w-3" /> Activity
                  </button>
                  <button
                    type="button"
                    disabled={busyId === user.id || locked}
                    title={locked ? lockReason : undefined}
                    onClick={() => patch(user, { role: user.role === 'admin' ? 'traveler' : 'admin' })}
                    className="flex items-center gap-1 rounded-lg border border-gray-300 px-3 py-1.5 text-xs font-semibold text-gray-700 transition hover:bg-gray-50 disabled:opacity-40"
                  >
                    {user.role === 'admin' ? <ShieldOff className="h-3 w-3" /> : <ShieldCheck className="h-3 w-3" />}
                    {user.role === 'admin' ? 'Revoke admin' : 'Make admin'}
                  </button>
                  <button
                    type="button"
                    disabled={busyId === user.id || locked}
                    title={locked ? lockReason : undefined}
                    onClick={() => patch(user, { is_active: !user.is_active })}
                    className={`flex items-center gap-1 rounded-lg px-3 py-1.5 text-xs font-semibold transition disabled:opacity-40 ${
                      user.is_active
                        ? 'border border-red-200 text-red-700 hover:bg-red-50'
                        : 'bg-emerald-600 text-white hover:bg-emerald-700'
                    }`}
                  >
                    {user.is_active ? <UserX className="h-3 w-3" /> : <UserCheck className="h-3 w-3" />}
                    {user.is_active ? 'Deactivate' : 'Reactivate'}
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
      </div>

      {activityFor && (
        <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/40 p-4 sm:p-8">
          <section className="w-full max-w-xl rounded-2xl bg-white p-6 shadow-xl">
            <header className="mb-4 flex items-start justify-between">
              <div>
                <h2 className="font-serif text-xl font-semibold text-brand-700">Account activity</h2>
                <p className="mt-0.5 text-xs text-gray-500">
                  {activityFor.name ?? activityFor.email} · most recent 100 entries
                </p>
              </div>
              <button
                type="button"
                onClick={() => setActivityFor(null)}
                aria-label="Close"
                className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100"
              >
                <X className="h-4 w-4" />
              </button>
            </header>

            {activity === null && <p className="py-8 text-center text-sm text-gray-400">Loading…</p>}
            {activity?.length === 0 && (
              <p className="py-8 text-center text-sm text-gray-500">
                Nothing recorded for this account yet. Entries appear when the user (or an admin acting on them)
                performs an audited action.
              </p>
            )}
            {activity && activity.length > 0 && (
              <ul className="max-h-96 divide-y divide-gray-100 overflow-auto">
                {activity.map((a) => (
                  <li key={a.id} className="py-2.5">
                    <div className="flex items-baseline justify-between gap-3">
                      <code className="text-xs font-semibold text-gray-900">{a.action}</code>
                      <time className="shrink-0 text-xs text-gray-400" dateTime={a.created_at}>
                        {new Date(a.created_at).toLocaleString()}
                      </time>
                    </div>
                    {a.detail && (
                      <p className="mt-0.5 break-all text-xs text-gray-500">{JSON.stringify(a.detail)}</p>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>
      )}
    </div>
  );
}
