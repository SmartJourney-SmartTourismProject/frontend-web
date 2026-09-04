'use client'

import { useState } from 'react'
import { Search, SlidersHorizontal } from 'lucide-react'
import { ListingRow, type Listing } from '@/components/app-shell/ListingRow'

const gradients = [
  'from-royal-300 to-royal-600',
  'from-berry-300 to-berry-600',
  'from-mist-300 to-royal-700',
  'from-amber-300 to-berry-600',
  'from-royal-400 to-berry-500',
  'from-mist-400 to-mist-800',
]

function makeRow(prefix: string, names: string[], metas: string[]): Listing[] {
  return names.map((name, i) => ({
    id: `${prefix}-${i}`,
    name,
    meta: metas[i % metas.length],
    rating: [4.3, 4.5, 4.6, 4.8, 4.4, 4.9][i % 6],
    gradient: gradients[i % gradients.length],
  }))
}

const HOTELS = makeRow(
  'hotel',
  ['Amaya Hills', 'Cinnamon Citadel', 'The Kandy House', 'Elephant Stables', 'Earl\'s Regent', 'Slightly Chilled'],
  ['Kandy · Mid-range', 'Kandy · Luxury', 'Kandy · Boutique', 'Kandy · Budget']
)
const ATTRACTIONS = makeRow(
  'attraction',
  ['Temple of the Tooth', 'Royal Botanical Gardens', 'Knuckles Range', 'Galkissa Beach', 'Nine Arches Bridge', 'Sigiriya Rock'],
  ['Cultural site', 'Park & garden', 'Hiking / viewpoint', 'Beach']
)
const EVENTS = makeRow(
  'event',
  ['Kandy Esala Perahera', 'Galle Lantern Festival', 'Colombo Food Fest', 'Nuwara Eliya Tea Week', 'Jaffna Music Night', 'Ella Sunset Market'],
  ['Cultural festival', 'Nov 12–14', 'Weekend market', 'Local event']
)

export default function ExplorePage() {
  const [query, setQuery] = useState('')

  return (
    <div className="mx-auto max-w-6xl px-6 py-10 sm:px-10">
      <div className="mx-auto mb-10 flex max-w-2xl items-center gap-2 rounded-2xl border border-gray-200 bg-white px-4 py-2.5 shadow-sm">
        <Search className="h-4 w-4 text-berry-400" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search Here..."
          className="flex-1 bg-transparent text-sm text-gray-700 placeholder-gray-400 focus:outline-none"
        />
        <button className="flex h-8 w-8 items-center justify-center rounded-lg bg-royal-800 text-white" aria-label="Filters">
          <SlidersHorizontal className="h-3.5 w-3.5" />
        </button>
      </div>

      <ListingRow title="Hotels & Restaurants" listings={HOTELS} />
      <ListingRow title="Top Attractions & Hidden Gems" listings={ATTRACTIONS} />
      <ListingRow title="Local Events & Cultural Festivals" listings={EVENTS} />
    </div>
  )
}
