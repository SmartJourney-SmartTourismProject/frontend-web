import Link from 'next/link';
import { Reveal } from './Reveal';
import { FloatingOrb } from './FloatingOrb';

export function FinalCta() {
  return (
    <section className="relative overflow-hidden bg-brand-gradient px-6 py-20 sm:px-10 lg:px-20">
      <FloatingOrb
        className="pointer-events-none absolute -left-16 -top-16 h-64 w-64 rounded-full bg-white/10 blur-3xl"
        duration={8}
      />
      <FloatingOrb
        className="pointer-events-none absolute -bottom-20 -right-10 h-72 w-72 rounded-full bg-white/10 blur-3xl"
        duration={10}
        delay={1}
      />
      <Reveal className="relative mx-auto flex max-w-4xl flex-col items-center gap-6 text-center">
        <h2 className="font-serif text-3xl font-semibold text-white sm:text-4xl">
          Your next trip is one plan away.
        </h2>
        <p className="max-w-xl text-base text-white/85 sm:text-lg">
          Join travelers using SmartJourney to build itineraries that fit their time, budget, and
          style — automatically.
        </p>
        <Link
          href="/signup"
          className="mt-2 inline-flex items-center justify-center rounded-2xl bg-white px-10 py-4 text-lg font-semibold text-brand-600 shadow-lg transition duration-200 hover:shadow-xl hover:brightness-105 active:scale-[0.98]"
        >
          Start planning for free
        </Link>
      </Reveal>
    </section>
  );
}
