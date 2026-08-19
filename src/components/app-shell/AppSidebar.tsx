'use client'

import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation'
import { useMemo, useState } from 'react'
import {
  Plus,
  Search,
  Bookmark,
  Calendar,
  DollarSign,
  Settings,
  PanelLeft,
  ChevronLeft,
} from 'lucide-react'
import { Plane } from 'lucide-react'
import { useAuthStore, useChatStore } from '@/lib/store'
import { cn } from '@/lib/utils'

const NAV = [
  { href: '/explore', label: 'Explore', icon: Bookmark },
  { href: '/saved-itineraries', label: 'Saved itineraries', icon: Calendar },
  { href: '/budget-tracker', label: 'Budget tracker', icon: DollarSign },
]

export function AppSidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const { threads, activeThreadId, setActiveThread, createThread } = useChatStore()
  const user = useAuthStore((s) => s.user)
  const [query, setQuery] = useState('')
  const [collapsed, setCollapsed] = useState(false)

  const filtered = useMemo(
    () => threads.filter((t) => t.title.toLowerCase().includes(query.toLowerCase())),
    [threads, query]
  )
  const today = filtered.slice(0, 2)
  const previous7 = filtered.slice(2, 6)
  const earlier = filtered.slice(6)

  function openThread(id: string) {
    setActiveThread(id)
    router.push('/home')
  }

  function newTrip() {
    const thread = createThread('New trip')
    router.push('/home')
    return thread
  }

  if (collapsed) {
    return (
      <div className="flex h-screen w-16 flex-col items-center border-r border-gray-100 bg-white py-4">
        <button onClick={() => setCollapsed(false)} className="rounded-lg p-2 text-royal-700 hover:bg-royal-50" aria-label="Expand sidebar">
          <PanelLeft className="h-5 w-5" />
        </button>
        <Plane className="mt-6 h-6 w-6 rotate-45 text-royal-700" />
      </div>
    )
  }

  return (
    <aside className="flex h-screen w-72 shrink-0 flex-col border-r border-gray-100 bg-white">
      <div className="flex items-center justify-between px-4 pt-4">
        <Link href="/home" className="flex items-center gap-2">
          <Plane className="h-5 w-5 rotate-45 text-royal-700" />
          <span className="font-display text-base font-bold text-gray-900">SmartJourney</span>
        </Link>
        <button
          onClick={() => setCollapsed(true)}
          className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
          aria-label="Collapse sidebar"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
      </div>

      <div className="px-4 pt-4">
        <button
          onClick={newTrip}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-royal-700 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-royal-800"
        >
          <Plus className="h-4 w-4" /> New trip
        </button>
        <div className="relative mt-3">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-berry-400" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search your trips"
            className="w-full rounded-xl border border-berry-100 bg-berry-50/60 py-2.5 pl-9 pr-3 text-sm text-gray-700 placeholder-berry-400/80 focus:border-royal-400 focus:outline-none focus:ring-2 focus:ring-royal-200"
          />
        </div>
      </div>

      <nav className="mt-4 space-y-0.5 px-3">
        {NAV.map((item) => {
          const active = pathname === item.href
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition',
                active ? 'bg-royal-50 text-royal-800' : 'text-gray-600 hover:bg-gray-50'
              )}
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </Link>
          )
        })}
      </nav>

      <div className="mt-5 flex-1 space-y-5 overflow-y-auto px-3 pb-3 text-sm">
        <TripGroup title="Today" items={today} activeId={activeThreadId} onSelect={openThread} />
        <TripGroup title="Previous 7 days" items={previous7} activeId={activeThreadId} onSelect={openThread} />
        <TripGroup title="Earlier" items={earlier} activeId={activeThreadId} onSelect={openThread} />
      </div>

      <div className="border-t border-gray-100 px-4 py-3">
        <Link href="/explore" className="mb-3 flex items-center gap-1 text-xs text-gray-400 hover:text-gray-600">
          <ChevronLeft className="h-3 w-3" /> Back to overview
        </Link>
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-gradient text-xs font-bold text-white">
            {user?.avatarInitials ?? 'ST'}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-gray-900">{user?.username ?? 'Guest'}</p>
            <p className="truncate text-xs text-gray-400">Traveler account</p>
          </div>
          <Link href="/account" className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600" aria-label="Settings">
            <Settings className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </aside>
  )
}

function TripGroup({
  title,
  items,
  activeId,
  onSelect,
}: {
  title: string
  items: { id: string; title: string }[]
  activeId: string | null
  onSelect: (id: string) => void
}) {
  if (items.length === 0) return null
  return (
    <div>
      <p className="mb-1.5 px-3 text-[11px] font-semibold uppercase tracking-wide text-gray-400">{title}</p>
      <div className="space-y-0.5">
        {items.map((item) => (
          <button
            key={item.id}
            onClick={() => onSelect(item.id)}
            className={cn(
              'block w-full truncate rounded-lg px-3 py-1.5 text-left transition',
              activeId === item.id ? 'bg-berry-50 text-berry-700 font-medium' : 'text-gray-600 hover:bg-gray-50'
            )}
            title={item.title}
          >
            {item.title}
          </button>
        ))}
      </div>
    </div>
  )
}
