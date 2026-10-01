import type { Metadata } from 'next';
import { Header } from '@/components/landing/Header';
import { Hero } from '@/components/landing/Hero';
import { Destinations } from '@/components/landing/Destinations';
import { Benefits } from '@/components/landing/Benefits';
import { HowItWorks } from '@/components/landing/HowItWorks';
import { Showcase } from '@/components/landing/Showcase';
import { FinalCta } from '@/components/landing/FinalCta';
import { Footer } from '@/components/landing/Footer';

export const metadata: Metadata = {
  title: 'SmartJourney · AI trip planning for Sri Lanka',
  description:
    'Discover Sri Lanka\'s iconic viewpoints and build a handcrafted day-by-day itinerary, route map and budget with AI backed by verified local data.',
  openGraph: {
    title: 'SmartJourney · AI trip planning for Sri Lanka',
    description: 'Handcrafted itineraries, route maps and budgets for Sri Lanka, planned by AI.',
    type: 'website',
    images: ['/images/hero-mountains.png'],
  },
};

export default function LandingPage() {
  return (
    <main className="relative min-h-screen overflow-x-hidden bg-brand-900">
      <Header />
      <Hero />
      <Destinations />
      <Benefits />
      <HowItWorks />
      <Showcase />
      <FinalCta />
      <Footer />
    </main>
  );
}
