'use client';

import { useRef, type ReactNode } from 'react';
import Link from 'next/link';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import type { Listing } from '@/lib/types';
import { ListingCard } from './ListingCard';

/**
 * A horizontally scrolling row of cards with an optional "See all" link to
 * the section's full, paginated list. Renders `listings` as ListingCards,
 * or any other cards passed as `children` (e.g. EventCards).
 */
export function ListingRow({
  title,
  listings = [],
  children,
  emptyMessage,
  seeAllHref,
}: {
  title: string;
  listings?: Listing[];
  children?: ReactNode;
  emptyMessage?: string;
  seeAllHref?: string;
}) {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scrollBy = (dx: number) => scrollRef.current?.scrollBy({ left: dx, behavior: 'smooth' });
  const hasItems = children ? true : listings.length > 0;

  return (
    <section className="mb-8">
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
      ) : (
        <div className="flex items-center gap-2">
          <button
            onClick={() => scrollBy(-360)}
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-brand-600 hover:bg-brand-50"
            aria-label={`Scroll ${title} left`}
          >
            <ChevronLeft className="h-5 w-5" />
          </button>

          <div ref={scrollRef} className="flex gap-4 overflow-x-auto scroll-smooth pb-1">
            {children ?? listings.map((listing) => <ListingCard key={listing.id} listing={listing} />)}
          </div>

          <button
            onClick={() => scrollBy(360)}
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-brand-600 hover:bg-brand-50"
            aria-label={`Scroll ${title} right`}
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>
      )}
    </section>
  );
}
