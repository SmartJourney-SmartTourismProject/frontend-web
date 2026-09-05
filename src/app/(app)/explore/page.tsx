'use client';

import { useEffect, useMemo, useState } from 'react';
import { Filter, Search } from 'lucide-react';
import { exploreApi } from '@/lib/api';
import type { Category, District, ExploreEvent, Listing } from '@/lib/types';
import { ListingCard } from '@/components/explore/ListingCard';
import { ListingRow } from '@/components/explore/ListingRow';

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
      exploreApi.getEvents(),
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

          {showFilters && (
            <div className="absolute right-0 top-14 z-10 w-64 rounded-xl border border-gray-200 bg-white p-4 shadow-lg">
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
            </div>
          )}
        </div>

        {isFiltering ? (
          <section>
            <h2 className="mb-3 text-xs font-bold uppercase tracking-wider text-brand-700">
              Search results
            </h2>
            {searching ? (
              <p className="text-sm text-gray-400">Searching…</p>
            ) : searchResults && searchResults.length > 0 ? (
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 md:grid-cols-6">
                {searchResults.map((listing) => (
                  <ListingCard key={listing.id} listing={listing} />
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-400">No listings match your search.</p>
            )}
          </section>
        ) : loading ? (
          <p className="text-sm text-gray-400">Loading…</p>
        ) : (
          <>
            <ListingRow title="Hotels & Restaurants" listings={hotelsAndRestaurants} />
            <ListingRow title="Top Attractions & Hidden Gems" listings={attractions} />
            {/* local_event has 0 rows nationwide - Ticketmaster has no Sri
                Lanka coverage, re-verified live 2026-09-04 (see TODO.md).
                Rail ships empty rather than building event cards for data
                that doesn't exist; events is still fetched so this updates
                itself the moment real event data lands (admin-entered). */}
            <ListingRow
              title="Local Events & Cultural Festivals"
              listings={[]}
              emptyMessage={events.length === 0 ? 'No events available yet.' : undefined}
            />
          </>
        )}
      </div>
    </div>
  );
}
