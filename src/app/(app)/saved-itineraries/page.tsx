'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { Calendar, MapPin, Trash2 } from 'lucide-react';
import { tripsApi } from '@/lib/api';
import type { Trip, TripStatus } from '@/lib/types';

const TABS: { label: string; status: TripStatus }[] = [
  { label: 'Upcoming', status: 'upcoming' },
  { label: 'Drafts / In Progress', status: 'draft' },
  { label: 'Past Trips', status: 'past' },
];

const STATUS_BADGE: Record<TripStatus, string> = {
  upcoming: 'bg-emerald-100 text-emerald-700',
  draft: 'bg-pink-100 text-pink-700',
  past: 'bg-gray-100 text-gray-600',
};

export default function SavedItinerariesPage() {
  const [activeStatus, setActiveStatus] = useState<TripStatus>('draft');
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
    tripsApi
      .list(activeStatus)
      .then(setTrips)
      .finally(() => setLoading(false));
  };

  useEffect(load, [activeStatus]);

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this saved itinerary?')) return;
    await tripsApi.remove(id);
    setTrips((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <div className="h-full overflow-y-auto px-8 py-8">
      <div className="mx-auto max-w-5xl">
        <h1 className="font-serif text-2xl font-semibold text-gray-900">Saved itineraries</h1>
        <p className="mt-1 text-sm text-gray-500">Your journeys, in one place.</p>

        <div className="mt-6 flex gap-6 border-b border-gray-200">
          {TABS.map((tab) => (
            <button
              key={tab.status}
              onClick={() => setActiveStatus(tab.status)}
              className={`-mb-px border-b-2 pb-3 text-sm font-semibold transition ${
                activeStatus === tab.status
                  ? 'border-brand-600 text-brand-700'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="mt-6">
          {loading ? (
            <p className="text-sm text-gray-400">Loading…</p>
          ) : trips.length === 0 ? (
            <p className="text-sm text-gray-400">
              No trips here yet. Save a plan from the Home chat to see it here.
            </p>
          ) : (
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {trips.map((trip) => (
                <TripCard key={trip.id} trip={trip} onDelete={() => handleDelete(trip.id)} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function TripCard({ trip, onDelete }: { trip: Trip; onDelete: () => void }) {
  const dateRange =
    trip.start_date && trip.end_date
      ? `${new Date(trip.start_date).toLocaleDateString()} – ${new Date(trip.end_date).toLocaleDateString()}`
      : 'Dates not set';

  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200 shadow-sm transition hover:shadow-md">
      <Link href={`/saved-itineraries/${trip.id}`}>
        <div className="relative flex h-28 items-center justify-center bg-brand-gradient">
          <MapPin className="h-8 w-8 text-white/80" />
          <span
            className={`absolute left-3 top-3 rounded-full px-2 py-0.5 text-[11px] font-semibold ${STATUS_BADGE[trip.status]}`}
          >
            {trip.status === 'draft' ? 'In Progress' : trip.status === 'upcoming' ? 'Upcoming' : 'Past'}
          </span>
        </div>
      </Link>
      <div className="p-4">
        <Link href={`/saved-itineraries/${trip.id}`}>
          <h3 className="truncate text-sm font-bold text-gray-900">
            {trip.title || trip.district?.name || 'Untitled trip'}
          </h3>
        </Link>
        <p className="mt-1 flex items-center gap-1 text-xs text-gray-500">
          <Calendar className="h-3.5 w-3.5" />
          {dateRange}
        </p>
        <div className="mt-3 flex items-center justify-between">
          <span className="text-xs font-semibold text-brand-700">
            {trip.estimated_cost
              ? `${Number(trip.estimated_cost).toLocaleString()} ${trip.currency}`
              : '—'}
          </span>
          <button
            onClick={onDelete}
            className="rounded-lg p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-600"
            aria-label="Delete trip"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
