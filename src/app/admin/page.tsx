'use client'

import { useState } from 'react'
import { Search, Bell, Users2, Navigation2, HelpCircle, DollarSign, Check, X, Plus, Pencil, Trash2 } from 'lucide-react'
import { AdminSidebar } from '@/components/admin/AdminSidebar'
import { useAuthStore } from '@/lib/store'
import { cn } from '@/lib/utils'
import type { AdminListing, VerificationQueueItem } from '@/types/app'

const WEEKLY = [
  { day: 'Mon', value: 58 },
  { day: 'Tue', value: 72 },
  { day: 'Wed', value: 46 },
  { day: 'Thu', value: 80 },
  { day: 'Fri', value: 63 },
  { day: 'Sat', value: 91 },
  { day: 'Sun', value: 69 },
]

const QUEUE: VerificationQueueItem[] = [
  { id: 'q1', name: 'The Copper Kettle', meta: 'Restaurant · Kandy', type: 'restaurant' },
  { id: 'q2', name: 'Galle Lantern Festival', meta: 'Event · Galle · Nov 12–14', type: 'event' },
  { id: 'q3', name: 'Ella Rock viewpoint', meta: 'Attraction · Ella', type: 'attraction' },
  { id: 'q4', name: 'Highland Express transfers', meta: 'Travel option · Nuwara Eliya', type: 'travel_option' },
]

const TABS = ['Attractions', 'Restaurants', 'Events', 'Travel options'] as const

const LISTINGS: Record<(typeof TABS)[number], AdminListing[]> = {
  Attractions: [
    { id: 'a1', name: 'Temple of the Tooth', district: 'Kandy', category: 'Cultural site', status: 'Verified', addedLabel: 'Added 2 years ago', type: 'attraction' },
    { id: 'a2', name: 'Ella Rock', district: 'Badulla', category: 'Hiking / viewpoint', status: 'Pending', addedLabel: 'Added 8 months ago', type: 'attraction' },
    { id: 'a3', name: 'Royal Botanical Gardens', district: 'Kandy', category: 'Park & garden', status: 'Verified', addedLabel: 'Added 1 year ago', type: 'attraction' },
    { id: 'a4', name: 'Galle Fort', district: 'Galle', category: 'Heritage site', status: 'Flagged', addedLabel: 'Added 2 years ago', type: 'attraction' },
  ],
  Restaurants: [
    { id: 'r1', name: 'The Copper Kettle', district: 'Kandy', category: 'Sri Lankan', status: 'Pending', addedLabel: 'Added 2 days ago', type: 'restaurant' },
    { id: 'r2', name: 'Ministry of Crab', district: 'Colombo', category: 'Seafood', status: 'Verified', addedLabel: 'Added 3 years ago', type: 'restaurant' },
  ],
  Events: [
    { id: 'e1', name: 'Kandy Esala Perahera', district: 'Kandy', category: 'Cultural festival', status: 'Verified', addedLabel: 'Added 1 year ago', type: 'event' },
    { id: 'e2', name: 'Galle Lantern Festival', district: 'Galle', category: 'Festival', status: 'Pending', addedLabel: 'Added 1 week ago', type: 'event' },
  ],
  'Travel options': [
    { id: 't1', name: 'Highland Express transfers', district: 'Nuwara Eliya', category: 'Private transfer', status: 'Pending', addedLabel: 'Added 3 days ago', type: 'travel_option' },
  ],
}

const STATUS_STYLE: Record<AdminListing['status'], string> = {
  Verified: 'badge-success',
  Pending: 'badge bg-amber-100 text-amber-700',
  Flagged: 'badge bg-red-100 text-red-700',
}

export default function AdminPage() {
  const user = useAuthStore((s) => s.user)
  const [tab, setTab] = useState<(typeof TABS)[number]>('Attractions')
  const maxValue = Math.max(...WEEKLY.map((d) => d.value))

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      <AdminSidebar />
      <div className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-6xl px-8 py-8">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h1 className="font-display text-3xl font-bold text-gray-900">Dashboard</h1>
              <p className="mt-1 text-sm text-gray-500">Curated data &amp; platform overview</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm text-gray-400 shadow-sm">
                <Search className="h-4 w-4" /> Search listings, users…
              </div>
              <button className="relative flex h-9 w-9 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-500" aria-label="Notifications">
                <Bell className="h-4 w-4" />
                <span className="absolute right-1.5 top-1.5 h-1.5 w-1.5 rounded-full bg-berry-500" />
              </button>
              <div className="flex items-center gap-2 rounded-full border border-gray-200 bg-white px-2 py-1">
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-brand-gradient text-[11px] font-bold text-white">
                  {user?.avatarInitials ?? 'ST'}
                </div>
                <span className="pr-1 text-sm font-medium text-gray-700">{user?.username ?? 'STT'}</span>
              </div>
            </div>
          </div>

          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <AdminStat icon={Users2} label="Registered travelers" value="12,480" trend="+8.2%" />
            <AdminStat icon={Navigation2} label="Itineraries generated (30d)" value="3,215" trend="+14.6%" />
            <AdminStat icon={HelpCircle} label="Listings pending verification" value="19" trend="Needs review" trendTone="neutral" />
            <AdminStat icon={DollarSign} label="Provider subscription revenue" value="LKR 940,000" trend="+3.1%" />
          </div>

          <div className="mt-6 grid gap-6 lg:grid-cols-[1.5fr_1fr]">
            <div className="card p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="font-semibold text-gray-900">Itineraries generated</h2>
                  <p className="text-xs text-gray-400">Agentic AI planning requests, last 7 days</p>
                </div>
                <button className="text-sm font-semibold text-royal-700 hover:underline">View report</button>
              </div>
              <div className="mt-6 flex items-end gap-4 px-2">
                {WEEKLY.map((d) => (
                  <div key={d.day} className="flex flex-1 flex-col items-center gap-2">
                    <div
                      className="w-full rounded-t-lg bg-brand-gradient"
                      style={{ height: `${(d.value / maxValue) * 140}px` }}
                    />
                    <span className="text-xs text-gray-400">{d.day}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="card p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="font-semibold text-gray-900">Verification queue</h2>
                  <p className="text-xs text-gray-400">New provider submissions</p>
                </div>
                <button className="text-sm font-semibold text-royal-700 hover:underline">See all</button>
              </div>
              <div className="mt-4 space-y-1">
                {QUEUE.map((item) => (
                  <div key={item.id} className="flex items-center justify-between rounded-xl px-2 py-2.5 hover:bg-gray-50">
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-royal-50 text-royal-700">
                        <HelpCircle className="h-4 w-4" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-gray-900">{item.name}</p>
                        <p className="text-xs text-gray-400">{item.meta}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <button className="flex h-7 w-7 items-center justify-center rounded-full border border-gray-200 text-green-600 hover:bg-green-50" aria-label="Approve">
                        <Check className="h-3.5 w-3.5" />
                      </button>
                      <button className="flex h-7 w-7 items-center justify-center rounded-full border border-gray-200 text-red-500 hover:bg-red-50" aria-label="Reject">
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="card mt-6 p-6">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <h2 className="font-semibold text-gray-900">Content management</h2>
                <p className="text-xs text-gray-400">Everything the Agentic AI System is allowed to recommend from</p>
              </div>
              <button className="flex items-center gap-1.5 rounded-xl bg-berry-500 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-berry-600">
                <Plus className="h-4 w-4" /> Add listing
              </button>
            </div>

            <div className="mt-5 flex gap-1 rounded-xl bg-gray-100 p-1 sm:w-fit">
              {TABS.map((t) => (
                <button
                  key={t}
                  onClick={() => setTab(t)}
                  className={cn(
                    'rounded-lg px-4 py-1.5 text-sm font-semibold transition',
                    tab === t ? 'bg-white text-royal-800 shadow-sm' : 'text-gray-500 hover:text-gray-700'
                  )}
                >
                  {t}
                </button>
              ))}
            </div>

            <div className="mt-4 overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-gray-100 text-xs uppercase tracking-wide text-gray-400">
                    <th className="py-2 font-medium">Name</th>
                    <th className="py-2 font-medium">District</th>
                    <th className="py-2 font-medium">Category</th>
                    <th className="py-2 font-medium">Status</th>
                    <th className="py-2 text-right font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {LISTINGS[tab].map((listing) => (
                    <tr key={listing.id} className="border-b border-gray-50">
                      <td className="py-3">
                        <p className="font-semibold text-gray-900">{listing.name}</p>
                        <p className="text-xs text-gray-400">{listing.addedLabel}</p>
                      </td>
                      <td className="py-3 text-gray-600">{listing.district}</td>
                      <td className="py-3 text-gray-600">{listing.category}</td>
                      <td className="py-3">
                        <span className={STATUS_STYLE[listing.status]}>{listing.status}</span>
                      </td>
                      <td className="py-3">
                        <div className="flex justify-end gap-2">
                          <button className="flex h-7 w-7 items-center justify-center rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50" aria-label="Edit">
                            <Pencil className="h-3.5 w-3.5" />
                          </button>
                          <button className="flex h-7 w-7 items-center justify-center rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50" aria-label="Delete">
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="mt-4 flex items-center justify-between text-xs text-gray-400">
              <span>Showing 1–{LISTINGS[tab].length} of {LISTINGS[tab].length} listings</span>
              <div className="flex gap-1">
                {[1, 2, 3].map((p) => (
                  <button
                    key={p}
                    className={cn(
                      'flex h-7 w-7 items-center justify-center rounded-lg text-xs font-semibold',
                      p === 1 ? 'bg-royal-800 text-white' : 'border border-gray-200 text-gray-500'
                    )}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function AdminStat({
  icon: Icon,
  label,
  value,
  trend,
  trendTone = 'positive',
}: {
  icon: React.ComponentType<{ className?: string }>
  label: string
  value: string
  trend: string
  trendTone?: 'positive' | 'neutral'
}) {
  return (
    <div className="card p-5">
      <div className="flex items-center justify-between">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-royal-50 text-royal-700">
          <Icon className="h-4 w-4" />
        </div>
        <span
          className={cn(
            'rounded-full px-2 py-0.5 text-[11px] font-semibold',
            trendTone === 'positive' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'
          )}
        >
          {trend}
        </span>
      </div>
      <p className="mt-4 text-2xl font-bold text-gray-900">{value}</p>
      <p className="mt-0.5 text-xs text-gray-400">{label}</p>
    </div>
  )
}
