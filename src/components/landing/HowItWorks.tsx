import { ClipboardList, MapPin, Wand2 } from 'lucide-react';
import { Reveal, StaggerGroup, StaggerItem } from './Reveal';
import { FloatingOrb } from './FloatingOrb';

const STEPS = [
  {
    icon: ClipboardList,
    step: '01',
    title: 'Tell us your preferences',
    description: 'Share your destination, dates, budget, and travel style in a couple minutes.',
  },
  {
    icon: Wand2,
    step: '02',
    title: 'AI builds your itinerary',
    description: 'SmartJourney assembles a day-by-day plan matched to your interests and budget.',
  },
  {
    icon: MapPin,
    step: '03',
    title: 'Explore and adjust freely',
    description: 'Swap stops, reorder days, or fine-tune your budget — your plan updates instantly.',
  },
];

export function HowItWorks() {
  return (
    <section
      id="how-it-works"
      className="relative overflow-hidden bg-gradient-to-b from-brand-900 to-brand-800 px-6 py-24 sm:px-10 lg:px-20"
    >
      <FloatingOrb
        className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-brand-gradient opacity-20 blur-3xl"
        duration={12}
      />
      <div className="relative mx-auto max-w-6xl">
        <Reveal className="max-w-2xl">
          <p className="text-sm font-semibold uppercase tracking-wide text-accent-500">
            How it works
          </p>
          <h2 className="mt-3 font-serif text-3xl font-semibold text-white sm:text-4xl">
            From idea to itinerary in three steps.
          </h2>
        </Reveal>

        <StaggerGroup className="mt-16 grid gap-8 md:grid-cols-3">
          {STEPS.map((item, index) => (
            <StaggerItem key={item.step} className="relative">
              <div className="h-full rounded-2xl border border-brand-100 bg-white p-8 shadow-lg shadow-black/20 transition duration-300 hover:shadow-xl">
                <span className="font-serif text-5xl font-semibold text-brand-100">
                  {item.step}
                </span>
                <span className="mt-4 flex h-12 w-12 items-center justify-center rounded-xl bg-brand-600/10 text-brand-600">
                  <item.icon className="h-6 w-6" />
                </span>
                <h3 className="mt-5 text-lg font-semibold text-gray-900">{item.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-gray-600">
                  {item.description}
                </p>
              </div>
              {index < STEPS.length - 1 && (
                <div className="absolute right-[-1rem] top-1/2 hidden h-px w-8 -translate-y-1/2 bg-white/20 md:block" />
              )}
            </StaggerItem>
          ))}
        </StaggerGroup>
      </div>
    </section>
  );
}
