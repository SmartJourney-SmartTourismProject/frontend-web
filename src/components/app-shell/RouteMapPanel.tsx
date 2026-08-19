'use client'

import { Navigation } from 'lucide-react'

export interface MapStop {
  label: string
  sublabel?: string
}

const DEFAULT_STOPS: MapStop[] = [
  { label: 'Temple of the Tooth', sublabel: 'Day 1' },
  { label: 'Royal Botanical Gardens', sublabel: 'Day 2' },
  { label: 'Knuckles foothills', sublabel: 'Day 3' },
  { label: 'Departure', sublabel: 'Day 4' },
]

const POSITIONS = [
  { x: 120, y: 90 },
  { x: 260, y: 190 },
  { x: 210, y: 340 },
  { x: 320, y: 470 },
]

export function RouteMapPanel({ stops = DEFAULT_STOPS, title }: { stops?: MapStop[]; title?: string }) {
  const points = stops.slice(0, 4).map((s, i) => ({ ...s, ...POSITIONS[i] }))
  const path = points.map((p) => `${p.x},${p.y}`).join(' ')

  return (
    <div className="relative hidden h-full w-full overflow-hidden bg-[#eef1e9] lg:block">
      <svg className="absolute inset-0 h-full w-full" viewBox="0 0 420 560" preserveAspectRatio="xMidYMid slice">
        <rect width="420" height="560" fill="#eef1ea" />
        {Array.from({ length: 14 }).map((_, i) => (
          <path
            key={i}
            d={`M${i * 32} 0 C ${i * 32 + 40} 140, ${i * 32 - 20} 340, ${i * 32 + 20} 560`}
            stroke="#dfe4d6"
            strokeWidth="1"
            fill="none"
          />
        ))}
        <circle cx="150" cy="260" r="150" fill="#cfe3f2" opacity="0.7" />
        {points.length > 1 && (
          <polyline points={path} fill="none" stroke="#6b1f7a" strokeWidth="4" strokeDasharray="1 10" strokeLinecap="round" />
        )}
        {points.map((p, i) => (
          <g key={i}>
            <circle cx={p.x} cy={p.y} r="14" fill={i === points.length - 1 ? '#c64d9e' : '#6b1f7a'} stroke="white" strokeWidth="3" />
            <text x={p.x} y={p.y + 4} textAnchor="middle" fontSize="11" fontWeight="700" fill="white">
              {i + 1}
            </text>
          </g>
        ))}
      </svg>

      {points.map((p, i) => (
        <div
          key={i}
          className="absolute w-40 -translate-x-1/2 translate-y-3 text-center"
          style={{ left: `${(p.x / 420) * 100}%`, top: `${(p.y / 560) * 100}%` }}
        >
          <p className="rounded-lg bg-white/90 px-2 py-1 text-xs font-semibold text-gray-800 shadow">{p.label}</p>
        </div>
      ))}

      <div className="absolute bottom-5 left-5 flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-semibold text-royal-700 shadow-lg">
        <Navigation className="h-4 w-4" /> Map View
      </div>
      {title && (
        <div className="absolute right-5 top-5 rounded-lg bg-white/90 px-3 py-1.5 text-xs font-medium text-gray-600 shadow">
          {title}
        </div>
      )}
    </div>
  )
}
