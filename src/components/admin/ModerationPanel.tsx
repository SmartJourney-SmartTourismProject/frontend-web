'use client';

import { useCallback, useEffect, useState } from 'react';
import { Check, Loader2, MapPin, Pencil, Plus, Search, Trash2, X } from 'lucide-react';
import { adminApi, exploreApi } from '@/lib/api';
import type { AdminEvent, AdminListing, Category, District, ModerationState } from '@/lib/types';
import { ContentFormModal } from './ContentFormModal';

type Kind = 'listings' | 'events';
type Row = AdminListing | AdminEvent;

const TABS: { id: ModerationState | 'all'; label: string }[] = [
  { id: 'pending', label: 'Pending review' },
  { id: 'approved', label: 'Approved' },
  { id: 'rejected', label: 'Rejected' },
  { id: 'all', label: 'All' },
];

const STATE_BADGE: Record<ModerationState, string> = {
  pending: 'bg-amber-100 text-amber-800',
  approved: 'bg-emerald-100 text-emerald-800',
  rejected: 'bg-red-100 text-red-700',
};

function isEvent(row: Row): row is AdminEvent {
  return 'start_datetime' in row;
}

/**
 * The moderation queue for travel_listing / local_event. Both tables are
 * written by the AI backend's ingest jobs with is_verified = false, and
 * nothing reaches travelers until it is approved here
 * (docs/BACKEND_ALIGNMENT.md §7).
 */
export function ModerationPanel({ kind, onChanged }: { kind: Kind; onChanged: () => void }) {
  const [status, setStatus] = useState<ModerationState | 'all'>('pending');
  const [districts, setDistricts] = useState<District[]>([]);
  const [district, setDistrict] = useState('');
  // SRS §3.1.11 names attractions and restaurants separately; they are one
  // table with a category, so the split is a filter rather than extra tabs.
  const [categories, setCategories] = useState<Category[]>([]);
  const [category, setCategory] = useState('');
  const [editing, setEditing] = useState<Row | null>(null);
  const [creating, setCreating] = useState(false);
  const [query, setQuery] = useState('');
  const [rows, setRows] = useState<Row[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [approvingAll, setApprovingAll] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    exploreApi.getDistricts().then(setDistricts).catch(() => setDistricts([]));
    if (kind === 'listings') {
      exploreApi.getCategories().then(setCategories).catch(() => setCategories([]));
    }
  }, [kind]);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = {
        ...(status !== 'all' && { status }),
        ...(district && { district }),
        ...(category && kind === 'listings' && { category }),
        ...(query.trim() && { q: query.trim() }),
      };
      const res = kind === 'listings' ? await adminApi.listings(params) : await adminApi.events(params);
      setRows(res.items);
      setTotal(res.total);
    } catch {
      setError('Could not load this queue. Check that the API is running.');
    } finally {
      setLoading(false);
    }
  }, [kind, status, district, category, query]);

  useEffect(() => {
    // Debounced so typing in the search box doesn't fire a request per keystroke.
    const t = setTimeout(load, query ? 300 : 0);
    return () => clearTimeout(t);
  }, [load, query]);

  const act = async (row: Row, action: 'verify' | 'reject' | 'delete') => {
    if (action === 'delete' && !confirm(`Delete "${row.name}" permanently? Rejecting is usually enough.`)) return;
    let reason: string | null = null;
    if (action === 'reject') {
      reason = prompt(`Why is "${row.name}" being rejected? (optional)`) ?? '';
    }
    setBusyId(row.id);
    setError(null);
    try {
      if (kind === 'listings') {
        if (action === 'verify') await adminApi.verifyListing(row.id);
        if (action === 'reject') await adminApi.rejectListing(row.id, reason ?? undefined);
        if (action === 'delete') await adminApi.deleteListing(row.id);
      } else {
        if (action === 'verify') await adminApi.verifyEvent(row.id);
        if (action === 'reject') await adminApi.rejectEvent(row.id, reason ?? undefined);
        if (action === 'delete') await adminApi.deleteEvent(row.id);
      }
      await load();
      onChanged();
    } catch {
      setError(`Could not ${action} "${row.name}".`);
    } finally {
      setBusyId(null);
    }
  };

  /**
   * Approves the rows currently on screen - the ones the admin has just read
   * - rather than everything matching the filter. The distinction matters:
   * the pending queue here is 1,500+ rows of raw OSM data, and a button that
   * approved all of them sight-unseen would defeat the review step entirely.
   */
  const approveAllShown = async () => {
    const pending = rows.filter((r) => r.state === 'pending');
    if (pending.length === 0) return;
    const noun = kind === 'listings' ? 'listing' : 'event';
    if (
      !confirm(
        `Approve all ${pending.length} ${noun}${pending.length === 1 ? '' : 's'} shown on this page?

` +
          `Only what is listed here is approved. Anything further down the queue stays pending.`,
      )
    )
      return;

    setApprovingAll(true);
    setError(null);
    try {
      const ids = pending.map((r) => r.id);
      if (kind === 'listings') await adminApi.verifyListingsBulk(ids);
      else await adminApi.verifyEventsBulk(ids);
      await load();
      onChanged();
    } catch {
      setError(`Could not approve all ${noun}s. Some may have been approved already.`);
    } finally {
      setApprovingAll(false);
    }
  };

  const pendingShown = rows.filter((r) => r.state === 'pending').length;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center gap-2">
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setStatus(t.id)}
            className={`rounded-full px-4 py-1.5 text-sm font-medium transition ${
              status === t.id ? 'bg-brand-gradient text-white shadow' : 'border border-gray-200 text-gray-600 hover:bg-gray-50'
            }`}
          >
            {t.label}
          </button>
        ))}
        <div className="ml-auto flex items-center gap-2">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={`Search ${kind}`}
              className="w-52 rounded-xl border border-gray-300 py-2 pl-9 pr-3 text-sm focus:border-brand-500 focus:outline-none"
            />
          </div>
          {kind === 'listings' && (
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="rounded-xl border border-gray-300 px-3 py-2 text-sm capitalize focus:border-brand-500 focus:outline-none"
              aria-label="Filter by category"
            >
              <option value="">All categories</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id} className="capitalize">
                  {c.name}
                </option>
              ))}
            </select>
          )}
          <select
            value={district}
            onChange={(e) => setDistrict(e.target.value)}
            className="rounded-xl border border-gray-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none"
            aria-label="Filter by district"
          >
            <option value="">All districts</option>
            {districts.map((d) => (
              <option key={d.id} value={d.id}>
                {d.name}
              </option>
            ))}
          </select>
          <button
            type="button"
            onClick={() => setCreating(true)}
            className="flex items-center gap-1.5 rounded-xl bg-brand-gradient px-3 py-2 text-sm font-semibold text-white hover:opacity-90"
          >
            <Plus className="h-4 w-4" /> Add {kind === 'listings' ? 'listing' : 'event'}
          </button>
        </div>
      </div>

      {error && (
        <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700" role="alert">
          {error}
        </p>
      )}

      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white">
        <div className="flex items-center justify-between border-b border-gray-100 px-5 py-3">
          <p className="text-sm font-semibold text-gray-900">
            {loading ? 'Loading…' : `${total} ${kind === 'listings' ? 'listing' : 'event'}${total === 1 ? '' : 's'}`}
          </p>
          <div className="flex items-center gap-3">
            {rows.length < total && <p className="text-xs text-gray-500">Showing the first {rows.length}</p>}
            {pendingShown > 0 && (
              <button
                type="button"
                onClick={approveAllShown}
                disabled={approvingAll}
                className="rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-emerald-700 disabled:opacity-50"
              >
                {approvingAll ? 'Approving…' : `Approve all ${pendingShown} shown`}
              </button>
            )}
          </div>
        </div>

        {!loading && rows.length === 0 && (
          <p className="px-5 py-10 text-center text-sm text-gray-500">
            {status === 'pending' ? 'Nothing waiting for review.' : 'No matching records.'}
          </p>
        )}

        <ul className="divide-y divide-gray-100">
          {rows.map((row) => (
            <li key={row.id} className="flex flex-wrap items-center gap-3 px-5 py-4">
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="truncate font-semibold text-gray-900">{row.name}</p>
                  <span className={`rounded-full px-2 py-0.5 text-[11px] font-semibold uppercase ${STATE_BADGE[row.state]}`}>
                    {row.state}
                  </span>
                  <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[11px] text-gray-600">{row.source}</span>
                </div>
                <p className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-gray-500">
                  <span className="flex items-center gap-1">
                    <MapPin className="h-3 w-3" />
                    {row.district?.name ?? 'Unknown district'}
                  </span>
                  {isEvent(row) ? (
                    <span>{new Date(row.start_datetime).toLocaleString()}</span>
                  ) : (
                    <>
                      {row.category?.name && <span>{row.category.name}</span>}
                      {row.rating != null && <span>★ {Number(row.rating).toFixed(1)}</span>}
                    </>
                  )}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setEditing(row)}
                  disabled={busyId === row.id}
                  className="flex items-center gap-1 rounded-lg border border-gray-300 px-3 py-1.5 text-xs font-semibold text-gray-700 transition hover:bg-gray-50 disabled:opacity-60"
                >
                  <Pencil className="h-3 w-3" /> Edit
                </button>
                {row.state !== 'approved' && (
                  <button
                    type="button"
                    onClick={() => act(row, 'verify')}
                    disabled={busyId === row.id}
                    className="flex items-center gap-1 rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-emerald-700 disabled:opacity-60"
                  >
                    {busyId === row.id ? <Loader2 className="h-3 w-3 animate-spin" /> : <Check className="h-3 w-3" />}
                    Approve
                  </button>
                )}
                {row.state !== 'rejected' && (
                  <button
                    type="button"
                    onClick={() => act(row, 'reject')}
                    disabled={busyId === row.id}
                    className="flex items-center gap-1 rounded-lg border border-red-200 px-3 py-1.5 text-xs font-semibold text-red-700 transition hover:bg-red-50 disabled:opacity-60"
                  >
                    <X className="h-3 w-3" /> Reject
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => act(row, 'delete')}
                  disabled={busyId === row.id}
                  title="Delete permanently"
                  aria-label={`Delete ${row.name}`}
                  className="rounded-lg p-1.5 text-gray-400 transition hover:bg-gray-100 hover:text-red-600 disabled:opacity-60"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </li>
          ))}
        </ul>
      </div>

      {(creating || editing) && (
        <ContentFormModal
          kind={kind}
          editing={editing}
          onClose={() => {
            setCreating(false);
            setEditing(null);
          }}
          onSaved={() => {
            void load();
            onChanged();
          }}
        />
      )}
    </div>
  );
}
