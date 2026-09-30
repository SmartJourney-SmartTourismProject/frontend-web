import Image from 'next/image';
import { Building2, Eye, Star, UtensilsCrossed, Landmark } from 'lucide-react';

/** 57637 -> "58k". Exact counts add noise at this size; the order of
 *  magnitude is the part that says "this is a well-known place". */
function compactViews(views: number): string {
  if (views >= 1_000_000) return `${(views / 1_000_000).toFixed(1)}M`;
  if (views >= 1_000) return `${Math.round(views / 1_000)}k`;
  return String(views);
}
import type { Listing } from '@/lib/types';

// No free image source exists for restaurants, and most hotels/attractions
// still lack one too (see smartjourney-data-coverage-limits memory) - a
// category-colored placeholder is the deliberate fallback, not a bug.
const CATEGORY_PLACEHOLDER: Record<string, { icon: typeof Building2; className: string }> = {
  hotel: { icon: Building2, className: 'bg-brand-100 text-brand-500' },
  restaurant: { icon: UtensilsCrossed, className: 'bg-orange-100 text-orange-500' },
  attraction: { icon: Landmark, className: 'bg-emerald-100 text-emerald-500' },
};

export function ListingCard({ listing }: { listing: Listing }) {
  const placeholder = CATEGORY_PLACEHOLDER[listing.category.name] ?? {
    icon: Building2,
    className: 'bg-gray-100 text-gray-400',
  };
  const Icon = placeholder.icon;

  return (
    <div className="w-40 shrink-0">
      <div className="relative aspect-square w-40 overflow-hidden rounded-xl bg-gray-100">
        {listing.photo_url ? (
          <Image
            src={listing.photo_url}
            alt={listing.name}
            fill
            sizes="160px"
            className="object-cover"
            // Next's built-in optimizer fetches server-side with no
            // browser User-Agent, which Wikimedia rate-limits (429) - the
            // same bot-UA policy wikidata_enrich.py already had to work
            // around server-side. Loading directly in the browser instead
            // sends a real UA and avoids it. The real fix is having
            // ingestion store a sized thumbnail instead of Wikipedia's
            // full-resolution original (some 6000px+ wide) - tracked as a
            // follow-up, not done here.
            unoptimized
          />
        ) : (
          <div className={`flex h-full w-full items-center justify-center ${placeholder.className}`}>
            <Icon className="h-10 w-10" />
          </div>
        )}
        {/* A star rating when one exists, otherwise how many people look this
            place up - the only signal most attractions have, since ratings
            come from Booking.com and so cover hotels almost exclusively. */}
        {listing.rating ? (
          <div className="absolute bottom-1.5 right-1.5 flex items-center gap-0.5 rounded-full bg-black/60 px-1.5 py-0.5 text-[11px] font-medium text-white">
            <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
            {Number(listing.rating).toFixed(1)}
          </div>
        ) : listing.popularity ? (
          <div
            title={`${listing.popularity.toLocaleString()} Wikipedia views in the last year`}
            className="absolute bottom-1.5 right-1.5 flex items-center gap-0.5 rounded-full bg-black/60 px-1.5 py-0.5 text-[11px] font-medium text-white"
          >
            <Eye className="h-3 w-3 text-sky-300" />
            {compactViews(listing.popularity)}
          </div>
        ) : null}
      </div>
      <p className="mt-1.5 truncate text-xs font-semibold uppercase tracking-wide text-brand-700">
        {listing.name}
      </p>
    </div>
  );
}
