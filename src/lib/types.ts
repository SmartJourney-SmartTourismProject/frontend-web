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
  // Only set on assistant messages that carried an actual itinerary - lets
  // the itinerary summary card be rebuilt after a reload/session switch
  // instead of only showing the rendered text.
  plan: TripPlanResponse | null;
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

export interface Category {
  id: string;
  name: string;
}

/** tag_vocabulary row - the only values travel_interests may contain. */
export interface Tag {
  tag: string;
  label: string;
  is_outdoor: boolean;
}

export type TravelStyle = 'budget' | 'balanced' | 'luxury';

/** traveler_profile - what the AI backend reads to default a trip request. */
export interface UserPreferences {
  travel_interests: string[];
  travel_style: TravelStyle | null;
  default_budget: number | null;
  currency: string;
  updated_at: string | null;
}

export interface UpdatePreferencesPayload {
  travel_interests?: string[];
  travel_style?: TravelStyle | null;
  default_budget?: number | null;
  currency?: string;
}

/** GET /users/me. name/email are Keycloak's (edited in its account console). */
export interface Me {
  id: string;
  email: string;
  name: string | null;
  phone: string | null;
  role: 'traveler' | 'admin';
  email_verified: boolean;
  location_enabled: boolean;
  created_at: string;
  preferences: UserPreferences;
}

/** Admin moderation state, derived server-side from (is_verified, is_active). */
export type ModerationState = 'pending' | 'approved' | 'rejected';

export interface AdminStats {
  users: { travelers: number; admins: number; total: number };
  itineraries: number;
  chat_sessions: number;
  listings: { pending: number; approved: number };
  events: { pending: number; approved: number };
  pending_verifications: number;
}

export interface AdminListing extends Listing {
  state: ModerationState;
  is_verified: boolean;
  is_active: boolean;
  source: string;
  created_at: string;
}

export interface AdminEvent extends ExploreEvent {
  state: ModerationState;
  is_verified: boolean;
  is_active: boolean;
  source: string;
}

export interface AdminUser {
  id: string;
  email: string;
  name: string | null;
  phone: string | null;
  role: 'traveler' | 'admin';
  is_active: boolean;
  email_verified: boolean;
  location_enabled: boolean;
  created_at: string;
  updated_at: string;
  /** false for rows that predate Keycloak (the seeded demo user) - role and
   *  status cannot be changed for those, because there is no account to change. */
  managed: boolean;
  _count?: { itinerary: number; chat_session: number };
}

export interface AdminActivity {
  id: string;
  user_id: string | null;
  action: string;
  detail: Record<string, unknown> | null;
  created_at: string;
}

export interface Paginated<T> {
  items: T[];
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

export interface ModerationQuery {
  status?: ModerationState;
  district?: string;
  category?: string;
  q?: string;
  page?: number;
}

export interface UpdateMePayload {
  phone?: string | null;
  location_enabled?: boolean;
}

export interface ListingImage {
  id: string;
  listing_id: string;
  url: string;
  caption: string | null;
  attribution: string | null;
}

// Mirrors backend/src/explore/explore.service.ts's travel_listing shape.
export interface Listing {
  id: string;
  district_id: string;
  category_id: string;
  name: string;
  description: string | null;
  latitude: number | null;
  longitude: number | null;
  tags: string[];
  price_level: number | null;
  price_per_night: string | null;
  currency: string;
  rating: string | null;
  rating_count: number;
  photo_url: string | null;
  is_verified: boolean;
  category: Category;
  district: District;
  listing_image: ListingImage[];
}

export interface PaginatedListings {
  items: Listing[];
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

export interface ListingsQuery {
  district?: string;
  category?: string;
  q?: string;
  minRating?: number;
  page?: number;
}

export type TripStatus = 'draft' | 'upcoming' | 'past';

export interface SaveTripPayload {
  title?: string;
  destination?: string;
  travelers?: number;
  budget?: number;
  estimated_cost?: number;
  currency?: string;
  itinerary: {
    day: number;
    date?: string | null;
    items: {
      time?: string | null;
      type: string;
      name: string;
      notes?: string | null;
      lat: number;
      lon: number;
    }[];
  }[];
}

export interface Trip {
  id: string;
  user_id: string;
  district_id: string | null;
  title: string | null;
  start_date: string | null;
  end_date: string | null;
  travelers: number;
  budget: string | null;
  estimated_cost: string | null;
  currency: string;
  status: TripStatus;
  created_at: string;
  updated_at: string;
  district: District | null;
}

export interface TripItineraryItem {
  id: string;
  itinerary_day_id: string;
  listing_id: string | null;
  event_id: string | null;
  item_type: string;
  name: string;
  latitude: number | null;
  longitude: number | null;
  start_time: string | null;
  end_time: string | null;
  est_cost: string | null;
  order_index: number;
  notes: string | null;
}

export interface TripItineraryDay {
  id: string;
  itinerary_id: string;
  day_number: number;
  date: string | null;
  itinerary_item: TripItineraryItem[];
}

export interface TripDetail extends Trip {
  itinerary_day: TripItineraryDay[];
}

export interface ExploreEvent {
  id: string;
  district_id: string;
  name: string;
  description: string | null;
  start_datetime: string;
  end_datetime: string | null;
  venue_name: string | null;
  latitude: number | null;
  longitude: number | null;
  tags: string[];
  district: District;
}

// Mirrors backend/src/budget's shapes.
export interface Expense {
  id: string;
  itinerary_id: string;
  category: string;
  amount: string;
  currency: string;
  description: string | null;
  occurred_at: string;
  created_at: string;
}

export interface CreateExpensePayload {
  category: string;
  amount: number;
  currency?: string;
  description?: string;
  occurred_at?: string;
}

export interface CategoryBreakdown {
  category: string;
  amount: number;
  percentage: number;
}

export interface TripBudget {
  trip: {
    id: string;
    title: string | null;
    budget: number | null;
    estimated_cost: number | null;
    currency: string;
  };
  total: number | null;
  spent: number;
  remaining: number | null;
  daily_average: number;
  planned_days: number;
  status: 'on_track' | 'watch' | 'over_budget' | 'no_budget';
  by_category: CategoryBreakdown[];
}

export interface TripBudgetSummary {
  id: string;
  title: string | null;
  budget: number | null;
  currency: string;
  spent: number;
  status: 'on_track' | 'watch' | 'over_budget' | 'no_budget';
}
