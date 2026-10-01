import type { Metadata } from 'next';
import type { ReactNode } from 'react';

export const metadata: Metadata = {
  title: 'Budget tracker · SmartJourney',
  description: 'Track what you have spent on each trip against the budget you set aside.',
  openGraph: { title: 'Budget tracker · SmartJourney', description: 'Track what you have spent on each trip against the budget you set aside.', type: 'website' },
};

export default function BudgetLayout({ children }: { children: ReactNode }) {
  return children;
}
