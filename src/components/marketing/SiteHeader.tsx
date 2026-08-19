'use client'

import Link from 'next/link'
import { Plane } from 'lucide-react'

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-white/10 bg-mist-500/90 backdrop-blur-sm">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3.5 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-2.5">
          <Plane className="h-6 w-6 rotate-45 text-white" strokeWidth={2.25} />
          <span className="font-display text-xl font-semibold text-white">SmartJourney</span>
        </Link>
        <div className="flex items-center gap-3">
          <Link
            href="/login"
            className="rounded-lg border border-white/70 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/10"
          >
            Log In
          </Link>
          <Link
            href="/signup"
            className="rounded-lg bg-brand-gradient px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:brightness-110"
          >
            Sign Up
          </Link>
        </div>
      </div>
    </header>
  )
}
