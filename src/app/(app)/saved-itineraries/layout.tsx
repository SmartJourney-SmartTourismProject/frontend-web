import type { Metadata } from 'next';
import type { ReactNode } from 'react';

export const metadata: Metadata = {
  title: 'Saved itineraries · SmartJourney',
  description: 'Revisit and manage the trips you have saved.',
  openGraph: { title: 'Saved itineraries · SmartJourney', description: 'Revisit and manage the trips you have saved.', type: 'website' },
};

export default function SavedLayout({ children }: { children: ReactNode }) {
  return children;
}
