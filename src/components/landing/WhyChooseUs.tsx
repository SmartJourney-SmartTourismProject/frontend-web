import Image from 'next/image';
import { CheckCircle2 } from 'lucide-react';
import { Reveal } from './Reveal';

const REASONS = [
  'AI recommendations grounded in verified local data, not generic listings',
  'Budgets that update live as you build your itinerary',
  'Full control to reorder, swap, or fine-tune any part of your trip',
  'One workspace for planning, mapping, and tracking spend',
];

export function WhyChooseUs() {
  return (
    <section id="why-us" className="bg-gradient-to-b from-brand-800 to-brand-900 px-6 py-24 sm:px-10 lg:px-20">
      <div className="mx-auto grid max-w-6xl items-center gap-16 lg:grid-cols-2">
        <Reveal className="relative order-2 overflow-hidden rounded-2xl shadow-2xl shadow-black/30 lg:order-1">
          <div className="relative h-80 w-full sm:h-96">
            <Image
              src="/images/hero-mountains.png"
              alt="Scenic travel destination"
              fill
              className="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-brand-900/70 via-brand-900/10 to-transparent" />
          </div>
        </Reveal>

        <Reveal className="order-1 lg:order-2" delay={0.1}>
          <p className="text-sm font-semibold uppercase tracking-wide text-accent-500">
            Why SmartJourney
          </p>
          <h2 className="mt-3 font-serif text-3xl font-semibold text-white sm:text-4xl">
            Planning that adapts to you, not the other way around.
          </h2>
          <ul className="mt-8 space-y-4">
            {REASONS.map((reason) => (
              <li key={reason} className="flex items-start gap-3">
                <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-accent-500" />
                <span className="text-base leading-relaxed text-brand-100/85">{reason}</span>
              </li>
            ))}
          </ul>
        </Reveal>
      </div>
    </section>
  );
}
