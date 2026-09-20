'use client'

// Local, persisted "backend" for everything that doesn't have a real API yet
// (saved itineraries, budget tracker, notifications, subscription, chat
// history, admin data). Auth is real: Keycloak via next-auth, see lib/auth.ts. Only the AI trip-planning call in lib/api.ts
// (`tripApi.planTrip`) hits the real FastAPI service — see ai-backend/main.py,
// which currently only exposes /api/plan-trip, /api/health, /api/rag/*.
//
// Every store below is written as a small service (read + mutate methods)
// backed by zustand's `persist` (localStorage) so the UI never talks to
// localStorage directly. When real endpoints exist, swap the body of these
// actions for API calls — component code will not need to change.

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { generateId } from './utils'
import type {
  ChatThread,
  ChatMessage,
  Expense,
  NotificationSettings,
  SavedItinerary,
  SubscriptionPlanId,
} from '@/types/app'

// ---------------------------------------------------------------------------
// Local preferences
// ---------------------------------------------------------------------------
//
// Identity is NOT here any more - it comes from Keycloak via next-auth
// (`useSession()` from 'next-auth/react'; helpers in lib/auth-client.ts).
// This store only keeps per-device preferences that have no server home yet.

interface PreferencesState {
  locationAccessEnabled: boolean
  toggleLocationAccess: () => void
}

export const usePreferencesStore = create<PreferencesState>()(
  persist(
    (set) => ({
      locationAccessEnabled: true,
      toggleLocationAccess: () => set((s) => ({ locationAccessEnabled: !s.locationAccessEnabled })),
    }),
    { name: 'sj-preferences' }
  )
)

// ---------------------------------------------------------------------------
// Saved itineraries
// ---------------------------------------------------------------------------

const seedItineraries: SavedItinerary[] = [
  {
    id: 'itin-kandy',
    title: '4 days in Kandy, mid-range budget',
    destination: 'Kandy',
    days: 4,
    dateRangeLabel: 'Nov 12 - 16',
    budget: 60000,
    currency: 'LKR',
    status: 'verified',
    tab: 'upcoming',
    createdAt: new Date().toISOString(),
    itineraryDays: [
      { day: 1, summary: 'Temple of the Tooth (early) → Kandy Lake walk', verified: true },
      { day: 2, summary: 'Royal Botanical Gardens → Tea factory tour', verified: true },
      { day: 3, summary: 'Knuckles foothills viewpoint (easy trail)', verified: true },
      { day: 4, summary: 'Local market → departure', verified: true },
    ],
  },
  {
    id: 'itin-galle',
    title: 'Family trip to Galle Fort',
    destination: 'Galle',
    days: 5,
    dateRangeLabel: 'Nov 12 - 16',
    budget: 30000,
    currency: 'LKR',
    status: 'in_progress',
    tab: 'upcoming',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'itin-sigiriya',
    title: 'Sigiriya Adventure',
    destination: 'Sigiriya',
    days: 5,
    dateRangeLabel: 'Nov 12 - 16',
    budget: 40000,
    currency: 'LKR',
    status: 'verified',
    tab: 'upcoming',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'itin-temple',
    title: '4 Days in Temple',
    destination: 'Kandy',
    days: 5,
    dateRangeLabel: 'Nov 12 - 16',
    budget: 35000,
    currency: 'LKR',
    status: 'in_progress',
    tab: 'upcoming',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'itin-ella',
    title: 'Ella View',
    destination: 'Ella',
    days: 5,
    dateRangeLabel: 'Nov 12 - 16',
    budget: 30000,
    currency: 'LKR',
    status: 'missing_hotel',
    tab: 'upcoming',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'itin-weekend-ella',
    title: 'Weekend in Ella — train times',
    destination: 'Ella',
    days: 2,
    dateRangeLabel: 'Not scheduled',
    budget: 20000,
    currency: 'LKR',
    status: 'draft',
    tab: 'drafts',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'itin-colombo-food',
    title: '3-day Colombo food itinerary',
    destination: 'Colombo',
    days: 3,
    dateRangeLabel: 'Sep 2 - 5',
    budget: 25000,
    currency: 'LKR',
    status: 'past',
    tab: 'past',
    createdAt: new Date().toISOString(),
  },
]

interface ItineraryState {
  itineraries: SavedItinerary[]
  addItinerary: (itinerary: Omit<SavedItinerary, 'id' | 'createdAt'>) => SavedItinerary
  updateItinerary: (id: string, patch: Partial<SavedItinerary>) => void
}

export const useItineraryStore = create<ItineraryState>()(
  persist(
    (set) => ({
      itineraries: seedItineraries,
      addItinerary: (itinerary) => {
        const created: SavedItinerary = {
          ...itinerary,
          id: generateId(),
          createdAt: new Date().toISOString(),
        }
        set((s) => ({ itineraries: [created, ...s.itineraries] }))
        return created
      },
      updateItinerary: (id, patch) =>
        set((s) => ({
          itineraries: s.itineraries.map((i) => (i.id === id ? { ...i, ...patch } : i)),
        })),
    }),
    { name: 'sj-itineraries' }
  )
)

// ---------------------------------------------------------------------------
// Budget tracker / expenses
// ---------------------------------------------------------------------------

const seedExpenses: Expense[] = [
  { id: 'exp-1', itineraryId: 'itin-kandy', date: 'Nov 12', description: 'Amaya Hills — 2 nights, twin room', category: 'Stays', day: 'Day 1', amountLKR: 16000 },
  { id: 'exp-2', itineraryId: 'itin-kandy', date: 'Nov 12', description: 'Tuk-tuk — airport to Temple of the Tooth', category: 'Transport', day: 'Day 1', amountLKR: 2400 },
  { id: 'exp-3', itineraryId: 'itin-kandy', date: 'Nov 13', description: 'Royal Botanical Gardens — entry, 3 pax', category: 'Activities', day: 'Day 2', amountLKR: 4500 },
  { id: 'exp-4', itineraryId: 'itin-kandy', date: 'Nov 13', description: 'Tea factory lunch set, 3 pax', category: 'Food & drink', day: 'Day 2', amountLKR: 5850 },
  { id: 'exp-5', itineraryId: 'itin-kandy', date: 'Nov 14', description: 'Knuckles foothills — driver & guide', category: 'Activities', day: 'Day 3', amountLKR: 7500 },
  { id: 'exp-6', itineraryId: 'itin-kandy', date: 'Nov 14', description: 'Dinner near Kandy Lake', category: 'Food & drink', day: 'Day 3', amountLKR: 5000 },
  { id: 'exp-7', itineraryId: 'itin-galle', date: 'Nov 12', description: 'Galle Fort guesthouse — 2 nights', category: 'Stays', day: 'Day 1', amountLKR: 18000 },
  { id: 'exp-8', itineraryId: 'itin-galle', date: 'Nov 13', description: 'Rampart walk & lighthouse snacks', category: 'Food & drink', day: 'Day 2', amountLKR: 6500 },
  { id: 'exp-9', itineraryId: 'itin-galle', date: 'Nov 13', description: 'Dutch museum entry, 4 pax', category: 'Activities', day: 'Day 2', amountLKR: 4000 },
  { id: 'exp-10', itineraryId: 'itin-sigiriya', date: 'Nov 12', description: 'Sigiriya Rock entry', category: 'Activities', day: 'Day 1', amountLKR: 13200 },
  { id: 'exp-11', itineraryId: 'itin-sigiriya', date: 'Nov 12', description: 'Village hotel — 1 night', category: 'Stays', day: 'Day 1', amountLKR: 6000 },
  { id: 'exp-12', itineraryId: 'itin-ella', date: 'Nov 12', description: 'Nine Arches Bridge tuk-tuk', category: 'Transport', day: 'Day 1', amountLKR: 3800 },
  { id: 'exp-13', itineraryId: 'itin-ella', date: 'Nov 13', description: 'Ella Rock hiking guide', category: 'Activities', day: 'Day 2', amountLKR: 8000 },
  { id: 'exp-14', itineraryId: 'itin-ella', date: 'Nov 14', description: 'Homestay — 3 nights (no hotel booked yet)', category: 'Stays', day: 'Day 3', amountLKR: 20000 },
]

interface ExpenseState {
  expenses: Expense[]
  addExpense: (expense: Omit<Expense, 'id'>) => void
}

export const useExpenseStore = create<ExpenseState>()(
  persist(
    (set) => ({
      expenses: seedExpenses,
      addExpense: (expense) =>
        set((s) => ({ expenses: [{ ...expense, id: generateId() }, ...s.expenses] })),
    }),
    { name: 'sj-expenses' }
  )
)

// ---------------------------------------------------------------------------
// Notifications
// ---------------------------------------------------------------------------

interface NotificationState extends NotificationSettings {
  setSetting: <K extends keyof NotificationSettings>(key: K, value: NotificationSettings[K]) => void
}

export const useNotificationStore = create<NotificationState>()(
  persist(
    (set) => ({
      tripReminders: true,
      weatherAlerts: true,
      budgetAlerts: true,
      pushNotifications: true,
      emailNotifications: false,
      notificationSound: true,
      volume: 65,
      setSetting: (key, value) => set({ [key]: value } as any),
    }),
    { name: 'sj-notifications' }
  )
)

// ---------------------------------------------------------------------------
// Subscription
// ---------------------------------------------------------------------------

interface SubscriptionState {
  planId: SubscriptionPlanId
  tripsUsedThisMonth: number
  setPlan: (planId: SubscriptionPlanId) => void
}

export const useSubscriptionStore = create<SubscriptionState>()(
  persist(
    (set) => ({
      planId: 'free',
      tripsUsedThisMonth: 2,
      setPlan: (planId) => set({ planId }),
    }),
    { name: 'sj-subscription' }
  )
)

// ---------------------------------------------------------------------------
// Chat threads (Home / planner)
// ---------------------------------------------------------------------------

const seedThreads: ChatThread[] = [
  {
    id: 'thread-kandy',
    title: '4 days in Kandy, mid-range budget',
    linkedItineraryId: 'itin-kandy',
    createdAt: new Date().toISOString(),
    messages: [
      { id: 'm1', role: 'user', text: '4 days in Kandy, mid-range budget, traveling with my parents — no long hikes please.', createdAt: new Date().toISOString() },
      { id: 'm2', role: 'assistant', text: "Got it — four easy-paced days, mid-range budget, nothing strenuous. Pulling only from verified Kandy listings. Here's a first draft, saved to your itineraries.", createdAt: new Date().toISOString(), quickActions: ['Show budget breakdown', 'Swap day 3 for something else', 'Add a restaurant near the lake'] },
    ],
  },
  { id: 'thread-sigiriya-day', title: 'Is Sigiriya doable in a day trip?', createdAt: new Date().toISOString(), messages: [] },
  { id: 'thread-ella-train', title: 'Weekend in Ella — train times', createdAt: new Date().toISOString(), messages: [] },
  { id: 'thread-galle', title: 'Family trip to Galle Fort', linkedItineraryId: 'itin-galle', createdAt: new Date().toISOString(), messages: [] },
  { id: 'thread-mirissa', title: 'Budget stays near Mirissa', createdAt: new Date().toISOString(), messages: [] },
  { id: 'thread-nuwara', title: 'Rainy season — Nuwara Eliya or not?', createdAt: new Date().toISOString(), messages: [] },
  { id: 'thread-colombo-food', title: '3-day Colombo food itinerary', createdAt: new Date().toISOString(), messages: [] },
  { id: 'thread-yala', title: 'Yala safari + Tissamaharama stay', createdAt: new Date().toISOString(), messages: [] },
  { id: 'thread-jaffna', title: 'Solo trip, Jaffna, 5 days', createdAt: new Date().toISOString(), messages: [] },
]

interface ChatState {
  threads: ChatThread[]
  activeThreadId: string | null
  setActiveThread: (id: string | null) => void
  createThread: (firstMessage: string) => ChatThread
  addMessage: (threadId: string, message: Omit<ChatMessage, 'id' | 'createdAt'>) => void
}

export const useChatStore = create<ChatState>()(
  persist(
    (set, get) => ({
      threads: seedThreads,
      activeThreadId: 'thread-kandy',
      setActiveThread: (id) => set({ activeThreadId: id }),
      createThread: (firstMessage) => {
        const thread: ChatThread = {
          id: generateId(),
          title: firstMessage.length > 48 ? firstMessage.slice(0, 48) + '…' : firstMessage,
          messages: [],
          createdAt: new Date().toISOString(),
        }
        set((s) => ({ threads: [thread, ...s.threads], activeThreadId: thread.id }))
        return thread
      },
      addMessage: (threadId, message) =>
        set((s) => ({
          threads: s.threads.map((t) =>
            t.id === threadId
              ? {
                  ...t,
                  messages: [
                    ...t.messages,
                    { ...message, id: generateId(), createdAt: new Date().toISOString() },
                  ],
                }
              : t
          ),
        })),
    }),
    { name: 'sj-chat' }
  )
)
