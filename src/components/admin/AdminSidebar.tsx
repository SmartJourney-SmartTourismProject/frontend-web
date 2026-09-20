'use client'

import Link from 'next/link'
import {
  LayoutGrid,
  BarChart3,
  Layers,
  Coffee,
  CalendarDays,
  List,
  Users,
  Building2,
  Activity,
  Settings,
} from 'lucide-react'
import { Plane } from 'lucide-react'
import { useSession } from 'next-auth/react'
import { cn, initials } from '@/lib/utils'

const OVERVIEW = [
  { label: 'Dashboard', icon: LayoutGrid, active: true },
  { label: 'Analytics', icon: BarChart3 },
]

const CONTENT = [
  { label: 'Attractions', icon: Layers, count: 128 },
  { label: 'Restaurants', icon: Coffee, count: 64 },
  { label: 'Events', icon: CalendarDays, count: 37 },
  { label: 'Travel options', icon: List, count: 21 },
]

const PEOPLE = [
  { label: 'Users', icon: Users },
  { label: 'Content providers', icon: Building2 },
]

const SYSTEM = [
  { label: 'System monitoring', icon: Activity },
  { label: 'Settings', icon: Settings },
]

export function AdminSidebar() {
  const user = useSession().data?.user

  return (
    <aside className="flex h-screen w-64 shrink-0 flex-col bg-royal-900 text-white">
      <div className="flex items-center gap-2 px-5 pt-5">
        <Plane className="h-5 w-5 rotate-45" />
        <div>
          <p className="font-display text-base font-bold leading-tight">SmartJourney</p>
          <p className="text-[10px] uppercase tracking-wide text-royal-300">Admin Panel</p>
        </div>
      </div>

      <div className="mt-6 flex-1 space-y-6 overflow-y-auto px-4 pb-4 text-sm">
        <NavGroup title="Overview" items={OVERVIEW} />
        <NavGroup title="Content" items={CONTENT} />
        <NavGroup title="People" items={PEOPLE} />
        <NavGroup title="System" items={SYSTEM} />
      </div>

      <div className="border-t border-white/10 px-5 py-4">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-gradient text-xs font-bold">
            {initials(user?.name ?? user?.email)}
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold">{user?.name ?? user?.email ?? 'Admin'}</p>
            <p className="truncate text-xs text-royal-300">Platform admin</p>
          </div>
        </div>
      </div>
    </aside>
  )
}

function NavGroup({
  title,
  items,
}: {
  title: string
  items: { label: string; icon: React.ComponentType<{ className?: string }>; active?: boolean; count?: number }[]
}) {
  return (
    <div>
      <p className="mb-1.5 px-3 text-[10px] font-semibold uppercase tracking-wide text-royal-400">{title}</p>
      <div className="space-y-0.5">
        {items.map((item) => (
          <Link
            key={item.label}
            href="/admin"
            className={cn(
              'flex items-center justify-between rounded-lg px-3 py-2 font-medium transition',
              item.active ? 'bg-white text-royal-900' : 'text-royal-100 hover:bg-white/10'
            )}
          >
            <span className="flex items-center gap-2.5">
              <item.icon className="h-4 w-4" />
              {item.label}
            </span>
            {typeof item.count === 'number' && (
              <span
                className={cn(
                  'rounded-full px-2 py-0.5 text-[10px] font-bold',
                  item.active ? 'bg-royal-100 text-royal-800' : 'bg-white/10 text-royal-100'
                )}
              >
                {item.count}
              </span>
            )}
          </Link>
        ))}
      </div>
    </div>
  )
}
