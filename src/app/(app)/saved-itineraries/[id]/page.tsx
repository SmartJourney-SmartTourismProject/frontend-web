'use client';

import dynamic from 'next/dynamic';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { ArrowLeft, Trash2 } from 'lucide-react';
import { tripsApi } from '@/lib/api';
import { useTripStore } from '@/lib/trip-store';
import { tripToItineraryDays } from '@/lib/trip-mappers';
import type { TripDetail, TripStatus } from '@/lib/types';

const RouteMapPanel = dynamic(
  () => import('@/components/shell/RouteMapPanel').then((m) => m.RouteMapPanel),
  { ssr: false },
);

const STATUS_OPTIONS: { label: string; value: TripStatus }[] = [
  { label: 'Draft / In Progress', value: 'draft' },
  { label: 'Upcoming', value: 'upcoming' },
  { label: 'Past', value: 'past' },
];

export default function TripDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [trip, setTrip] = useState<TripDetail | null>(null);
  const [notFound, setNotFound] = useState(false);
  const setPlan = useTripStore((s) => s.setPlan);
  const resetTrip = useTripStore((s) => s.reset);

  useEffect(() => {
    reload(id).catch(() => setNotFound(true));

    return () => resetTrip();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const [dateError, setDateError] = useState<string | null>(null);

  const reload = async (id: string) => {
    const t = await tripsApi.getById(id);
    setTrip(t);
    setPlan({
      itinerary: tripToItineraryDays(t),
      destination: t.district?.name ?? t.title,
      estimatedCost: t.estimated_cost ? Number(t.estimated_cost) : null,
      currency: t.currency,
      // A saved trip stores its stops, not the origin it was planned
      // from, so there is no departure leg to redraw here.
      startLocation: null,
    });
  };

  const handleStatusChange = async (status: TripStatus) => {
    if (!trip) return;
    const updated = await tripsApi.update(trip.id, { status });
    setTrip({ ...trip, status: updated.status });
  };

  // Picking a start date re-dates every day server-side and, for a draft,
  // confirms it (Upcoming) - so the day headers and status are reloaded.
  const handleStartDate = async (value: string) => {
    if (!trip || !value) return;
    setDateError(null);
    try {
      await tripsApi.update(trip.id, { start_date: value });
      await reload(trip.id);
    } catch {
      setDateError('Could not update the dates. Please try again.');
    }
  };

  // An undated "upcoming" trip could never later move to Past, so
  // confirming asks for a start date first when the trip has none.
  const handleConfirm = async () => {
    if (!trip) return;
    if (!trip.start_date) {
      setDateError('Pick a start date to confirm this trip.');
      return;
    }
    const updated = await tripsApi.update(trip.id, { status: 'upcoming' });
    setTrip({ ...trip, status: updated.status });
  };

  const dateRange =
    trip?.start_date && trip.end_date
      ? `${new Date(trip.start_date).toLocaleDateString()} – ${new Date(trip.end_date).toLocaleDateString()}`
      : 'Dates not set';

  const handleDelete = async () => {
    if (!trip || !confirm('Delete this saved itinerary?')) return;
    await tripsApi.remove(trip.id);
    router.push('/saved-itineraries');
  };

  if (notFound) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-3">
        <p className="text-gray-500">This trip couldn&apos;t be found.</p>
        <Link href="/saved-itineraries" className="text-sm font-medium text-brand-600 hover:underline">
          ← Back to Saved itineraries
        </Link>
      </div>
    );
  }

  if (!trip) {
    return <div className="flex h-full items-center justify-center text-gray-500">Loading…</div>;
  }

  return (
    <div className="flex h-full">
      <div className="w-[420px] shrink-0 overflow-y-auto border-r border-gray-100 p-6">
        <Link
          href="/saved-itineraries"
          className="mb-4 inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700"
        >
          <ArrowLeft className="h-4 w-4" /> Back
        </Link>

        <h1 className="font-serif text-xl font-semibold text-gray-900">
          {trip.title || trip.district?.name || 'Untitled trip'}
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          {trip.itinerary_day.length} day{trip.itinerary_day.length !== 1 ? 's' : ''}
          {trip.estimated_cost && ` · ${Number(trip.estimated_cost).toLocaleString()} ${trip.currency}`}
        </p>

        <div className="mt-4 flex flex-wrap items-center gap-2 text-sm">
          <span className="text-gray-600">{dateRange}</span>
          <label className="flex items-center gap-1 text-gray-500">
            Start
            <input
              type="date"
              value={trip.start_date ? trip.start_date.slice(0, 10) : ''}
              onChange={(e) => handleStartDate(e.target.value)}
              className="rounded-lg border border-gray-300 px-2 py-1 text-sm"
              aria-label="Trip start date"
            />
          </label>
          {trip.status === 'draft' && (
            <button
              onClick={handleConfirm}
              className="rounded-lg bg-brand-gradient px-3 py-1.5 text-sm font-semibold text-white hover:opacity-90"
            >
              Confirm trip
            </button>
          )}
        </div>
        {dateError && <p className="mt-2 text-xs text-red-600">{dateError}</p>}

        <div className="mt-4 flex items-center gap-2">
          <select
            value={trip.status}
            onChange={(e) => handleStatusChange(e.target.value as TripStatus)}
            className="rounded-lg border border-gray-300 px-2 py-1.5 text-sm"
          >
            {STATUS_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
          <button
            onClick={handleDelete}
            className="flex items-center gap-1 rounded-lg px-2 py-1.5 text-sm text-red-600 hover:bg-red-50"
          >
            <Trash2 className="h-4 w-4" /> Delete
          </button>
        </div>

        <div className="mt-6 flex flex-col gap-4">
          {trip.itinerary_day.map((day) => (
            <div key={day.id} className="rounded-xl border border-gray-200">
              <div className="border-b border-gray-100 bg-gray-50 px-3 py-2 text-xs font-bold uppercase tracking-wide text-brand-700">
                Day {day.day_number}
                {day.date && ` · ${new Date(day.date).toLocaleDateString()}`}
              </div>
              <ul className="divide-y divide-gray-100">
                {day.itinerary_item.map((item) => (
                  <li key={item.id} className="px-3 py-2 text-sm">
                    <span className="font-medium text-gray-900">{item.name}</span>
                    <span className="ml-2 text-xs text-gray-500">{item.item_type}</span>
                    {item.notes && <p className="mt-0.5 text-xs text-gray-500">{item.notes}</p>}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
      <div className="flex-1">
        <RouteMapPanel />
      </div>
    </div>
  );
}
