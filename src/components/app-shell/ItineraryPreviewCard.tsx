import { CheckCircle2 } from 'lucide-react'
import type { ItineraryItem } from '@/types/trip'

export function ItineraryPreviewCard({
  destination,
  days,
  estimatedCost,
}: {
  destination?: string
  days: ItineraryItem[]
  estimatedCost?: number | null
}) {
  return (
    <div className="mt-3 overflow-hidden rounded-2xl border border-royal-100">
      <div className="flex items-center justify-between bg-royal-900 px-4 py-2.5 text-white">
        <span className="text-sm font-semibold">
          {destination ?? 'Your trip'} · {days.length} day{days.length === 1 ? '' : 's'}
        </span>
        {typeof estimatedCost === 'number' && (
          <span className="rounded bg-white/15 px-2 py-0.5 text-xs font-medium">
            Est. LKR {estimatedCost.toLocaleString()}
          </span>
        )}
      </div>
      <div className="divide-y divide-gray-100 bg-white">
        {days.map((day) => (
          <div key={day.day} className="flex items-start gap-3 px-4 py-3">
            <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-royal-100 text-xs font-bold text-royal-700">
              {day.day}
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-sm text-gray-800">
                {day.items?.map((item, i) => (
                  <span key={i}>
                    {i > 0 && <span className="mx-1 text-gray-300">→</span>}
                    {item.name}
                  </span>
                ))}
              </p>
              <span className="badge-success mt-1">
                <CheckCircle2 className="mr-1 h-3 w-3" /> Verified
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
