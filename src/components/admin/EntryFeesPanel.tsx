'use client';

import { useCallback, useEffect, useState } from 'react';
import { Check, ExternalLink, Link2, Link2Off, Loader2, Search, X } from 'lucide-react';
import { adminApi, exploreApi } from '@/lib/api';
import type { AdminEntryFee, AdminListing, ModerationState } from '@/lib/types';

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

function formatLkr(amount: string | null) {
  if (amount == null) return null;
  return `${Math.round(Number(amount)).toLocaleString()} LKR`;
}

/**
 * Review queue for listing_entry_fee (db/migrations/0012) - heritage-site
 * ticket prices scraped by the AI backend's entry_fees_ccf connector
 * (docs/master_plan/SCRAPE_SOURCES.md). Its own `status` column, unlike
 * ModerationPanel's travel_listing/local_event rows, and no create/edit
 * form: nothing here is admin-authored, only reviewed.
 *
 * The listing match shown is a SUGGESTION the connector made by name/
 * district similarity, not a guarantee - approving is refused server-side
 * until a listing is actually linked, so a wrong or missing match must be
 * fixed (via "Change") before the fee can reach anyone's budget.
 */
export function EntryFeesPanel({ onChanged }: { onChanged: () => void }) {
  const [status, setStatus] = useState<ModerationState | 'all'>('pending');
  const [rows, setRows] = useState<AdminEntryFee[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [relinking, setRelinking] = useState<string | null>(null);
  // Every scraped fee is a heritage site, so the picker only ever searches
  // the 'attraction' category - resolved once, from the real categories
  // table, rather than hard-coding an id that could differ per environment.
  const [attractionCategoryId, setAttractionCategoryId] = useState<string | null>(null);

  useEffect(() => {
    exploreApi
      .getCategories()
      .then((cats) => setAttractionCategoryId(cats.find((c) => c.name === 'attraction')?.id ?? null))
      .catch(() => setAttractionCategoryId(null));
  }, []);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await adminApi.entryFees(status === 'all' ? {} : { status });
      setRows(res.items);
      setTotal(res.total);
    } catch {
      setError('Could not load entry fees. Check that the API is running.');
    } finally {
      setLoading(false);
    }
  }, [status]);

  useEffect(() => {
    void load();
  }, [load]);

  const approve = async (row: AdminEntryFee) => {
    if (!row.listing_id) {
      setError(`Link "${row.site_name}" to a listing before approving it.`);
      return;
    }
    setBusyId(row.id);
    setError(null);
    try {
      await adminApi.approveEntryFee(row.id);
      await load();
      onChanged();
    } catch (e) {
      const message = (e as { response?: { status?: number } })?.response?.status === 409
        ? `${row.site_name}'s listing already has an approved fee - reject or relink the other one first.`
        : `Could not approve "${row.site_name}".`;
      setError(message);
    } finally {
      setBusyId(null);
    }
  };

  const reject = async (row: AdminEntryFee) => {
    setBusyId(row.id);
    setError(null);
    try {
      await adminApi.rejectEntryFee(row.id);
      await load();
      onChanged();
    } catch {
      setError(`Could not reject "${row.site_name}".`);
    } finally {
      setBusyId(null);
    }
  };

  const unlink = async (row: AdminEntryFee) => {
    setBusyId(row.id);
    setError(null);
    try {
      await adminApi.relinkEntryFee(row.id, null);
      await load();
    } catch {
      setError(`Could not unlink "${row.site_name}".`);
    } finally {
      setBusyId(null);
    }
  };

  const relink = async (row: AdminEntryFee, listing: AdminListing) => {
    setBusyId(row.id);
    setError(null);
    try {
      await adminApi.relinkEntryFee(row.id, listing.id);
      await load();
    } catch {
      setError(`Could not link "${row.site_name}" to "${listing.name}".`);
    } finally {
      setBusyId(null);
      setRelinking(null);
    }
  };

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
        <p className="ml-auto text-xs text-gray-500">
          Scraped from the Central Cultural Fund - always confirm the price and the linked site before approving.
        </p>
      </div>

      {error && (
        <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700" role="alert">
          {error}
        </p>
      )}

      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white">
        <div className="flex items-center justify-between border-b border-gray-100 px-5 py-3">
          <p className="text-sm font-semibold text-gray-900">
            {loading ? 'Loading…' : `${total} entry fee${total === 1 ? '' : 's'}`}
          </p>
          {rows.length < total && <p className="text-xs text-gray-400">Showing the first {rows.length}</p>}
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
                  <p className="truncate font-semibold text-gray-900">{row.site_name}</p>
                  <span className={`rounded-full px-2 py-0.5 text-[11px] font-semibold uppercase ${STATE_BADGE[row.status]}`}>
                    {row.status}
                  </span>
                  <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[11px] text-gray-600">{row.source}</span>
                </div>
                <p className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-gray-500">
                  <span>Foreign adult: {formatLkr(row.foreign_adult) ?? 'unknown'}</span>
                  {row.foreign_child != null && <span>Foreign child: {formatLkr(row.foreign_child)}</span>}
                  {row.source_url && (
                    <a
                      href={row.source_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 text-brand-600 hover:underline"
                    >
                      <ExternalLink className="h-3 w-3" /> Source
                    </a>
                  )}
                </p>
                <p className="mt-1 text-xs">
                  {row.travel_listing ? (
                    <span className="flex flex-wrap items-center gap-1 text-gray-600">
                      <Link2 className="h-3 w-3 text-emerald-600" />
                      Linked to <span className="font-medium text-gray-900">{row.travel_listing.name}</span>
                      <span className="text-gray-400">· {row.travel_listing.district.name}</span>
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-amber-700">
                      <Link2Off className="h-3 w-3" /> No listing match - link one before approving
                    </span>
                  )}
                </p>
                {relinking === row.id ? (
                  <ListingPicker
                    initialQuery={row.site_name.replace(/\s*\(.*?\)/, '').trim()}
                    categoryId={attractionCategoryId}
                    onPick={(listing) => relink(row, listing)}
                    onCancel={() => setRelinking(null)}
                    busy={busyId === row.id}
                  />
                ) : (
                  <div className="mt-1 flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => setRelinking(row.id)}
                      className="text-xs font-medium text-brand-600 hover:underline"
                    >
                      {row.listing_id ? 'Change link' : 'Link a listing'}
                    </button>
                    {row.listing_id && (
                      <button
                        type="button"
                        onClick={() => unlink(row)}
                        disabled={busyId === row.id}
                        className="text-xs font-medium text-gray-500 hover:text-gray-700 disabled:opacity-60"
                      >
                        Unlink
                      </button>
                    )}
                  </div>
                )}
              </div>

              <div className="flex items-center gap-2">
                {row.status !== 'approved' && (
                  <button
                    type="button"
                    onClick={() => approve(row)}
                    disabled={busyId === row.id}
                    title={row.listing_id ? undefined : 'Link a listing first'}
                    className="flex items-center gap-1 rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-emerald-700 disabled:opacity-60"
                  >
                    {busyId === row.id ? <Loader2 className="h-3 w-3 animate-spin" /> : <Check className="h-3 w-3" />}
                    Approve
                  </button>
                )}
                {row.status !== 'rejected' && (
                  <button
                    type="button"
                    onClick={() => reject(row)}
                    disabled={busyId === row.id}
                    className="flex items-center gap-1 rounded-lg border border-red-200 px-3 py-1.5 text-xs font-semibold text-red-700 transition hover:bg-red-50 disabled:opacity-60"
                  >
                    <X className="h-3 w-3" /> Reject
                  </button>
                )}
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

/**
 * A debounced search-and-pick control over the real travel_listing table -
 * this is what "Link a listing" opens. Replaces an earlier version that
 * asked the admin to paste a raw travel_listing UUID by hand, which had no
 * way to find one from the admin panel itself.
 */
function ListingPicker({
  initialQuery,
  categoryId,
  onPick,
  onCancel,
  busy,
}: {
  initialQuery: string;
  categoryId: string | null;
  onPick: (listing: AdminListing) => void;
  onCancel: () => void;
  busy: boolean;
}) {
  const [query, setQuery] = useState(initialQuery);
  const [results, setResults] = useState<AdminListing[]>([]);
  const [searching, setSearching] = useState(false);

  useEffect(() => {
    const q = query.trim();
    if (!q) {
      setResults([]);
      return;
    }
    setSearching(true);
    const t = setTimeout(() => {
      adminApi
        .listings({ q, ...(categoryId && { category: categoryId }) })
        .then((res) => setResults(res.items))
        .catch(() => setResults([]))
        .finally(() => setSearching(false));
    }, 250);
    return () => clearTimeout(t);
  }, [query, categoryId]);

  return (
    <div className="mt-2 w-full max-w-md rounded-lg border border-gray-200 bg-gray-50 p-2">
      <div className="relative">
        <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-gray-400" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search listings by name"
          autoFocus
          className="w-full rounded-lg border border-gray-300 py-1.5 pl-8 pr-3 text-xs focus:border-brand-500 focus:outline-none"
        />
      </div>

      <ul className="mt-1.5 max-h-48 divide-y divide-gray-100 overflow-y-auto">
        {searching && <li className="px-2 py-2 text-xs text-gray-400">Searching…</li>}
        {!searching && query.trim() && results.length === 0 && (
          <li className="px-2 py-2 text-xs text-gray-400">No matching listings.</li>
        )}
        {results.map((listing) => (
          <li key={listing.id}>
            <button
              type="button"
              disabled={busy}
              onClick={() => onPick(listing)}
              className="flex w-full items-center justify-between gap-2 rounded-md px-2 py-1.5 text-left text-xs hover:bg-white disabled:opacity-60"
            >
              <span className="truncate font-medium text-gray-900">{listing.name}</span>
              <span className="shrink-0 text-gray-400">{listing.district?.name}</span>
            </button>
          </li>
        ))}
      </ul>

      <button type="button" onClick={onCancel} className="mt-1 text-xs font-medium text-gray-500 hover:text-gray-700">
        Cancel
      </button>
    </div>
  );
}
