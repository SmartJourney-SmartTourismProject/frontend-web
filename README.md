# SmartJourney Frontend Web Application

A modern, AI-powered travel planning frontend for Sri Lanka built with Next.js 14, React 18, and TypeScript.

## 🚀 Features

- **Natural Language Trip Planning** - Describe your dream trip in plain English
- **Real-time AI Itinerary Generation** - Powered by SmartJourney AI Backend
- **Interactive Itinerary Display** - Day-by-day with expandable activities
- **Weather & Safety Monitoring** - Real-time forecasts and disaster alerts
- **Smart Recommendations** - Hotels, restaurants, attractions, events with RAG-powered search
- **Responsive Design** - Works beautifully on mobile, tablet, and desktop
- **Dark/Light Mode Ready** - Built with Tailwind CSS
- **Animations** - Smooth Framer Motion transitions throughout

## 🛠 Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Animations**: Framer Motion
- **Forms**: React Hook Form + Zod validation
- **State Management**: Zustand (for global state)
- **Icons**: Lucide React
- **Date Handling**: date-fns
- **HTTP Client**: Axios
- **Notifications**: React Hot Toast

## 📁 Project Structure

```
frontend-web/
├── src/
│   ├── app/                    # Next.js App Router pages
│   │   ├── layout.tsx         # Root layout
│   │   ├── page.tsx           # Main page (landing + planner + results)
│   │   └── globals.css        # Global styles
│   ├── components/            # React components
│   │   ├── Header.tsx         # Navigation header
│   │   ├── Footer.tsx         # Site footer
│   │   ├── TripPlannerForm.tsx # Main trip planning form
│   │   ├── ItineraryDisplay.tsx # Itinerary view
│   │   ├── RecommendationsDisplay.tsx # Recommendations tabs
│   │   ├── WeatherDisasterAlerts.tsx # Weather & safety
│   │   ├── FeatureCards.tsx   # Features section
│   │   └── HowItWorks.tsx     # How it works section
│   ├── lib/                   # Utilities & API
│   │   └── api.ts             # Axios instance & API methods
│   ├── types/                 # TypeScript types
│   │   └── trip.ts            # Trip-related types
│   └── hooks/                 # Custom React hooks (future)
├── public/                    # Static assets
├── package.json
├── tsconfig.json
├── tailwind.config.js
├── postcss.config.js
├── next.config.js
└── .env.example
```

## 🚀 Getting Started

### Prerequisites

- Node.js 18.17 or later
- npm or yarn
- SmartJourney AI Backend running on `http://localhost:8000`

### Installation

```bash
# Navigate to frontend directory
cd frontend-web

# Install dependencies
npm install

# Copy environment variables
cp .env.example .env.local

# Start development server
npm run dev
```

The app will be available at `http://localhost:3000`

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `NEXT_PUBLIC_API_URL` | Backend API base URL | `http://localhost:8000` |
| `NEXT_PUBLIC_GA_ID` | Google Analytics ID | - |
| `NEXT_PUBLIC_SENTRY_DSN` | Sentry DSN for error tracking | - |
| `NEXT_PUBLIC_MAPBOX_TOKEN` | Mapbox token for maps | - |

## 🔧 Development

### Available Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npm run test         # Run tests
npm run test:watch   # Run tests in watch mode
```

### Code Style

- **Formatter**: Prettier (via ESLint)
- **Linting**: ESLint with Next.js config
- **Type Checking**: TypeScript strict mode

## 🎨 UI Components

### Core Components

1. **TripPlannerForm** - Natural language input with smart suggestions
2. **ItineraryDisplay** - Expandable day-by-day itinerary with costs
3. **RecommendationsDisplay** - Tabbed categories (hotels, restaurants, attractions, events)
4. **WeatherDisasterAlerts** - Weather forecast + disaster alerts + itinerary impact
5. **Header/Footer** - Navigation and site footer

### Design System

- **Colors**: Primary (green), Secondary (amber), Accent (purple)
- **Spacing**: 4px base unit
- **Border Radius**: 12px (xl) for cards, 8px (lg) for inputs
- **Shadows**: Subtle, layered shadows
- **Animations**: 200-300ms transitions, Framer Motion for complex animations

## 🔌 Backend Integration

The frontend communicates with the SmartJourney AI Backend via REST API:

### Main Endpoint

```
POST /api/plan-trip
```

**Request Body:**
```json
{
  "user_input": "Plan a 3-day trip to Ella for hiking and local food",
  "destination": "Ella",
  "duration_days": 3,
  "budget": 800,
  "travelers": 2,
  "interests": ["hiking", "nature", "local cuisine"],
  "travel_style": "adventure"
}
```

**Response:**
```json
{
  "success": true,
  "final_response": "Markdown formatted itinerary...",
  "itinerary": [...],
  "recommendations": [...],
  "weather": {...},
  "disaster": [...],
  "estimated_cost": 750
}
```

## 📱 Responsive Breakpoints

- **Mobile**: < 640px
- **Tablet**: 640px - 1024px
- **Desktop**: > 1024px

## ♿ Accessibility

- Semantic HTML5
- ARIA labels and roles
- Keyboard navigation support
- Focus indicators
- Color contrast compliance (WCAG AA)
- Screen reader friendly

## 🧪 Testing

```bash
# Run all tests
npm run test

# Run with coverage
npm run test -- --coverage

# Watch mode
npm run test:watch
```

## 📦 Deployment

### Vercel (Recommended)

1. Push to GitHub
2. Import project in Vercel
3. Add environment variables
4. Deploy

### Docker

```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

## 🔒 Security

- Content Security Policy headers
- XSS protection
- CSRF protection via SameSite cookies
- Secure HTTP headers
- Input validation on all forms

## 📄 License

MIT License - see LICENSE file for details.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests and linting
5. Submit a pull request

## 📞 Support

- **Documentation**: [Link to docs]
- **Issues**: GitHub Issues
- **Email**: support@smartjourney.ai