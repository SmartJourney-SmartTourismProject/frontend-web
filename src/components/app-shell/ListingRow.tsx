'use client'

import { useRef } from 'react'
import { ChevronLeft, ChevronRight, Star } from 'lucide-react'

export interface Listing {
  id: string
  name: string
  meta: string
  rating: number
  gradient: string
}

export function ListingRow({ title, listings }: { title: string; listings: Listing[] }) {
  const scrollerRef = useRef<HTMLDivElement>(null)

  function scrollBy(amount: number) {
    scrollerRef.current?.scrollBy({ left: amount, behavior: 'smooth' })
  }

  return (
    <section className="mb-10">
      <h2 className="mb-4 text-xs font-bold uppercase tracking-wide text-royal-700">{title}</h2>
      <div className="relative">
        <button
          onClick={() => scrollBy(-320)}
          className="absolute -left-3 top-1/2 z-10 hidden h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-white text-royal-700 shadow-md hover:bg-royal-50 sm:flex"
          aria-label="Scroll left"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        <div ref={scrollerRef} className="scrollbar-hide flex gap-5 overflow-x-auto pb-1">
          {listings.map((listing) => (
            <div key={listing.id} className="w-44 shrink-0 sm:w-48">
              <div
                className={`aspect-square w-full rounded-2xl bg-gradient-to-br ${listing.gradient} shadow-sm`}
              />
              <div className="mt-2 flex items-center justify-between">
                <p className="truncate text-xs font-bold uppercase tracking-wide text-gray-700">
                  {listing.name}
                </p>
                <span className="flex shrink-0 items-center gap-0.5 text-[11px] font-semibold text-amber-500">
                  <Star className="h-3 w-3 fill-amber-400 text-amber-400" /> {listing.rating}
                </span>
              </div>
              <p className="truncate text-[11px] text-gray-400">{listing.meta}</p>
            </div>
          ))}
        </div>
        <button
          onClick={() => scrollBy(320)}
          className="absolute -right-3 top-1/2 z-10 hidden h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-white text-royal-700 shadow-md hover:bg-royal-50 sm:flex"
          aria-label="Scroll right"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </section>
  )
}
