// Types for the parts of the product that don't have a real backend yet
// (auth, saved itineraries, budget tracker, notifications, subscription, admin).
// The AI trip-planning flow (see lib/api.ts `tripApi.planTrip`) is the one
// feature wired to the real FastAPI service in ai-backend/main.py.
//
// Everything here is shaped the way a REST resource would look so that
// lib/store.ts can be swapped from localStorage persistence to real API
// calls later without touching the components that consume it.

export interface AppUser {
  id: string
  username: string
  email: string
  phone?: string
  avatarInitials: string
  accountType: 'Traveler account' | 'Platform admin'
  locationAccessEnabled: boolean
  passwordLastChangedLabel: string
  createdAt: string
}

export type ItineraryStatus = 'in_progress' | 'verified' | 'missing_hotel' | 'draft' | 'past'
export type ItineraryTab = 'upcoming' | 'drafts' | 'past'

export interface ItineraryDayItem {
  time?: string
  title: string
  verified?: boolean
}

export interface ItineraryDay {
  day: number
  summary: string
  verified?: boolean
}

export interface SavedItinerary {
  id: string
  title: string
  destination: string
  days: number
  dateRangeLabel: string
  budget: number
  currency: string
  status: ItineraryStatus
  tab: ItineraryTab
  coverImage?: string
  itineraryDays?: ItineraryDay[]
  createdAt: string
}

export interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  text: string
  createdAt: string
  quickActions?: string[]
  itineraryPreview?: {
    destination?: string
    estimatedCost?: number | null
    days: import('./trip').ItineraryItem[]
  }
}

export interface ChatThread {
  id: string
  title: string
  messages: ChatMessage[]
  linkedItineraryId?: string
  createdAt: string
}

export type ExpenseCategory = 'Stays' | 'Food & drink' | 'Activities' | 'Transport'

export interface Expense {
  id: string
  itineraryId: string
  date: string
  description: string
  category: ExpenseCategory
  day: string
  amountLKR: number
}

export type SubscriptionPlanId = 'free' | 'lite' | 'pro'

export interface NotificationSettings {
  tripReminders: boolean
  weatherAlerts: boolean
  budgetAlerts: boolean
  pushNotifications: boolean
  emailNotifications: boolean
  notificationSound: boolean
  volume: number
}

export interface AdminListing {
  id: string
  name: string
  district: string
  category: string
  status: 'Verified' | 'Pending' | 'Flagged'
  addedLabel: string
  type: 'attraction' | 'restaurant' | 'event' | 'travel_option'
}

export interface VerificationQueueItem {
  id: string
  name: string
  meta: string
  type: 'restaurant' | 'event' | 'attraction' | 'travel_option'
}
