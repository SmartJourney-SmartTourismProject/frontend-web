'use client';

import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { ArrowLeft, ChevronLeft, ChevronRight, Search } from 'lucide-react';
import { exploreApi } from '@/lib/api';
import type { Category, District, ExploreEvent, Listing } from '@/lib/types';
import { ListingCard } from '@/components/explore/ListingCard';
import { EventCard } from '@/components/explore/EventCard';

// URL section -> the category it lists. "events" is separate: it reads
// local_event, not travel_listing.
const SECTIONS = {
  hotels: { label: 'Hotels', category: 'hotel' },
  restaurants: { label: 'Restaurants', category: 'restaurant' },
  attractions: { label: 'Attractions', category: 'attraction' },
  events: { label: 'Events', category: null },
} as const;
type Section = keyof typeof SECTIONS;

/**
 * "See all" for an Explore row: every verified listing in one category (or
 * every upcoming approved event), paged 20 at a time by the API, with the
 * same search and district filter the Explore page offers.
 */
export default function ExploreSectionPage() {
  const params = useParams<{ section: string }>();
  const router = useRouter();
  const section: Section = params.section in SECTIONS ? (params.section as Section) : 'attractions';

  const [categories, setCategories] = useState<Category[]>([]);
  const [districts, setDistricts] = useState<District[]>([]);
  const [query, setQuery] = useState('');
  const [district, setDistrict] = useState('');
  const [page, setPage] = useState(1);

  const [listings, setListings] = useState<Listing[]>([]);
  const [events, setEvents] = useState<ExploreEvent[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    Promise.all([exploreApi.getCategories(), exploreApi.getDistricts()])
      .then(([cats, dists]) => {
        setCategories(cats);
        setDistricts(dists);
      })
      .catch(() => setError(true));
  }, []);

  // A new search or filter starts from page 1.
  useEffect(() => setPage(1), [query, district, section]);

  useEffect(() => {
    const categoryName = SECTIONS[section].category;
    const categoryId = categoryName ? categories.find((c) => c.name === categoryName)?.id : undefined;
    if (categoryName && !categoryId) return; // categories still loading

    setLoading(true);
    setError(false);
    const handle = setTimeout(() => {
      const request =
        section === 'events'
          ? exploreApi
              .getEvents({ district: district || undefined, from: new Date().toISOString() })
              .then((res) => {
                const q = query.trim().toLowerCase();
                const matched = q ? res.filter((e) => e.name.toLowerCase().includes(q)) : res;
                setEvents(matched);
                setTotal(matched.length);
                setTotalPages(1);
              })
          : exploreApi
              .searchListings({
                category: categoryId,
                district: district || undefined,
                q: query.trim() || undefined,
                page,
              })
              .then((res) => {
                setListings(res.items);
                setTotal(res.total);
                setTotalPages(Math.max(1, res.totalPages));
              });
      request.catch(() => setError(true)).finally(() => setLoading(false));
    }, query ? 300 : 0);
    return () => clearTimeout(handle);
  }, [section, categories, district, query, page]);

  const noun = section === 'events' ? 'event' : 'place';

  return (
    <div className="h-full overflow-y-auto px-8 py-8">
      <div className="mx-auto max-w-5xl">
        <Link href="/explore" className="mb-4 inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700">
          <ArrowLeft className="h-4 w-4" /> Back to Explore
        </Link>

        <div className="mb-5 flex flex-wrap gap-2">
          {(Object.keys(SECTIONS) as Section[]).map((key) => (
            <button
              key={key}
              onClick={() => router.push(`/explore/${key}`)}
              className={`rounded-full px-4 py-1.5 text-sm font-medium transition ${
                section === key
                  ? 'bg-brand-gradient text-white shadow'
                  : 'border border-gray-200 text-gray-600 hover:bg-gray-50'
              }`}
            >
              {SECTIONS[key].label}
            </button>
          ))}
        </div>

        <div className="mb-6 flex flex-wrap items-center gap-2">
          <div className="relative min-w-[220px] flex-1">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-brand-300" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={`Search ${SECTIONS[section].label.toLowerCase()}...`}
              className="w-full rounded-full border border-gray-200 py-2.5 pl-11 pr-4 text-sm shadow-sm focus:border-brand-500 focus:outline-none"
            />
          </div>
          <select
            value={district}
            onChange={(e) => setDistrict(e.target.value)}
            className="rounded-full border border-gray-200 px-3 py-2.5 text-sm"
            aria-label="Filter by district"
          >
            <option value="">All districts</option>
            {districts.map((d) => (
              <option key={d.id} value={d.id}>
                {d.name}
              </option>
            ))}
          </select>
        </div>

        <p className="mb-4 text-xs text-gray-500">
          {loading ? 'Loading…' : `${total.toLocaleString()} ${noun}${total === 1 ? '' : 's'}`}
        </p>

        {error ? (
          <p className="text-sm text-red-600">Couldn&apos;t load this list. Check that the API is running.</p>
        ) : !loading && total === 0 ? (
          <p className="text-sm text-gray-400">
            {section === 'events' ? 'No upcoming events match.' : 'No places match your search.'}
          </p>
        ) : (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 md:grid-cols-5">
            {section === 'events'
              ? events.map((event) => <EventCard key={event.id} event={event} />)
              : listings.map((listing) => <ListingCard key={listing.id} listing={listing} />)}
          </div>
        )}

        {section !== 'events' && totalPages > 1 && (
          <div className="mt-8 flex items-center justify-center gap-3 text-sm">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1 || loading}
              className="flex items-center gap-1 rounded-lg border border-gray-200 px-3 py-1.5 disabled:opacity-40"
            >
              <ChevronLeft className="h-4 w-4" /> Previous
            </button>
            <span className="text-gray-500">
              Page {page} of {totalPages.toLocaleString()}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages || loading}
              className="flex items-center gap-1 rounded-lg border border-gray-200 px-3 py-1.5 disabled:opacity-40"
            >
              Next <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
