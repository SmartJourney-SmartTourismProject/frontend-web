'use client';

import { useRef, type ReactNode } from 'react';
import Link from 'next/link';
import { useReducedMotion } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Reveal } from '@/components/motion/Reveal';
import type { Listing } from '@/lib/types';
import { ListingCard } from './ListingCard';

/** Fade the row's left/right edges so cards dissolve instead of being cut off. */
const EDGE_FADE =
  '[mask-image:linear-gradient(to_right,transparent,black_28px,black_calc(100%-28px),transparent)]';

/** Rows with more items than this (and `marquee` set) scroll by themselves. */
const MARQUEE_MIN_ITEMS = 5;

/**
 * A horizontally scrolling row of cards with an optional "See all" link to
 * the section's full, paginated list. Renders `listings` as ListingCards,
 * or any other cards passed as `children` (e.g. EventCards).
 *
 * `marquee` (the item count) turns a long row into a slow auto-scrolling
 * belt that pauses on hover; reduced-motion users and short rows keep the
 * normal snap-scrolling row.
 */
export function ListingRow({
  title,
  listings = [],
  children,
  emptyMessage,
  seeAllHref,
  marquee,
}: {
  title: string;
  listings?: Listing[];
  children?: ReactNode;
  emptyMessage?: string;
  seeAllHref?: string;
  marquee?: number;
}) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();

  const scrollBy = (dx: number) => scrollRef.current?.scrollBy({ left: dx, behavior: 'smooth' });
  const hasItems = children ? true : listings.length > 0;
  const isMarquee = !reduced && marquee !== undefined && marquee > MARQUEE_MIN_ITEMS;

  const cards =
    children ?? listings.map((listing, i) => <ListingCard key={listing.id} listing={listing} index={i} />);

  return (
    <Reveal as="section" className="mb-8" y={16}>
      <div className="mb-3 flex items-baseline justify-between">
        <h2 className="text-xs font-bold uppercase tracking-wider text-brand-700">{title}</h2>
        {seeAllHref && hasItems && (
          <Link href={seeAllHref} className="text-xs font-semibold text-brand-600 hover:underline">
            See all
          </Link>
        )}
      </div>

      {!hasItems ? (
        <p className="text-sm text-gray-400">{emptyMessage ?? 'Nothing to show yet.'}</p>
      ) : isMarquee ? (
        <div className={`overflow-hidden py-1 ${EDGE_FADE}`}>
          {/* Two identical halves; the belt slides exactly one half, then loops. */}
          <div
            className="flex w-max animate-marquee hover:[animation-play-state:paused] focus-within:[animation-play-state:paused]"
            style={{ animationDuration: `${Math.max(30, marquee * 5)}s` }}
          >
            <div className="flex gap-4 pr-4">{cards}</div>
            <div className="flex gap-4 pr-4" aria-hidden>
              {cards}
            </div>
          </div>
        </div>
      ) : (
        <div className="flex items-center gap-2">
          <button
            onClick={() => scrollBy(-360)}
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-brand-600 transition hover:scale-110 hover:bg-brand-100 active:scale-95"
            aria-label={`Scroll ${title} left`}
          >
            <ChevronLeft className="h-5 w-5" />
          </button>

          <div
            ref={scrollRef}
            className={`flex min-w-0 flex-1 snap-x snap-mandatory scroll-px-7 gap-4 overflow-x-auto scroll-smooth px-7 py-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden ${EDGE_FADE}`}
          >
            {cards}
          </div>

          <button
            onClick={() => scrollBy(360)}
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-brand-600 transition hover:scale-110 hover:bg-brand-100 active:scale-95"
            aria-label={`Scroll ${title} right`}
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>
      )}
    </Reveal>
  );
}
