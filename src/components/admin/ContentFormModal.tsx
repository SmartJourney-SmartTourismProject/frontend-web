'use client';

import { useEffect, useState } from 'react';
import { Loader2, X } from 'lucide-react';
import { adminApi, exploreApi } from '@/lib/api';
import type { AdminEvent, AdminListing, Category, District, Tag } from '@/lib/types';

type Kind = 'listings' | 'events';

/**
 * SRS §3.1.11 - "add, update, or remove attractions, restaurants, events and
 * travel options... destination, category, description, images, status".
 *
 * Create and edit share one form: the API takes the same field set for both,
 * minus the coordinates, which only a new row needs (`location` is NOT NULL
 * and a listing without a position can't be mapped or distance-scored). An
 * admin-created row is published immediately - a human already reviewed it by
 * definition - while ingested rows still go through the queue.
 */
export function ContentFormModal({
  kind,
  editing,
  onClose,
  onSaved,
}: {
  kind: Kind;
  editing: AdminListing | AdminEvent | null;
  onClose: () => void;
  onSaved: () => void;
}) {
  const isEdit = editing !== null;
  const isListing = kind === 'listings';
  const listing = isListing ? (editing as AdminListing | null) : null;
  const event = !isListing ? (editing as AdminEvent | null) : null;

  const [districts, setDistricts] = useState<District[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [tagOptions, setTagOptions] = useState<Tag[]>([]);
  // District and category are required <select>s whose options arrive from the
  // API. Submitting before they land leaves them empty, and the browser then
  // blocks the submit by focusing the field - with no message the user can act
  // on, so the save looks like it simply did nothing. Gate the button instead.
  const [refDataLoaded, setRefDataLoaded] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState({
    name: editing?.name ?? '',
    description: editing?.description ?? '',
    district_id: editing?.district?.id ?? '',
    category_id: listing?.category?.id ?? '',
    latitude: listing?.latitude?.toString() ?? '',
    longitude: listing?.longitude?.toString() ?? '',
    photo_url: listing?.photo_url ?? '',
    price_level: listing?.price_level?.toString() ?? '',
    rating: listing?.rating?.toString() ?? '',
    venue_name: event?.venue_name ?? '',
    start_datetime: event?.start_datetime ? event.start_datetime.slice(0, 16) : '',
    end_datetime: event?.end_datetime ? event.end_datetime.slice(0, 16) : '',
    tags: editing?.tags ?? ([] as string[]),
  });

  useEffect(() => {
    Promise.all([exploreApi.getDistricts(), exploreApi.getCategories(), exploreApi.getTags()])
      .then(([d, c, t]) => {
        setDistricts(d);
        setCategories(c);
        setTagOptions(t);
        setRefDataLoaded(true);
      })
      .catch(() => setError('Could not load districts, categories and tags.'));
  }, []);

  const set = <K extends keyof typeof form>(key: K, value: (typeof form)[K]) =>
    setForm((f) => ({ ...f, [key]: value }));

  const toggleTag = (tag: string) =>
    set('tags', form.tags.includes(tag) ? form.tags.filter((t) => t !== tag) : [...form.tags, tag]);

  const num = (v: string) => (v.trim() === '' ? undefined : Number(v));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      if (isListing) {
        const body = {
          name: form.name.trim(),
          description: form.description.trim() || null,
          district_id: form.district_id,
          category_id: form.category_id,
          tags: form.tags,
          price_level: num(form.price_level) ?? null,
          rating: num(form.rating) ?? null,
          photo_url: form.photo_url.trim() || null,
        };
        if (isEdit) await adminApi.updateListing(editing!.id, body);
        else
          await adminApi.createListing({
            ...body,
            latitude: Number(form.latitude),
            longitude: Number(form.longitude),
          });
      } else {
        const body = {
          name: form.name.trim(),
          description: form.description.trim() || null,
          district_id: form.district_id,
          venue_name: form.venue_name.trim() || null,
          tags: form.tags,
          start_datetime: new Date(form.start_datetime).toISOString(),
          end_datetime: form.end_datetime ? new Date(form.end_datetime).toISOString() : null,
        };
        if (isEdit) await adminApi.updateEvent(editing!.id, body);
        else await adminApi.createEvent(body);
      }
      onSaved();
      onClose();
    } catch (err: unknown) {
      const message = (err as { response?: { data?: { message?: string | string[] } } })?.response?.data?.message;
      setError(Array.isArray(message) ? message.join(', ') : (message ?? 'Could not save.'));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/40 p-4 sm:p-8">
      <form
        onSubmit={submit}
        className="w-full max-w-2xl rounded-2xl bg-white p-6 shadow-xl"
        aria-label={`${isEdit ? 'Edit' : 'Add'} ${isListing ? 'listing' : 'event'}`}
      >
        <header className="mb-4 flex items-start justify-between">
          <div>
            <h2 className="font-serif text-xl font-semibold text-brand-700">
              {isEdit ? 'Edit' : 'Add'} {isListing ? 'listing' : 'event'}
            </h2>
            <p className="mt-0.5 text-xs text-gray-500">
              {isEdit
                ? 'Changes are recorded in the activity log.'
                : 'Created by an admin, so it is published straight away.'}
            </p>
          </div>
          <button type="button" onClick={onClose} aria-label="Close" className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100">
            <X className="h-4 w-4" />
          </button>
        </header>

        {error && (
          <p className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700" role="alert">
            {error}
          </p>
        )}

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Name" className="sm:col-span-2">
            <input required value={form.name} onChange={(e) => set('name', e.target.value)} className={INPUT} />
          </Field>

          <Field label="Description" className="sm:col-span-2">
            <textarea
              rows={3}
              value={form.description}
              onChange={(e) => set('description', e.target.value)}
              className={INPUT}
            />
          </Field>

          <Field label="District">
            <select required value={form.district_id} onChange={(e) => set('district_id', e.target.value)} className={INPUT}>
              <option value="">Select a district</option>
              {districts.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name}
                </option>
              ))}
            </select>
          </Field>

          {isListing ? (
            <Field label="Category">
              <select required value={form.category_id} onChange={(e) => set('category_id', e.target.value)} className={INPUT}>
                <option value="">Select a category</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </Field>
          ) : (
            <Field label="Venue">
              <input value={form.venue_name} onChange={(e) => set('venue_name', e.target.value)} className={INPUT} />
            </Field>
          )}

          {isListing && !isEdit && (
            <>
              <Field label="Latitude" hint="Required — the map and distance scoring need it">
                <input
                  required
                  inputMode="decimal"
                  placeholder="7.2936"
                  value={form.latitude}
                  onChange={(e) => set('latitude', e.target.value)}
                  className={INPUT}
                />
              </Field>
              <Field label="Longitude">
                <input
                  required
                  inputMode="decimal"
                  placeholder="80.6413"
                  value={form.longitude}
                  onChange={(e) => set('longitude', e.target.value)}
                  className={INPUT}
                />
              </Field>
            </>
          )}

          {isListing && (
            <>
              <Field label="Price level" hint="1 (cheap) to 4 (expensive)">
                <select value={form.price_level} onChange={(e) => set('price_level', e.target.value)} className={INPUT}>
                  <option value="">Not set</option>
                  {[1, 2, 3, 4].map((n) => (
                    <option key={n} value={n}>
                      {'$'.repeat(n)}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="Rating" hint="0–5">
                <input
                  inputMode="decimal"
                  value={form.rating}
                  onChange={(e) => set('rating', e.target.value)}
                  className={INPUT}
                />
              </Field>
              <Field label="Image URL" className="sm:col-span-2" hint="Shown on the listing card in Explore">
                <input
                  type="url"
                  placeholder="https://…"
                  value={form.photo_url}
                  onChange={(e) => set('photo_url', e.target.value)}
                  className={INPUT}
                />
              </Field>
            </>
          )}

          {!isListing && (
            <>
              <Field label="Starts">
                <input
                  required
                  type="datetime-local"
                  value={form.start_datetime}
                  onChange={(e) => set('start_datetime', e.target.value)}
                  className={INPUT}
                />
              </Field>
              <Field label="Ends" hint="Optional">
                <input
                  type="datetime-local"
                  value={form.end_datetime}
                  onChange={(e) => set('end_datetime', e.target.value)}
                  className={INPUT}
                />
              </Field>
            </>
          )}

          {/* A <label> must not wrap these buttons: it would fold "Tags" into
              every button's accessible name and make a click ambiguous.
              A labelled group is the correct container for a set of toggles. */}
          <div role="group" aria-labelledby="tags-label" className="flex flex-col gap-1 text-sm sm:col-span-2">
            <span id="tags-label" className="font-semibold text-gray-800">
              Tags
            </span>
            <div className="flex flex-wrap gap-1.5">
              {tagOptions.map((t) => {
                const on = form.tags.includes(t.tag);
                return (
                  <button
                    type="button"
                    key={t.tag}
                    onClick={() => toggleTag(t.tag)}
                    aria-pressed={on}
                    className={`rounded-full border px-2.5 py-1 text-xs font-medium transition ${
                      on ? 'border-brand-600 bg-brand-gradient text-white' : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    {t.label}
                  </button>
                );
              })}
            </div>
            <span className="text-xs text-gray-500">
              From the shared vocabulary the recommender scores against
            </span>
          </div>
        </div>

        <footer className="mt-6 flex justify-end gap-2">
          <button type="button" onClick={onClose} className="rounded-xl border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving || !refDataLoaded}
            title={!refDataLoaded ? 'Loading districts and categories…' : undefined}
            className="flex items-center gap-2 rounded-xl bg-brand-gradient px-5 py-2 text-sm font-bold text-white hover:opacity-90 disabled:opacity-60"
          >
            {(saving || !refDataLoaded) && <Loader2 className="h-4 w-4 animate-spin" />}
            {isEdit ? 'Save changes' : 'Create'}
          </button>
        </footer>
      </form>
    </div>
  );
}

const INPUT =
  'w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500';

function Field({
  label,
  hint,
  className = '',
  children,
}: {
  label: string;
  hint?: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <label className={`flex flex-col gap-1 text-sm ${className}`}>
      <span className="font-semibold text-gray-800">{label}</span>
      {children}
      {hint && <span className="text-xs text-gray-500">{hint}</span>}
    </label>
  );
}
