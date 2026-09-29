'use client';

import { CalendarDays, MapPinned, Wallet } from 'lucide-react';
import { motion, useReducedMotion } from 'framer-motion';
import { Reveal } from './Reveal';

const FEATURES = [
  {
    icon: CalendarDays,
    title: 'Day-by-day planner',
    description: 'A clear, editable timeline for every day of your trip.',
  },
  {
    icon: MapPinned,
    title: 'Interactive maps',
    description: 'See every stop plotted on the map with optimized routes.',
  },
  {
    icon: Wallet,
    title: 'Live budget tracking',
    description: 'Watch your spend update in real time as you plan.',
  },
];

export function Showcase() {
  const prefersReducedMotion = useReducedMotion();

  return (
    <section id="features" className="bg-brand-800 px-6 py-24 sm:px-10 lg:px-20">
      <div className="mx-auto grid max-w-6xl items-center gap-16 lg:grid-cols-2">
        <Reveal>
          <p className="text-sm font-semibold uppercase tracking-wide text-accent-500">
            Built for real trips
          </p>
          <h2 className="mt-3 font-serif text-3xl font-semibold text-white sm:text-4xl">
            One workspace for your entire itinerary.
          </h2>
          <p className="mt-4 max-w-md text-base leading-relaxed text-brand-100/80">
            No more juggling tabs and notes apps. Plan, budget, and navigate your trip from a
            single, always up-to-date view.
          </p>

          <div className="mt-10 space-y-6">
            {FEATURES.map((feature) => (
              <div key={feature.title} className="flex items-start gap-4">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white/10 text-accent-500">
                  <feature.icon className="h-5 w-5" />
                </span>
                <div>
                  <h3 className="font-semibold text-white">{feature.title}</h3>
                  <p className="mt-1 text-sm text-brand-100/70">{feature.description}</p>
                </div>
              </div>
            ))}
          </div>
        </Reveal>

        <Reveal delay={0.15}>
          {/* Stylized product mockup — kept light to read as an app screenshot against the dark section */}
          <motion.div
            animate={prefersReducedMotion ? undefined : { y: [0, -10, 0] }}
            transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
            className="rounded-2xl border border-white/10 bg-brand-50/10 p-3 shadow-2xl shadow-black/30"
          >
            <div className="rounded-xl bg-white p-5 shadow-sm">
              <div className="flex items-center gap-1.5 pb-4">
                <span className="h-2.5 w-2.5 rounded-full bg-accent-500/60" />
                <span className="h-2.5 w-2.5 rounded-full bg-brand-300/60" />
                <span className="h-2.5 w-2.5 rounded-full bg-brand-100" />
              </div>

              <div className="flex items-center justify-between border-b border-gray-100 pb-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                    Trip
                  </p>
                  <p className="font-serif text-lg font-semibold text-brand-600">
                    Sri Lanka · 7 days
                  </p>
                </div>
                <span className="rounded-full bg-brand-600/10 px-3 py-1 text-xs font-semibold text-brand-600">
                  On budget
                </span>
              </div>

              <ul className="mt-4 space-y-3">
                {[
                  { day: 'Day 1', place: 'Colombo City Tour', tag: '$45' },
                  { day: 'Day 2', place: 'Sigiriya Rock Fortress', tag: '$60' },
                  { day: 'Day 3', place: 'Kandy Temple & Lake', tag: '$35' },
                ].map((row) => (
                  <li
                    key={row.day}
                    className="flex items-center justify-between rounded-lg bg-gray-50 px-4 py-3 transition hover:bg-brand-50"
                  >
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                        {row.day}
                      </p>
                      <p className="text-sm font-medium text-gray-800">{row.place}</p>
                    </div>
                    <span className="text-sm font-semibold text-brand-600">{row.tag}</span>
                  </li>
                ))}
              </ul>

              <div className="mt-5 h-2 w-full overflow-hidden rounded-full bg-gray-100">
                <motion.div
                  className="h-full w-4/5 rounded-full bg-brand-gradient"
                  animate={prefersReducedMotion ? undefined : { opacity: [0.75, 1, 0.75] }}
                  transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                />
              </div>
              <p className="mt-2 text-xs text-gray-500">$1,240 of $1,500 budget used</p>
            </div>
          </motion.div>
        </Reveal>
      </div>
    </section>
  );
}
