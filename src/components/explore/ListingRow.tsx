'use client';

import { useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import type { Listing } from '@/lib/types';
import { ListingCard } from './ListingCard';

export function ListingRow({
  title,
  listings,
  emptyMessage,
}: {
  title: string;
  listings: Listing[];
  emptyMessage?: string;
}) {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scrollBy = (dx: number) => scrollRef.current?.scrollBy({ left: dx, behavior: 'smooth' });

  return (
    <section className="mb-8">
      <h2 className="mb-3 text-xs font-bold uppercase tracking-wider text-brand-700">{title}</h2>

      {listings.length === 0 ? (
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
            {listings.map((listing) => (
              <ListingCard key={listing.id} listing={listing} />
            ))}
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
