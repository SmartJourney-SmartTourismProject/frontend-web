'use client'

import { useMemo, useState } from 'react'
import { MoreHorizontal } from 'lucide-react'
import { useItineraryStore } from '@/lib/store'
import type { ItineraryTab, SavedItinerary } from '@/types/app'
import { cn } from '@/lib/utils'

const TABS: { id: ItineraryTab; label: string }[] = [
  { id: 'upcoming', label: 'Upcoming' },
  { id: 'drafts', label: 'Drafts / In Progress' },
  { id: 'past', label: 'Past Trips' },
]

const STATUS_STYLE: Record<SavedItinerary['status'], string> = {
  in_progress: 'bg-berry-500 text-white',
  verified: 'bg-royal-900 text-white',
  missing_hotel: 'bg-amber-500 text-white',
  draft: 'bg-gray-500 text-white',
  past: 'bg-gray-400 text-white',
}

const STATUS_LABEL: Record<SavedItinerary['status'], string> = {
  in_progress: 'In Progress',
  verified: 'Verified',
  missing_hotel: 'Missing Hotel',
  draft: 'Draft',
  past: 'Completed',
}

const COVER_GRADIENTS = [
  'from-royal-400 to-royal-800',
  'from-berry-400 to-royal-700',
  'from-mist-400 to-royal-800',
  'from-amber-400 to-berry-600',
]

export default function SavedItinerariesPage() {
  const [tab, setTab] = useState<ItineraryTab>('upcoming')
  const itineraries = useItineraryStore((s) => s.itineraries)

  const filtered = useMemo(() => itineraries.filter((i) => i.tab === tab), [itineraries, tab])

  return (
    <div className="mx-auto max-w-6xl px-6 py-10 sm:px-10">
      <h1 className="font-display text-3xl font-bold text-gray-900">Saved itineraries</h1>
      <p className="mt-1 text-xs font-semibold uppercase tracking-wide text-berry-500">Your journeys</p>

      <div className="mt-5 flex gap-6 border-b border-gray-100">
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={cn(
              'relative flex items-center gap-2 pb-3 text-sm font-semibold transition',
              tab === t.id ? 'text-royal-800' : 'text-gray-400 hover:text-gray-600'
            )}
          >
            {t.label}
            {t.id === 'upcoming' && tab === 'upcoming' && (
              <span className="rounded-full bg-royal-900 px-2 py-0.5 text-[10px] font-bold text-white">Active</span>
            )}
            {tab === t.id && <span className="absolute -bottom-px left-0 right-0 h-0.5 bg-royal-700" />}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center text-gray-400">
          <p className="text-sm">Nothing here yet — trips you save from a chat will show up in this tab.</p>
        </div>
      ) : (
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((itin, i) => (
            <div key={itin.id} className="card overflow-hidden">
              <div className={`relative h-40 bg-gradient-to-br ${COVER_GRADIENTS[i % COVER_GRADIENTS.length]}`}>
                <span
                  className={cn(
                    'absolute left-3 top-3 rounded-full px-3 py-1 text-[11px] font-semibold',
                    STATUS_STYLE[itin.status]
                  )}
                >
                  {STATUS_LABEL[itin.status]}
                </span>
                <button
                  className="absolute right-3 top-3 flex h-7 w-7 items-center justify-center rounded-full bg-white/90 text-gray-600 shadow"
                  aria-label="More options"
                >
                  <MoreHorizontal className="h-4 w-4" />
                </button>
              </div>
              <div className="p-4">
                <p className="font-semibold text-gray-900">{itin.title}</p>
                <p className="mt-1 text-xs text-gray-400">
                  {itin.days} Days · {itin.dateRangeLabel}
                </p>
                <p className="mt-2 text-sm font-semibold text-royal-700">
                  {itin.currency} {itin.budget.toLocaleString()}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
