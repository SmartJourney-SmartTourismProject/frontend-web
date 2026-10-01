'use client';

import dynamic from 'next/dynamic';
import { useEffect, useState } from 'react';
import { Map as MapIcon, PanelRightClose } from 'lucide-react';
import { ChatPanel } from '@/components/shell/ChatPanel';
import { SplitPane } from '@/components/shell/SplitPane';

// Leaflet touches `window` at import time, which breaks SSR/build - loaded
// client-only, same as any Leaflet usage in a Next.js app.
const RouteMapPanel = dynamic(
  () => import('@/components/shell/RouteMapPanel').then((m) => m.RouteMapPanel),
  { ssr: false },
);

const MAP_OPEN_KEY = 'sj.map.open';

export default function HomePage() {
  const [mapOpen, setMapOpen] = useState(true);

  // Read after mount, not during render: localStorage does not exist on the
  // server, and seeding initial state from it would desync the markup.
  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(MAP_OPEN_KEY);
      if (saved !== null) setMapOpen(saved === '1');
    } catch {
      // Blocked storage just means the map starts open, which is the default.
    }
  }, []);

  const toggleMap = () => {
    setMapOpen((open) => {
      const next = !open;
      try {
        window.localStorage.setItem(MAP_OPEN_KEY, next ? '1' : '0');
      } catch {
        // Not worth surfacing; the toggle still works for this session.
      }
      return next;
    });
  };

  return (
    <div className="relative h-full overflow-hidden">
      <SplitPane rightOpen={mapOpen} left={<ChatPanel centered={!mapOpen} />} right={<RouteMapPanel />} />

      <button
        onClick={toggleMap}
        title={mapOpen ? 'Hide map' : 'Show map'}
        aria-label={mapOpen ? 'Hide map' : 'Show map'}
        aria-pressed={mapOpen}
        // Pinned to the top-right of the whole area rather than to the
        // divider: the divider now moves, and a control that slides around
        // as you drag is hard to aim at. z-[1100] clears Leaflet's own
        // stacking context, whose controls reach z-index 1000.
        className="absolute right-4 top-4 z-[1100] flex h-9 items-center gap-2 rounded-full border border-gray-200 bg-white px-3 text-xs font-medium text-gray-700 shadow-md transition hover:bg-gray-50"
      >
        {mapOpen ? <PanelRightClose className="h-4 w-4" /> : <MapIcon className="h-4 w-4" />}
        <span>{mapOpen ? 'Hide map' : 'Show map'}</span>
      </button>
    </div>
  );
}
