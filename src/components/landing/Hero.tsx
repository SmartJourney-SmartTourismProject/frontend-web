'use client';

import { AuthLaunchButton } from '@/components/auth/AuthLaunchButton';
import Image from 'next/image';
import { motion, useReducedMotion } from 'framer-motion';
import { MapPinned, Sparkles, Wallet } from 'lucide-react';

const STATS = [
  { value: '40+', label: 'Itineraries built' },
  { value: '120+', label: 'Countries covered' },
  { value: '4.9', label: 'Traveler rating' },
];

export function Hero() {
  const prefersReducedMotion = useReducedMotion();
  const float = (offset: number) =>
    prefersReducedMotion
      ? {}
      : {
          animate: { y: [0, -offset, 0] },
          transition: { duration: 5, repeat: Infinity, ease: 'easeInOut' as const },
        };

  return (
    <section className="relative min-h-screen overflow-hidden">
      <Image
        src="/images/hero-mountains.png"
        alt="Mountain landscape at golden hour"
        fill
        priority
        className="object-cover"
      />
      {/* Brand-toned scrim so hero text stays legible while keeping the same palette */}
      <div className="absolute inset-0 bg-gradient-to-r from-brand-900/70 via-brand-900/35 to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-black/10" />

      <div className="relative flex min-h-screen flex-col">
        <div className="grid flex-1 items-center gap-10 px-6 pt-28 pb-16 sm:px-10 lg:grid-cols-[1.1fr,0.9fr] lg:px-20 lg:pt-24">
          <div className="max-w-3xl">
            <motion.span
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
              className="inline-flex items-center gap-2 rounded-full border border-white/30 bg-white/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-wide text-white backdrop-blur-sm"
            >
              <Sparkles className="h-3.5 w-3.5 text-accent-500" />
              AI-Powered Travel Planning
            </motion.span>

            <motion.h1
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
              className="mt-6 font-serif text-5xl font-semibold leading-[1.05] text-white drop-shadow-sm sm:text-6xl lg:text-7xl"
            >
              Plan trips that feel
              <span className="block text-brand-200">handcrafted, not generic.</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
              className="mt-6 max-w-xl text-lg font-light text-white/90 sm:text-xl"
            >
              Discover destinations, build personalized itineraries, and travel with confidence
              using AI backed by verified local insights.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
              className="mt-10 flex flex-wrap items-center gap-4"
            >
              <AuthLaunchButton
                mode="signup"
                className="rounded-2xl bg-brand-gradient px-10 py-4 text-lg font-semibold text-white shadow-lg shadow-brand-900/30 transition duration-200 hover:shadow-xl hover:brightness-110 active:scale-[0.98]"
              >
                Start Here
              </AuthLaunchButton>
              <a
                href="#how-it-works"
                className="inline-flex items-center justify-center rounded-2xl border-2 border-white/70 bg-white/5 px-8 py-4 text-lg font-medium text-white backdrop-blur-sm transition duration-200 hover:bg-white/15"
              >
                See how it works
              </a>
            </motion.div>

            <motion.dl
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.4, ease: [0.22, 1, 0.36, 1] }}
              className="mt-16 flex flex-wrap gap-10"
            >
              {STATS.map((stat) => (
                <div key={stat.label}>
                  <dt className="sr-only">{stat.label}</dt>
                  <dd>
                    <span className="block text-4xl font-semibold text-white sm:text-5xl">
                      {stat.value}
                    </span>
                    <span className="text-base font-light text-white/80">{stat.label}</span>
                  </dd>
                </div>
              ))}
            </motion.dl>
          </div>

          {/* Floating decorative cards — visible on larger screens to keep mobile clean */}
          <div className="relative hidden h-[420px] lg:block">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, x: 30 }}
              animate={{ opacity: 1, scale: 1, x: 0 }}
              transition={{ duration: 0.7, delay: 0.35, ease: [0.22, 1, 0.36, 1] }}
              {...float(10)}
              className="absolute right-6 top-4 w-64 rounded-2xl border border-white/20 bg-white/95 p-4 shadow-xl backdrop-blur-sm"
            >
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-gradient text-white">
                  <Sparkles className="h-5 w-5" />
                </span>
                <div>
                  <p className="text-sm font-semibold text-brand-600">Itinerary ready</p>
                  <p className="text-xs text-gray-500">Generated in 12 seconds</p>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.9, x: -30 }}
              animate={{ opacity: 1, scale: 1, x: 0 }}
              transition={{ duration: 0.7, delay: 0.5, ease: [0.22, 1, 0.36, 1] }}
              {...float(14)}
              className="absolute left-0 top-44 w-60 rounded-2xl border border-white/20 bg-white/95 p-4 shadow-xl backdrop-blur-sm"
            >
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent-500/15 text-accent-600">
                  <MapPinned className="h-5 w-5" />
                </span>
                <div>
                  <p className="text-sm font-semibold text-brand-600">Kandy → Ella</p>
                  <p className="text-xs text-gray-500">Route optimized</p>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.65, ease: [0.22, 1, 0.36, 1] }}
              {...float(12)}
              className="absolute bottom-2 right-16 w-56 rounded-2xl border border-white/20 bg-white/95 p-4 shadow-xl backdrop-blur-sm"
            >
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-100 text-brand-600">
                  <Wallet className="h-5 w-5" />
                </span>
                <div>
                  <p className="text-sm font-semibold text-brand-600">Within budget</p>
                  <p className="text-xs text-gray-500">$1,240 of $1,500</p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>

        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-b from-transparent to-brand-900" />
      </div>
    </section>
  );
}
