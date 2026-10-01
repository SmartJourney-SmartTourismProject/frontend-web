import { Compass, ShieldCheck, Sparkles, Wallet } from 'lucide-react';
import { Reveal, StaggerGroup, StaggerItem } from '@/components/motion/Reveal';
import { FloatingOrb } from './FloatingOrb';

const BENEFITS = [
  {
    icon: Sparkles,
    title: 'Personalized by AI',
    description:
      'Tell us your interests and pace, and our AI drafts a day-by-day plan built around you.',
  },
  {
    icon: Compass,
    title: 'Verified local insights',
    description:
      'Every recommendation is grounded in real destination data, not generic guesswork.',
  },
  {
    icon: Wallet,
    title: 'Budget-aware planning',
    description:
      'Set a budget once and watch every suggestion stay within reach, down to the last stop.',
  },
  {
    icon: ShieldCheck,
    title: 'Plan with confidence',
    description:
      'Adjust, swap, or reorder any part of your trip and see the impact instantly.',
  },
];

export function Benefits() {
  return (
    <section className="relative overflow-hidden bg-brand-800 px-6 py-24 sm:px-10 lg:px-20">
      <FloatingOrb
        className="pointer-events-none absolute -left-20 top-10 h-72 w-72 rounded-full bg-accent-500/20 blur-3xl"
        duration={9}
      />
      <FloatingOrb
        className="pointer-events-none absolute -right-16 bottom-0 h-80 w-80 rounded-full bg-brand-400/20 blur-3xl"
        duration={11}
        delay={1.5}
      />

      <div className="relative mx-auto max-w-6xl">
        <Reveal className="max-w-2xl">
          <p className="text-sm font-semibold uppercase tracking-wide text-accent-500">
            Why travelers choose SmartJourney
          </p>
          <h2 className="mt-3 font-serif text-3xl font-semibold text-white sm:text-4xl">
            Everything you need to plan, without the busywork.
          </h2>
        </Reveal>

        <StaggerGroup className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {BENEFITS.map((benefit) => (
            <StaggerItem key={benefit.title}>
              <div className="group h-full rounded-2xl border border-brand-100 bg-white p-6 shadow-lg shadow-black/20 transition duration-300 hover:-translate-y-1 hover:border-accent-500/40 hover:shadow-xl">
                <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-gradient text-white transition duration-300 group-hover:scale-105">
                  <benefit.icon className="h-6 w-6" />
                </span>
                <h3 className="mt-5 text-lg font-semibold text-gray-900">{benefit.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-gray-600">
                  {benefit.description}
                </p>
              </div>
            </StaggerItem>
          ))}
        </StaggerGroup>
      </div>
    </section>
  );
}
