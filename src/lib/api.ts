import axios from 'axios';
import type { ChatSession, ChatSessionWithMessages, District, TripPlanResponse } from './types';

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
};
