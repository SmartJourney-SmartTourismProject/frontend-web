import type { Metadata } from 'next'
import { Inter, Playfair_Display } from 'next/font/google'
import './globals.css'
import { Toaster } from 'react-hot-toast'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })
const playfair = Playfair_Display({ subsets: ['latin'], variable: '--font-display' })

export const metadata: Metadata = {
  title: 'SmartJourney - AI-Powered Travel Planner',
  description: 'Plan your perfect trip to Sri Lanka with AI-powered recommendations, personalized itineraries, and real-time travel insights.',
  keywords: ['travel', 'Sri Lanka', 'trip planner', 'AI', 'itinerary', 'tourism'],
  authors: [{ name: 'SmartJourney Team' }],
  openGraph: {
    title: 'SmartJourney - AI-Powered Travel Planner',
    description: 'Plan your perfect trip to Sri Lanka with AI-powered recommendations.',
    type: 'website',
    locale: 'en_US',
    siteName: 'SmartJourney',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`${inter.variable} ${playfair.variable} antialiased`}>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className="bg-gray-50 text-gray-900 min-h-screen flex flex-col">
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#363636',
              color: '#fff',
              borderRadius: '12px',
              padding: '16px',
            },
            success: {
              iconTheme: {
                primary: '#c64d9e',
                secondary: '#fff',
              },
            },
            error: {
              iconTheme: {
                primary: '#ef4444',
                secondary: '#fff',
              },
            },
          }}
        />
        {children}
      </body>
    </html>
  )
}
