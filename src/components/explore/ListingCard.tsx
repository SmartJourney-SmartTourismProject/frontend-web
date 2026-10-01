import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, Building2, Eye, Star, UtensilsCrossed, Landmark } from 'lucide-react';
import { RevealCard } from '@/components/motion/Reveal';

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
// category-colored placeholder is the deliberate fallback, not a bug. It
// shimmers and bobs so a row of them reads as designed, not as broken images.
const CATEGORY_PLACEHOLDER: Record<string, { icon: typeof Building2; className: string }> = {
  hotel: { icon: Building2, className: 'bg-brand-100 text-brand-500' },
  restaurant: { icon: UtensilsCrossed, className: 'bg-orange-100 text-orange-500' },
  attraction: { icon: Landmark, className: 'bg-emerald-100 text-emerald-500' },
};

export function ListingCard({ listing, index = 0 }: { listing: Listing; index?: number }) {
  const placeholder = CATEGORY_PLACEHOLDER[listing.category.name] ?? {
    icon: Building2,
    className: 'bg-gray-100 text-gray-400',
  };
  const Icon = placeholder.icon;
  const district = listing.district?.name;
  // Opens the Home chat with this place typed in, ready to edit and send.
  const planPrompt = `Plan a 3-day trip${district ? ` in ${district}` : ''} including ${listing.name}`;

  return (
    <RevealCard className="w-40 shrink-0 snap-start" index={index}>
      <div className="group transition-transform duration-300 hover:-translate-y-1">
        <div className="relative aspect-square w-40 overflow-hidden rounded-xl bg-gray-100 shadow-sm transition-shadow duration-300 group-hover:shadow-xl">
          {listing.photo_url ? (
            <Image
              src={listing.photo_url}
              alt={listing.name}
              fill
              sizes="160px"
              className="object-cover transition duration-500 ease-out group-hover:scale-110"
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
            <div
              className={`relative flex h-full w-full items-center justify-center overflow-hidden ${placeholder.className}`}
            >
              <div className="absolute inset-0 animate-shimmer bg-gradient-to-r from-transparent via-white/50 to-transparent bg-[length:200%_100%]" />
              <Icon className="relative h-10 w-10 animate-float" />
            </div>
          )}

          {/* Darkens on hover so the action chip stays legible on any photo. */}
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

          {/* A star rating when one exists, otherwise how many people look this
              place up - the only signal most attractions have, since ratings
              come from Booking.com and so cover hotels almost exclusively. */}
          {listing.rating ? (
            <div className="absolute right-1.5 top-1.5 flex items-center gap-0.5 rounded-full bg-black/60 px-1.5 py-0.5 text-[11px] font-medium text-white">
              <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
              {Number(listing.rating).toFixed(1)}
            </div>
          ) : listing.popularity ? (
            <div
              title={`${listing.popularity.toLocaleString()} Wikipedia views in the last year`}
              className="absolute right-1.5 top-1.5 flex items-center gap-0.5 rounded-full bg-black/60 px-1.5 py-0.5 text-[11px] font-medium text-white"
            >
              <Eye className="h-3 w-3 text-sky-300" />
              {compactViews(listing.popularity)}
            </div>
          ) : null}

          <Link
            href={`/home?prompt=${encodeURIComponent(planPrompt)}`}
            className="absolute inset-x-2 bottom-2 flex translate-y-[130%] items-center justify-center gap-1 rounded-full bg-white/90 px-2 py-1.5 text-[11px] font-semibold text-brand-700 shadow backdrop-blur transition duration-300 hover:bg-white focus-visible:translate-y-0 group-hover:translate-y-0"
          >
            Plan a trip here <ArrowRight className="h-3 w-3" />
          </Link>
        </div>
        <p className="mt-1.5 truncate text-xs font-semibold uppercase tracking-wide text-brand-700">
          {listing.name}
        </p>
      </div>
    </RevealCard>
  );
}
