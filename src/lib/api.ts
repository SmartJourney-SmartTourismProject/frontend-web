import axios, { AxiosError, AxiosResponse } from 'axios'
import { getSession, signIn } from 'next-auth/react'

// Two HTTP clients:
//
//  `api`   - the NestJS backend (backend/). Every request carries the Keycloak
//            access token from the next-auth session as a Bearer token; NestJS
//            validates it against the realm's JWKS. Controllers are mounted at
//            the root (no /api/v1 prefix) - see backend/src/*/*.controller.ts.
//
//  `aiApi` - the FastAPI AI backend (ai-backend/). Unauthenticated by design
//            (internal service). Only ChatPanel's plan-trip call still goes
//            here directly; it should move behind NestJS's
//            POST /chat/sessions/:id/messages once that wiring lands.

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'
const AI_BACKEND_URL = process.env.NEXT_PUBLIC_AI_BACKEND_URL || 'http://localhost:8000'

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 120000, // chat messages proxy to the AI backend, which can take 5-20s
})

// Attach the Keycloak access token. getSession() hits /api/auth/session,
// which is where the jwt callback (lib/auth.ts) refreshes an expired token -
// so this also guarantees the token we send is current.
api.interceptors.request.use(async (config) => {
  if (typeof window !== 'undefined') {
    const session = await getSession()
    if (session?.access_token) {
      config.headers.Authorization = `Bearer ${session.access_token}`
    }
  }
  return config
})

// 401 from NestJS means the token was rejected (expired session, logged out
// elsewhere): send the user through Keycloak again, back to the same page.
api.interceptors.response.use(
  (response: AxiosResponse) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401 && typeof window !== 'undefined') {
      void signIn('keycloak', { callbackUrl: window.location.pathname })
    }
    return Promise.reject(error)
  }
)

export const aiApi = axios.create({
  baseURL: AI_BACKEND_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 120000, // 2 minutes for AI processing
})

// ---------------------------------------------------------------------------
// AI backend (direct - see note above)
// ---------------------------------------------------------------------------

export const tripApi = {
  planTrip: async (data: any) => {
    const response = await aiApi.post('/api/plan-trip', data)
    return response.data
  },

  getHealth: async () => {
    const response = await aiApi.get('/api/health')
    return response.data
  },

  indexRagData: async (data: { data: any; destination: string }) => {
    const response = await aiApi.post('/api/rag/index', data)
    return response.data
  },

  searchRag: async (query: string, category: string, k: number = 5, destination?: string) => {
    const response = await aiApi.post('/api/rag/search', { query, category, k, destination })
    return response.data
  },
}

// ---------------------------------------------------------------------------
// NestJS backend
// ---------------------------------------------------------------------------

export const exploreApi = {
  districts: async () => (await api.get('/districts')).data,
  categories: async () => (await api.get('/categories')).data,
  listings: async (params?: Record<string, string | number | undefined>) =>
    (await api.get('/listings', { params })).data,
  listing: async (id: string) => (await api.get(`/listings/${id}`)).data,
  events: async (params?: Record<string, string | number | undefined>) =>
    (await api.get('/events', { params })).data,
  event: async (id: string) => (await api.get(`/events/${id}`)).data,
}

export const chatApi = {
  createSession: async (title?: string) => (await api.post('/chat/sessions', { title })).data,
  listSessions: async () => (await api.get('/chat/sessions')).data,
  getSession: async (id: string) => (await api.get(`/chat/sessions/${id}`)).data,
  sendMessage: async (id: string, body: { message: string; client_gps?: { lat: number; lon: number } }) =>
    (await api.post(`/chat/sessions/${id}/messages`, body)).data,
  renameSession: async (id: string, title: string) =>
    (await api.patch(`/chat/sessions/${id}`, { title })).data,
  deleteSession: async (id: string) => (await api.delete(`/chat/sessions/${id}`)).data,
}

export const tripsApi = {
  list: async (status?: 'upcoming' | 'draft' | 'past') =>
    (await api.get('/trips', { params: { status } })).data,
  get: async (id: string) => (await api.get(`/trips/${id}`)).data,
  save: async (body: unknown) => (await api.post('/trips', body)).data,
  update: async (id: string, body: unknown) => (await api.patch(`/trips/${id}`, body)).data,
  remove: async (id: string) => (await api.delete(`/trips/${id}`)).data,
}

export const budgetApi = {
  expenses: async (tripId: string) => (await api.get(`/trips/${tripId}/expenses`)).data,
  addExpense: async (tripId: string, body: unknown) =>
    (await api.post(`/trips/${tripId}/expenses`, body)).data,
  updateExpense: async (id: string, body: unknown) => (await api.patch(`/expenses/${id}`, body)).data,
  deleteExpense: async (id: string) => (await api.delete(`/expenses/${id}`)).data,
  tripSummary: async (tripId: string) => (await api.get(`/trips/${tripId}/budget`)).data,
  summary: async () => (await api.get('/budget/summary')).data,
}

export default api
