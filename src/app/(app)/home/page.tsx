'use client'

import { ChatPanel } from '@/components/app-shell/ChatPanel'
import { RouteMapPanel } from '@/components/app-shell/RouteMapPanel'

export default function HomePage() {
  return (
    <div className="flex h-full">
      <ChatPanel />
      <div className="w-[420px] shrink-0 border-l border-gray-100">
        <RouteMapPanel />
      </div>
    </div>
  )
}
