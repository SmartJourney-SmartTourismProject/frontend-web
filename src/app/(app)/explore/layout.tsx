import type { Metadata } from 'next';
import type { ReactNode } from 'react';

export const metadata: Metadata = {
  title: 'Explore Sri Lanka · SmartJourney',
  description: 'Browse hotels, restaurants, attractions and upcoming local events across Sri Lanka.',
  openGraph: { title: 'Explore Sri Lanka · SmartJourney', description: 'Browse hotels, restaurants, attractions and upcoming local events across Sri Lanka.', type: 'website' },
};

export default function ExploreLayout({ children }: { children: ReactNode }) {
  return children;
}
