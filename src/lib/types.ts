// Mirrors backend/src/chat and backend/src/trips response shapes, which in
// turn mirror ai-backend's documented /trip-plan contract
// (backend/docs/AI_BACKEND_ENDPOINTS.md). Kept loose (optional fields) where
// the live response carries more than the documented minimum - e.g. real
// itinerary items include listing_id/end_time/est_cost/day_cost that
// AI_BACKEND_ENDPOINTS.md's example doesn't show.

export interface ChatSession {
  id: string;
  user_id: string;
  ai_session_id: string | null;
  title: string | null;
  created_at: string;
  updated_at: string;
}

export interface ChatMessage {
  id: string;
  session_id: string;
  role: 'user' | 'assistant';
  content: string;
  created_at: string;
}

export interface ChatSessionWithMessages extends ChatSession {
  chat_message: ChatMessage[];
}

export interface ItineraryItem {
  time?: string | null;
  end_time?: string | null;
  type: string;
  name: string;
  notes?: string | null;
  lat: number;
  lon: number;
  listing_id?: string | null;
  est_cost?: number | null;
  currency?: string;
}

export interface ItineraryDay {
  day: number;
  date?: string | null;
  items: ItineraryItem[];
  day_cost?: number;
}

export interface TripPlanResponse {
  session_id: string;
  destination: string | null;
  itinerary: ItineraryDay[];
  estimated_cost: number | null;
  currency: string;
  budget_notes: string | null;
  plan_source: 'llm' | 'fallback' | null;
  data_freshness: string | null;
  weather: unknown;
  disaster: unknown;
  final_response: string | null;
  errors: string[];
  trace: Record<string, unknown>;
}

export interface District {
  id: string;
  name: string;
  province: string;
}
