export interface PlanTripRequest {
  user_input: string
  destination?: string
  duration_days?: number
  budget?: number
  travelers?: number
  user_id?: string
  interests?: string[]
  travel_style?: string
  start_location?: {
    lat: number
    lon: number
    source: 'gps' | 'ip' | 'manual'
  }
  trip_dates?: Array<{
    start_date: string
    end_date: string
  }>
  language?: string
}

export interface PlanTripResponse {
  success: boolean
  final_response?: string
  itinerary?: ItineraryItem[]
  recommendations?: RecommendationItem[]
  hotels?: RecommendationItem[]
  restaurants?: RecommendationItem[]
  attractions?: RecommendationItem[]
  events?: RecommendationItem[]
  weather?: WeatherData
  disaster?: DisasterAlert[]
  estimated_cost?: number
  errors?: string[]
  completed_steps?: string[]
}

export interface ItineraryItem {
  day: number
  date?: string
  items: ItineraryActivity[]
  estimated_cost?: number
}

export interface ItineraryActivity {
  time: string
  type: 'attraction' | 'restaurant' | 'hotel' | 'event' | 'transit'
  name: string
  location?: string
  notes?: string
  estimated_cost?: number
  rating?: number
  reason?: string
  duration_minutes?: number
  coordinates?: {
    lat: number
    lon: number
  }
}

export interface RecommendationItem {
  id: string
  name: string
  category: 'hotel' | 'restaurant' | 'attraction' | 'event'
  destination?: string
  location?: string
  description?: string
  price_range?: string
  estimated_cost?: number
  rating?: number
  interests?: string[]
  reason?: string
  coordinates?: {
    lat: number
    lon: number
  }
  address?: string
  phone?: string
  website?: string
  opening_hours?: string
  images?: string[]
}

export interface WeatherData {
  location?: string
  current?: CurrentWeather
  daily?: DailyWeather[]
  hourly?: HourlyWeather[]
  last_updated?: string
  source?: string
}

export interface CurrentWeather {
  temperature: number
  feels_like: number
  condition: string
  description: string
  humidity: number
  wind_speed: number
  wind_direction: number
  pressure: number
  visibility: number
  uv_index: number
  sunrise: string
  sunset: string
  icon?: string
}

export interface DailyWeather {
  date: string
  condition: string
  description: string
  temp_min: number
  temp_max: number
  humidity: number
  wind_speed: number
  precipitation_probability: number
  precipitation_amount: number
  uv_index: number
  sunrise: string
  sunset: string
}

export interface HourlyWeather {
  time: string
  temperature: number
  condition: string
  precipitation_probability: number
  wind_speed: number
  humidity: number
}

export interface DisasterAlert {
  id: string
  title: string
  description: string
  severity: 'critical' | 'high' | 'medium' | 'low'
  type: 'weather' | 'geological' | 'health' | 'security' | 'transport'
  areas: string[]
  start_date: string
  end_date?: string
  source: string
  source_url?: string
  recommended_actions?: string[]
}

export interface Destination {
  id: string
  name: string
  slug: string
  country: string
  region: string
  description: string
  short_description: string
  image: string
  gallery: string[]
  best_time_to_visit: string
  average_budget: {
    budget: number
    mid_range: number
    luxury: number
  }
  popular_activities: string[]
  climate: string
  coordinates: {
    lat: number
    lon: number
  }
  attractions_count: number
  hotels_count: number
  restaurants_count: number
}

export interface UserProfile {
  id: string
  email: string
  name: string
  avatar?: string
  preferences: {
    travel_style?: string
    budget_range?: { min: number; max: number }
    interests?: string[]
    dietary_restrictions?: string[]
    accessibility_needs?: string[]
  }
  past_trips: string[]
  saved_trips: string[]
  created_at: string
}

export interface FeedbackData {
  session_id: string
  user_id?: string
  rating: number
  categories: {
    recommendations: number
    itinerary_quality: number
    budget_accuracy: number
    ease_of_use: number
  }
  comments?: string
  improvements?: string[]
  would_recommend: boolean
  timestamp: string
}

export interface ApiError {
  success: false
  error: string
  details?: Record<string, any>
  code?: string
}

export type TripState = PlanTripRequest & {
  hotels?: RecommendationItem[]
  restaurants?: RecommendationItem[]
  attractions?: RecommendationItem[]
  events?: RecommendationItem[]
  weather?: WeatherData
  disaster?: DisasterAlert[]
  itinerary?: ItineraryItem[]
  recommendations?: RecommendationItem[]
  estimated_cost?: number
  errors?: string[]
  completed_steps?: string[]
}