import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { ItineraryDay, StartLocation } from './types';

interface TripState {
  sessionId: string | null;
  itinerary: ItineraryDay[];
  destination: string | null;
  estimatedCost: number | null;
  currency: string;
  /** Departure point for the current plan, when the traveler gave one. */
  startLocation: StartLocation | null;
  // Bumped whenever a session is created/renamed so AppSidebar's chat-history
  // list knows to refetch, without wiring a prop callback through the layout.
  sessionsVersion: number;
  setSessionId: (id: string | null) => void;
  setPlan: (plan: {
    itinerary: ItineraryDay[];
    destination: string | null;
    estimatedCost: number | null;
    currency: string;
    startLocation: StartLocation | null;
  }) => void;
  bumpSessionsVersion: () => void;
  reset: () => void;
}

// Shared between ChatPanel and RouteMapPanel (siblings under the Home page) -
// the chat is what produces a plan, the map just renders whatever the
// current plan is, so they need one source of truth rather than prop
// drilling through the page.
//
// sessionId is persisted to localStorage (via partialize below) so a hard
// refresh can restore "which chat was I just in" - without it, a reload
// left ChatPanel with no session to restore from at all, even though the
// message/plan data itself was correctly saved server-side. Everything
// else here is intentionally NOT persisted - it's always refetched fresh
// from the server (see ChatPanel's session-restore effect) rather than
// risking a stale itinerary sitting in localStorage.
export const useTripStore = create<TripState>()(
  persist(
    (set) => ({
      sessionId: null,
      itinerary: [],
      destination: null,
      estimatedCost: null,
      currency: 'LKR',
      startLocation: null,
      sessionsVersion: 0,
      setSessionId: (id) => set({ sessionId: id }),
      setPlan: ({ itinerary, destination, estimatedCost, currency, startLocation }) =>
        set({ itinerary, destination, estimatedCost, currency, startLocation }),
      bumpSessionsVersion: () => set((s) => ({ sessionsVersion: s.sessionsVersion + 1 })),
      reset: () =>
        set({
          sessionId: null,
          itinerary: [],
          destination: null,
          estimatedCost: null,
          currency: 'LKR',
          startLocation: null,
        }),
    }),
    {
      name: 'smartjourney-trip-store',
      partialize: (state) => ({ sessionId: state.sessionId }),
    },
  ),
);
