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
  // Set when this message's plan has already been saved as a trip - lets the
  // chat card show "Saved" (and offer unsave) after a reload instead of
  // resetting to "Save itinerary" and allowing a duplicate save.
  saved_trip_id: string | null;
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
  /** Added by NestJS from travel_listing when the stop has a photo. */
  photo_url?: string | null;
  photo_attribution?: string | null;
}

export interface ItineraryDay {
  day: number;
  date?: string | null;
  items: ItineraryItem[];
  day_cost?: number;
}

export interface StartLocation {
  lat: number;
  lon: number;
  /** How the origin was determined; 'text' means the traveler named it. */
  source: 'gps' | 'ip' | 'text';
  /** Only set for a named origin ("from Galle"); a GPS/IP fix has none. */
  name?: string | null;
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
  /**
   * Where the trip departs from, when known. The itinerary only lists stops
   * at the destination, so this is what lets the map draw the leg into it.
   */
  start_location: StartLocation | null;
  final_response: string | null;
  /** RAG Q&A citations (ai-backend's app/rag/) - what a "question" or
   *  "both" intent turn's answer actually cited. Empty on a plain plan. */
  sources: TripSource[];
  errors: string[];
  trace: Record<string, unknown>;
  // Present on the response to POST /chat/sessions/:id/messages - the id of
  // the assistant chat_message this plan was persisted as. Passed back on
  // save so the trip can be linked to it (see SaveTripPayload).
  chat_message_id?: string;
}

export interface TripSource {
  title: string;
  url: string | null;
  section: string | null;
  license: string;
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

/** GET/PATCH /users/me/notification-settings. Email is off until the user
 * opts in; the three type switches decide which events get emailed. */
export interface NotificationSettings {
  trip_reminders: boolean;
  weather_alerts: boolean;
  budget_alerts: boolean;
  push_enabled: boolean;
  email_enabled: boolean;
  sound_enabled: boolean;
  sound_volume: number;
  updated_at: string | null;
}

export type UpdateNotificationSettingsPayload = Partial<Omit<NotificationSettings, 'updated_at'>>;

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
  /** Small inline image (data URL), or null to show initials. */
  avatar_url: string | null;
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
  entry_fees: { pending: number };
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

/** listing_entry_fee (db/migrations/0012): a scraped heritage-site ticket
 *  price awaiting review. Its own `status`, not the is_verified/is_active
 *  pair AdminListing/AdminEvent share - see AdminEntryFeesService. */
export interface AdminEntryFee {
  id: string;
  listing_id: string | null;
  site_name: string;
  foreign_adult: string | null;   // Prisma Decimal serializes as a string
  foreign_child: string | null;
  local_adult: string | null;
  currency: string;
  source: string;
  source_url: string | null;
  status: ModerationState;
  fetched_at: string;
  reviewed_at: string | null;
  reviewed_by: string | null;
  travel_listing: { id: string; name: string; district: { id: string; name: string } } | null;
}

// ---- Admin > AI models ---------------------------------------------------

export type LlmProvider = 'gemini' | 'groq' | 'openai' | 'anthropic';
/** Where a provider's API key comes from: saved in the admin panel, the server .env, or nowhere. */
export type LlmKeySource = 'db' | 'env' | 'none';

export interface LlmConfig {
  /** "<provider>:<model>", in order: first = main model, the rest = backups. */
  chain: string[];
  chain_source: 'db' | 'env';
  ai_backend_reachable: boolean;
  encryption_configured: boolean;
  providers: { provider: LlmProvider; source: LlmKeySource; last4: string | null; updated_at: string | null }[];
}

export type LlmTestStatus = 'ok' | 'quota' | 'auth' | 'not_found' | 'no_key' | 'error';

export interface LlmTestResult {
  spec: string;
  status: LlmTestStatus;
  message: string;
  latency_ms: number | null;
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

export interface AdminAnalytics {
  range: { from: string; days: number };
  trends: {
    itineraries: { day: string; count: number }[];
    chat_sessions: { day: string; count: number }[];
    signups: { day: string; count: number }[];
    moderation: { day: string; approved: number; rejected: number }[];
  };
  breakdowns: {
    listings_by_category: { label: string; count: number }[];
    listings_by_district: { label: string; count: number }[];
    itinerary_status: { label: string; count: number }[];
    top_planners: { label: string; count: number }[];
  };
  /** null while subscriptions are out of scope - see SRS §3.1.14. */
  subscription_revenue: number | null;
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

export interface EntryFeeQuery {
  status?: ModerationState;
  page?: number;
}

export interface UpdateMePayload {
  phone?: string | null;
  location_enabled?: boolean;
  avatar_url?: string | null;
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
  /**
   * Wikipedia pageviews over the last 12 months, when the place has an
   * article. Star ratings exist almost only on hotels (Booking.com), so for
   * attractions this is usually the only evidence the place is well known.
   */
  popularity?: number | null;
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
  // Links the saved trip back to the chat message it was rendered from, so
  // re-saving the same itinerary card is a no-op instead of a duplicate.
  chat_message_id?: string;
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
  /** From the trip list: a photo of one of its stops, when any has one. */
  cover_photo_url?: string | null;
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
  price_min?: string | null;   // Prisma Decimal -> string; null when unknown
  price_max?: string | null;
  currency?: string;
  source_url?: string | null;  // scraped events link back to their source page
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
