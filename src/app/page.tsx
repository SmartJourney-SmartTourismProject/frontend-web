import Link from 'next/link';
import Image from 'next/image';
import { Plane } from 'lucide-react';

const STATS = [
  { value: '40+', label: 'Itineraries built' },
  { value: '120+', label: 'Countries Covered' },
  { value: '4.9', label: 'Traveler Ratings' },
];

export default function LandingPage() {
  return (
    <main className="relative min-h-screen overflow-hidden">
      <Image
        src="/images/hero-mountains.png"
        alt=""
        fill
        priority
        className="object-cover"
      />
      <div className="absolute inset-0 bg-black/10" />

      <div className="relative flex min-h-screen flex-col">
        <header className="flex items-center justify-between bg-black/30 px-6 py-4 backdrop-blur-sm sm:px-10">
          <div className="flex items-center gap-2">
            <Plane className="h-7 w-7 rotate-45 text-sky-300" />
            <span className="font-serif text-2xl font-semibold text-white">SmartJourney</span>
          </div>
          <nav className="flex items-center gap-3">
            <Link
              href="/login"
              className="rounded-xl border border-white px-6 py-2.5 text-sm font-bold text-white transition hover:bg-white/10"
            >
              Log In
            </Link>
            <Link
              href="/signup"
              className="rounded-xl bg-brand-gradient px-6 py-2.5 text-sm font-bold text-white shadow-md transition hover:opacity-90"
            >
              Sign Up
            </Link>
          </nav>
        </header>

        <section className="flex flex-1 flex-col justify-center px-6 py-16 sm:px-10 lg:px-20">
          <div className="max-w-3xl">
            <h1 className="font-serif text-6xl font-semibold leading-tight text-brand-600 sm:text-7xl lg:text-8xl">
              SmartJourney
            </h1>
            <h2 className="mt-4 text-3xl font-light text-gray-900 sm:text-4xl">
              AI-Powered Travel Planning
            </h2>
            <p className="mt-4 max-w-xl text-lg font-light text-gray-700">
              Discover destinations, build personalized itineraries, and travel with confidence
              using AI backed by verified local insights.
            </p>
            <Link
              href="/signup"
              className="mt-8 inline-flex items-center justify-center rounded-2xl border-2 border-white bg-brand-600/30 px-16 py-4 text-xl text-white shadow-lg backdrop-blur-sm transition hover:bg-brand-600/40"
            >
              Start Here
            </Link>
          </div>

          <dl className="mt-20 flex flex-wrap gap-10">
            {STATS.map((stat) => (
              <div key={stat.label}>
                <dt className="sr-only">{stat.label}</dt>
                <dd>
                  <span className="block text-5xl font-semibold text-white">{stat.value}</span>
                  <span className="text-lg font-light text-white/90">{stat.label}</span>
                </dd>
              </div>
            ))}
          </dl>
        </section>
      </div>
    </main>
  );
}
