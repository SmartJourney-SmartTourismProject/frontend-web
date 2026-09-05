'use client';

import dynamic from 'next/dynamic';
import { ChatPanel } from '@/components/shell/ChatPanel';

// Leaflet touches `window` at import time, which breaks SSR/build - loaded
// client-only, same as any Leaflet usage in a Next.js app.
const RouteMapPanel = dynamic(
  () => import('@/components/shell/RouteMapPanel').then((m) => m.RouteMapPanel),
  { ssr: false },
);

export default function HomePage() {
  return (
    <div className="flex h-full">
      <div className="flex-1 border-r border-gray-100">
        <ChatPanel />
      </div>
      <div className="w-[480px] shrink-0">
        <RouteMapPanel />
      </div>
    </div>
  );
}
