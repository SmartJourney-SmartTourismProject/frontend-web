import { Header } from '@/components/landing/Header';
import { Hero } from '@/components/landing/Hero';
import { Benefits } from '@/components/landing/Benefits';
import { HowItWorks } from '@/components/landing/HowItWorks';
import { Showcase } from '@/components/landing/Showcase';
import { WhyChooseUs } from '@/components/landing/WhyChooseUs';
import { FinalCta } from '@/components/landing/FinalCta';
import { Footer } from '@/components/landing/Footer';

export default function LandingPage() {
  return (
    <main className="relative min-h-screen overflow-x-hidden bg-brand-900">
      <Header />
      <Hero />
      <Benefits />
      <HowItWorks />
      <Showcase />
      <WhyChooseUs />
      <FinalCta />
      <Footer />
    </main>
  );
}
