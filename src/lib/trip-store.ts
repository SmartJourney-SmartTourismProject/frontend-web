import { create } from 'zustand';
import type { ItineraryDay } from './types';

interface TripState {
  sessionId: string | null;
  itinerary: ItineraryDay[];
  destination: string | null;
  estimatedCost: number | null;
  currency: string;
  // Bumped whenever a session is created/renamed so AppSidebar's chat-history
  // list knows to refetch, without wiring a prop callback through the layout.
  sessionsVersion: number;
  setSessionId: (id: string | null) => void;
  setPlan: (plan: {
    itinerary: ItineraryDay[];
    destination: string | null;
    estimatedCost: number | null;
    currency: string;
  }) => void;
  bumpSessionsVersion: () => void;
  reset: () => void;
}

// Shared between ChatPanel and RouteMapPanel (siblings under the Home page) -
// the chat is what produces a plan, the map just renders whatever the
// current plan is, so they need one source of truth rather than prop
// drilling through the page.
export const useTripStore = create<TripState>((set) => ({
  sessionId: null,
  itinerary: [],
  destination: null,
  estimatedCost: null,
  currency: 'LKR',
  sessionsVersion: 0,
  setSessionId: (id) => set({ sessionId: id }),
  setPlan: ({ itinerary, destination, estimatedCost, currency }) =>
    set({ itinerary, destination, estimatedCost, currency }),
  bumpSessionsVersion: () => set((s) => ({ sessionsVersion: s.sessionsVersion + 1 })),
  reset: () =>
    set({ sessionId: null, itinerary: [], destination: null, estimatedCost: null, currency: 'LKR' }),
}));
