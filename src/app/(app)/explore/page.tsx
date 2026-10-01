'use client';

import { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Filter, Search } from 'lucide-react';
import { Skeleton, SkeletonCardRow } from '@/components/ui/Skeleton';
import { exploreApi } from '@/lib/api';
import type { Category, District, ExploreEvent, Listing } from '@/lib/types';
import { ListingCard } from '@/components/explore/ListingCard';
import { ListingRow } from '@/components/explore/ListingRow';
import { EventCard } from '@/components/explore/EventCard';

export default function ExplorePage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [districts, setDistricts] = useState<District[]>([]);
  const [hotels, setHotels] = useState<Listing[]>([]);
  const [restaurants, setRestaurants] = useState<Listing[]>([]);
  const [attractions, setAttractions] = useState<Listing[]>([]);
  const [events, setEvents] = useState<ExploreEvent[]>([]);
  const [loading, setLoading] = useState(true);

  const [query, setQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [districtFilter, setDistrictFilter] = useState('');
  const [minRating, setMinRating] = useState('');
  const [searchResults, setSearchResults] = useState<Listing[] | null>(null);
  const [searching, setSearching] = useState(false);

  useEffect(() => {
    Promise.all([exploreApi.getCategories(), exploreApi.getDistricts()]).then(
      ([cats, dists]) => {
        setCategories(cats);
        setDistricts(dists);
      },
    );
  }, []);

  useEffect(() => {
    const hotelId = categories.find((c) => c.name === 'hotel')?.id;
    const restaurantId = categories.find((c) => c.name === 'restaurant')?.id;
    const attractionId = categories.find((c) => c.name === 'attraction')?.id;
    if (!hotelId || !restaurantId || !attractionId) return;

    setLoading(true);
    Promise.all([
      exploreApi.searchListings({ category: hotelId }),
      exploreApi.searchListings({ category: restaurantId }),
      exploreApi.searchListings({ category: attractionId }),
      // Upcoming only - an event that already ended isn't something to explore.
      exploreApi.getEvents({ from: new Date().toISOString() }),
    ])
      .then(([hotelRes, restaurantRes, attractionRes, eventRes]) => {
        setHotels(hotelRes.items);
        setRestaurants(restaurantRes.items);
        setAttractions(attractionRes.items);
        setEvents(eventRes);
      })
      .finally(() => setLoading(false));
  }, [categories]);

  const isFiltering = query.trim().length > 0 || districtFilter !== '' || minRating !== '';

  useEffect(() => {
    if (!isFiltering) {
      setSearchResults(null);
      return;
    }
    setSearching(true);
    const handle = setTimeout(() => {
      exploreApi
        .searchListings({
          q: query.trim() || undefined,
          district: districtFilter || undefined,
          minRating: minRating ? Number(minRating) : undefined,
        })
        .then((res) => setSearchResults(res.items))
        .finally(() => setSearching(false));
    }, 300);
    return () => clearTimeout(handle);
  }, [query, districtFilter, minRating, isFiltering]);

  const hotelsAndRestaurants = useMemo(
    () => [...hotels.slice(0, 10), ...restaurants.slice(0, 10)],
    [hotels, restaurants],
  );

  return (
    <div className="h-full overflow-y-auto px-8 py-8">
      <div className="mx-auto max-w-5xl">
        <div className="relative mb-8 flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-brand-300" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search Here..."
              className="w-full rounded-full border border-gray-200 py-3 pl-11 pr-4 text-sm shadow-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
            />
          </div>
          <button
            onClick={() => setShowFilters((v) => !v)}
            className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full transition ${
              showFilters ? 'bg-brand-700 text-white' : 'bg-brand-600 text-white hover:bg-brand-700'
            }`}
            aria-label="Toggle filters"
          >
            <Filter className="h-4 w-4" />
          </button>

          <AnimatePresence>
            {showFilters && (
              <motion.div
                initial={{ opacity: 0, scale: 0.92, y: -6 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.92, y: -6 }}
                transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
                style={{ transformOrigin: 'top right' }}
                className="absolute right-0 top-14 z-10 w-64 rounded-xl border border-gray-200 bg-white p-4 shadow-lg"
              >
              <label className="mb-3 block text-xs font-semibold text-gray-600">
                District
                <select
                  value={districtFilter}
                  onChange={(e) => setDistrictFilter(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-gray-300 px-2 py-1.5 text-sm"
                >
                  <option value="">All districts</option>
                  {districts.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.name}
                    </option>
                  ))}
                </select>
              </label>
              <label className="block text-xs font-semibold text-gray-600">
                Minimum rating
                <select
                  value={minRating}
                  onChange={(e) => setMinRating(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-gray-300 px-2 py-1.5 text-sm"
                >
                  <option value="">Any rating</option>
                  {[3, 4, 5].map((n) => (
                    <option key={n} value={n}>
                      {n}+ stars
                    </option>
                  ))}
                </select>
              </label>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {isFiltering ? (
          <section>
            <h2 className="mb-3 text-xs font-bold uppercase tracking-wider text-brand-700">
              Search results
            </h2>
            {searching ? (
              <SkeletonCardRow count={6} />
            ) : searchResults && searchResults.length > 0 ? (
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 md:grid-cols-6">
                {searchResults.map((listing, i) => (
                  <ListingCard key={listing.id} listing={listing} index={i} />
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-400">No listings match your search.</p>
            )}
          </section>
        ) : loading ? (
          <div className="flex flex-col gap-8" role="status" aria-label="Loading">
            {[0, 1, 2].map((row) => (
              <div key={row}>
                <Skeleton className="mb-3 h-3 w-48" />
                <SkeletonCardRow count={6} />
              </div>
            ))}
          </div>
        ) : (
          <>
            <ListingRow
              title="Hotels & Restaurants"
              listings={hotelsAndRestaurants}
              seeAllHref="/explore/hotels"
            />
            <ListingRow
              title="Top Attractions & Hidden Gems"
              listings={attractions}
              seeAllHref="/explore/attractions"
            />
            {/* Approved events only (scraped ones wait in the admin queue
                until an admin verifies them), upcoming only. */}
            <ListingRow
              title="Local Events & Cultural Festivals"
              seeAllHref="/explore/events"
              emptyMessage="No upcoming events yet."
              marquee={Math.min(events.length, 20)}
            >
              {events.length > 0
                ? events
                    .slice(0, 20)
                    .map((event, i) => <EventCard key={event.id} event={event} index={i} />)
                : undefined}
            </ListingRow>
          </>
        )}
      </div>
    </div>
  );
}
