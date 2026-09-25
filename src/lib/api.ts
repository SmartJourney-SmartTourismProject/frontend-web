import axios, { type AxiosError } from 'axios';
import { getSession, signIn } from 'next-auth/react';
import type {
  AdminActivity,
  AdminEvent,
  AdminListing,
  AdminStats,
  AdminUser,
  Category,
  ChatSession,
  ChatSessionWithMessages,
  CreateExpensePayload,
  District,
  Expense,
  ExploreEvent,
  ListingsQuery,
  Me,
  ModerationQuery,
  Paginated,
  PaginatedListings,
  SaveTripPayload,
  Tag,
  Trip,
  TripBudget,
  TripBudgetSummary,
  TripDetail,
  TripPlanResponse,
  TripStatus,
  UpdateMePayload,
  UpdatePreferencesPayload,
  UserPreferences,
} from './types';

// Points at NestJS, never the AI backend directly - see
// docs/AI_BACKEND_ENDPOINTS.md: "the frontends never call the AI backend
// directly, only NestJS does."
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  // /trip-plan alone can take 5-20s (up to 60s+ on a slow/retrying Gemini
  // call) per AI_BACKEND_ENDPOINTS.md - matching NestJS's own AI_BACKEND_TIMEOUT_MS.
  timeout: 120_000,
});

// Every request carries the Keycloak access token from the next-auth session;
// NestJS validates it against the realm's JWKS. getSession() hits
// /api/auth/session, which is where the jwt callback (lib/auth.ts) refreshes
// an expired token - so the token we send is always current.
api.interceptors.request.use(async (config) => {
  if (typeof window !== 'undefined') {
    const session = await getSession();
    if (session?.access_token) {
      config.headers.Authorization = `Bearer ${session.access_token}`;
    }
  }
  return config;
});

// 401 from NestJS means the token was rejected (expired session, logged out
// elsewhere): send the user through Keycloak again, back to the same page.
api.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401 && typeof window !== 'undefined') {
      void signIn('keycloak', { callbackUrl: window.location.pathname });
    }
    return Promise.reject(error);
  },
);

export const chatApi = {
  createSession: (title?: string) =>
    api.post<ChatSession>('/chat/sessions', { title }).then((r) => r.data),

  listSessions: () => api.get<ChatSession[]>('/chat/sessions').then((r) => r.data),

  getSession: (id: string) =>
    api.get<ChatSessionWithMessages>(`/chat/sessions/${id}`).then((r) => r.data),

  sendMessage: (id: string, message: string, clientGps?: { lat: number; lon: number }) =>
    api
      .post<TripPlanResponse>(`/chat/sessions/${id}/messages`, {
        message,
        client_gps: clientGps,
      })
      .then((r) => r.data),

  renameSession: (id: string, title: string) =>
    api.patch<ChatSession>(`/chat/sessions/${id}`, { title }).then((r) => r.data),

  deleteSession: (id: string) =>
    api.delete<{ deleted: true }>(`/chat/sessions/${id}`).then((r) => r.data),
};

export const exploreApi = {
  getDistricts: () => api.get<District[]>('/districts').then((r) => r.data),

  getCategories: () => api.get<Category[]>('/categories').then((r) => r.data),

  searchListings: (query: ListingsQuery = {}) =>
    api.get<PaginatedListings>('/listings', { params: query }).then((r) => r.data),

  getEvents: (params: { district?: string } = {}) =>
    api.get<ExploreEvent[]>('/events', { params }).then((r) => r.data),

  getTags: () => api.get<Tag[]>('/tags').then((r) => r.data),
};

// Every route here is @Roles('admin') server-side; middleware also keeps
// non-admins off /admin, so a 403 from these means the session went stale.
export const adminApi = {
  stats: () => api.get<AdminStats>('/admin/stats').then((r) => r.data),

  listings: (query: ModerationQuery = {}) =>
    api.get<Paginated<AdminListing>>('/admin/listings', { params: query }).then((r) => r.data),
  verifyListing: (id: string) =>
    api.post<AdminListing>(`/admin/listings/${id}/verify`).then((r) => r.data),
  rejectListing: (id: string, reason?: string) =>
    api.post<AdminListing>(`/admin/listings/${id}/reject`, { reason }).then((r) => r.data),
  deleteListing: (id: string) =>
    api.delete<{ deleted: true }>(`/admin/listings/${id}`).then((r) => r.data),

  events: (query: ModerationQuery = {}) =>
    api.get<Paginated<AdminEvent>>('/admin/events', { params: query }).then((r) => r.data),
  verifyEvent: (id: string) => api.post<AdminEvent>(`/admin/events/${id}/verify`).then((r) => r.data),
  rejectEvent: (id: string, reason?: string) =>
    api.post<AdminEvent>(`/admin/events/${id}/reject`, { reason }).then((r) => r.data),
  deleteEvent: (id: string) => api.delete<{ deleted: true }>(`/admin/events/${id}`).then((r) => r.data),

  users: (query: { q?: string; role?: string; status?: string; page?: number } = {}) =>
    api.get<Paginated<AdminUser>>('/admin/users', { params: query }).then((r) => r.data),
  user: (id: string) => api.get<AdminUser>(`/admin/users/${id}`).then((r) => r.data),
  userActivity: (id: string) =>
    api.get<AdminActivity[]>(`/admin/users/${id}/activity`).then((r) => r.data),
  updateUser: (id: string, patch: { role?: 'traveler' | 'admin'; is_active?: boolean }) =>
    api.patch<AdminUser>(`/admin/users/${id}`, patch).then((r) => r.data),
};

export const usersApi = {
  me: () => api.get<Me>('/users/me').then((r) => r.data),

  updateMe: (patch: UpdateMePayload) =>
    api.patch<Omit<Me, 'preferences'>>('/users/me', patch).then((r) => r.data),

  getPreferences: () => api.get<UserPreferences>('/users/me/preferences').then((r) => r.data),

  updatePreferences: (patch: UpdatePreferencesPayload) =>
    api.patch<UserPreferences>('/users/me/preferences', patch).then((r) => r.data),
};

export const tripsApi = {
  save: (payload: SaveTripPayload) => api.post<TripDetail>('/trips', payload).then((r) => r.data),

  list: (status?: TripStatus) =>
    api.get<Trip[]>('/trips', { params: { status } }).then((r) => r.data),

  getById: (id: string) => api.get<TripDetail>(`/trips/${id}`).then((r) => r.data),

  update: (
    id: string,
    patch: { title?: string; status?: TripStatus; start_date?: string; end_date?: string; budget?: number },
  ) => api.patch<Trip>(`/trips/${id}`, patch).then((r) => r.data),

  remove: (id: string) => api.delete<{ deleted: true }>(`/trips/${id}`).then((r) => r.data),
};

export const budgetApi = {
  listExpenses: (tripId: string) =>
    api.get<Expense[]>(`/trips/${tripId}/expenses`).then((r) => r.data),

  addExpense: (tripId: string, payload: CreateExpensePayload) =>
    api.post<Expense>(`/trips/${tripId}/expenses`, payload).then((r) => r.data),

  updateExpense: (id: string, patch: Partial<CreateExpensePayload>) =>
    api.patch<Expense>(`/expenses/${id}`, patch).then((r) => r.data),

  deleteExpense: (id: string) =>
    api.delete<{ deleted: true }>(`/expenses/${id}`).then((r) => r.data),

  getTripBudget: (tripId: string) => api.get<TripBudget>(`/trips/${tripId}/budget`).then((r) => r.data),

  getAllSummary: () => api.get<TripBudgetSummary[]>('/budget/summary').then((r) => r.data),
};
