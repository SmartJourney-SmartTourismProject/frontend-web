import type { Metadata } from 'next';
import type { ReactNode } from 'react';

export const metadata: Metadata = {
  title: 'Plan a trip · SmartJourney',
  description: 'Chat with SmartJourney to build a day-by-day Sri Lanka itinerary with a route map and budget.',
  openGraph: { title: 'Plan a trip · SmartJourney', description: 'Chat with SmartJourney to build a day-by-day Sri Lanka itinerary with a route map and budget.', type: 'website' },
};

export default function HomeLayout({ children }: { children: ReactNode }) {
  return children;
}
