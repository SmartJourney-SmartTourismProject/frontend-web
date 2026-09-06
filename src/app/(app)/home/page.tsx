'use client';

import dynamic from 'next/dynamic';
import { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { ChatPanel } from '@/components/shell/ChatPanel';

// Leaflet touches `window` at import time, which breaks SSR/build - loaded
// client-only, same as any Leaflet usage in a Next.js app.
const RouteMapPanel = dynamic(
  () => import('@/components/shell/RouteMapPanel').then((m) => m.RouteMapPanel),
  { ssr: false },
);

export default function HomePage() {
  const [mapOpen, setMapOpen] = useState(true);

  return (
    <div className="relative flex h-full overflow-hidden">
      <div className="flex-1 border-r border-gray-100">
        <ChatPanel />
      </div>

      <div
        className={`shrink-0 overflow-hidden transition-[width] duration-300 ease-in-out ${
          mapOpen ? 'w-1/2' : 'w-0'
        }`}
      >
        <div className="h-full w-full min-w-[400px]">
          <RouteMapPanel />
        </div>
      </div>

      <button
        onClick={() => setMapOpen((v) => !v)}
        title={mapOpen ? 'Hide map' : 'Show map'}
        className="absolute top-4 z-10 flex h-9 w-9 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-600 shadow-md transition-[right] duration-300 ease-in-out hover:bg-gray-50"
        style={{ right: mapOpen ? 'calc(50% - 18px)' : '16px' }}
      >
        {mapOpen ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
      </button>
    </div>
  );
}
