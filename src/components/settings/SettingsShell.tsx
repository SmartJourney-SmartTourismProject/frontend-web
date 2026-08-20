'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { User, CreditCard, Bell, X } from 'lucide-react'
import { Plane } from 'lucide-react'
import { useAuthStore } from '@/lib/store'
import { cn } from '@/lib/utils'

const NAV = [
  { href: '/account', label: 'Account', icon: User },
  { href: '/subscription', label: 'Subscription', icon: CreditCard },
  { href: '/notifications', label: 'Notifications', icon: Bell },
]

export function SettingsShell({
  title,
  subtitle,
  children,
}: {
  title: string
  subtitle: string
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const router = useRouter()
  const user = useAuthStore((s) => s.user)

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100 p-4 sm:p-8">
      <div className="flex w-full max-w-5xl overflow-hidden rounded-3xl bg-white shadow-2xl">
        <aside className="flex w-64 shrink-0 flex-col justify-between bg-royal-800 p-6 text-white">
          <div>
            <Link href="/home" className="mb-8 flex items-center gap-2">
              <Plane className="h-5 w-5 rotate-45" />
              <span className="font-display text-lg font-semibold">SmartJourney</span>
            </Link>
            <p className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-royal-300">Settings</p>
            <nav className="space-y-1">
              {NAV.map((item) => {
                const active = pathname === item.href
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      'flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm font-medium transition',
                      active ? 'bg-white text-royal-800' : 'text-royal-100 hover:bg-white/10'
                    )}
                  >
                    <item.icon className="h-4 w-4" />
                    {item.label}
                  </Link>
                )
              })}
            </nav>
          </div>
          <div className="border-t border-white/10 pt-4 text-xs text-royal-300">
            <p>Traveler account</p>
            <p>Signed in as {user?.username ?? 'Guest'}</p>
          </div>
        </aside>

        <div className="flex-1 p-8">
          <div className="flex items-start justify-between border-b border-gray-100 pb-5">
            <div>
              <h1 className="font-display text-2xl font-bold text-gray-900">{title}</h1>
              <p className="mt-1 text-sm text-gray-500">{subtitle}</p>
            </div>
            <button
              onClick={() => router.push('/home')}
              className="flex h-8 w-8 items-center justify-center rounded-full border border-gray-200 text-gray-500 hover:bg-gray-50"
              aria-label="Close settings"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          <div className="pt-6">{children}</div>
        </div>
      </div>
    </div>
  )
}
