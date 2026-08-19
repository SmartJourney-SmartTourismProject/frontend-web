import axios, { AxiosError, AxiosResponse } from 'axios'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 120000, // 2 minutes for AI processing
})

// Request interceptor
api.interceptors.request.use(
  (config) => {
    // Add auth token if available
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('auth_token')
      if (token) {
        config.headers.Authorization = `Bearer ${token}`
      }
    }
    return config
  },
  (error) => Promise.reject(error)
)

// Response interceptor
api.interceptors.response.use(
  (response: AxiosResponse) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      // Handle unauthorized - redirect to login
      if (typeof window !== 'undefined') {
        localStorage.removeItem('auth_token')
        window.location.href = '/login'
      }
    }
    return Promise.reject(error)
  }
)

// API Methods
export const tripApi = {
  planTrip: async (data: any) => {
    const response = await api.post('/api/plan-trip', data)
    return response.data
  },

  getHealth: async () => {
    const response = await api.get('/api/health')
    return response.data
  },

  indexRagData: async (data: { data: any; destination: string }) => {
    const response = await api.post('/api/rag/index', data)
    return response.data
  },

  searchRag: async (query: string, category: string, k: number = 5, destination?: string) => {
    const response = await api.post('/api/rag/search', { query, category, k, destination })
    return response.data
  },
}

export const authApi = {
  login: async (email: string, password: string) => {
    const response = await api.post('/api/auth/login', { email, password })
    return response.data
  },

  register: async (data: { email: string; password: string; name: string }) => {
    const response = await api.post('/api/auth/register', data)
    return response.data
  },

  logout: async () => {
    const response = await api.post('/api/auth/logout')
    return response.data
  },

  getProfile: async () => {
    const response = await api.get('/api/auth/profile')
    return response.data
  },
}

export const destinationsApi = {
  getAll: async () => {
    const response = await api.get('/api/destinations')
    return response.data
  },

  getById: async (id: string) => {
    const response = await api.get(`/api/destinations/${id}`)
    return response.data
  },

  search: async (query: string) => {
    const response = await api.get('/api/destinations/search', { params: { q: query } })
    return response.data
  },
}

export const feedbackApi = {
  submit: async (data: { 
    session_id: string
    rating: number
    categories: Record<string, number>
    comments?: string
    improvements?: string[]
    would_recommend: boolean
  }) => {
    const response = await api.post('/api/feedback', data)
    return response.data
  },
}

export default api