import Link from 'next/link'
import {
  ArrowRight,
  MapPinned,
  ShieldCheck,
  Wallet,
  MessageSquareText,
  CloudSun,
  BookmarkCheck,
} from 'lucide-react'
import { SiteHeader } from '@/components/marketing/SiteHeader'
import { SiteFooter } from '@/components/marketing/SiteFooter'
import { MountainBackdrop } from '@/components/marketing/MountainBackdrop'

const stats = [
  { value: '40+', label: 'Itineraries built' },
  { value: '120+', label: 'Countries Covered' },
  { value: '4.9', label: 'Traveler Ratings' },
]

const features = [
  {
    icon: MessageSquareText,
    title: 'Just tell it what you want',
    description: 'Describe your trip in plain English — budget, pace, who’s coming — and SmartJourney fills in the rest.',
  },
  {
    icon: ShieldCheck,
    title: 'Verified listings only',
    description: 'Every hotel, restaurant, and attraction is checked before it can appear in your plan — no dead links, no scams.',
  },
  {
    icon: CloudSun,
    title: 'Weather-aware routing',
    description: 'Live forecasts and disaster alerts reroute your itinerary automatically when conditions change.',
  },
  {
    icon: Wallet,
    title: 'Budgets that hold up',
    description: 'Set a number and SmartJourney plans inside it — with a running tracker so you never lose the thread.',
  },
  {
    icon: MapPinned,
    title: 'A map for every day',
    description: 'Each itinerary comes with a day-by-day route so you can see exactly how the trip flows before you go.',
  },
  {
    icon: BookmarkCheck,
    title: 'Save and revisit',
    description: 'Keep every plan — upcoming, drafts, and past trips — in one place, synced across devices.',
  },
]

export default function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <div className="relative overflow-hidden">
        <MountainBackdrop className="absolute inset-0 -z-10 h-full w-full" />
        <SiteHeader />

        <section className="relative mx-auto flex min-h-[820px] max-w-7xl flex-col justify-center px-4 py-20 sm:px-6 lg:px-8">
          <div className="max-w-2xl">
            <h1 className="font-display text-6xl font-bold leading-[0.95] text-royal-900 sm:text-7xl lg:text-8xl">
              SmartJourney
            </h1>
            <p className="mt-6 text-2xl font-medium text-gray-800 sm:text-3xl">
              AI-Powered Travel Planning
            </p>
            <p className="mt-4 max-w-xl text-base text-gray-600 sm:text-lg">
              Discover destinations, build personalized itineraries, and travel with confidence
              using AI backed by verified local insights.
            </p>
            <Link
              href="/signup"
              className="group mt-8 inline-flex items-center gap-2 rounded-xl border border-white/60 bg-mist-500/70 px-7 py-4 text-base font-semibold text-white shadow-lg shadow-mist-900/20 backdrop-blur-sm transition hover:bg-mist-500/90"
            >
              Start Here
              <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
            </Link>

            <dl className="mt-16 grid max-w-lg grid-cols-3 gap-6">
              {stats.map((stat) => (
                <div key={stat.label}>
                  <dt className="sr-only">{stat.label}</dt>
                  <dd className="font-display text-3xl font-bold text-white drop-shadow sm:text-4xl">
                    {stat.value}
                  </dd>
                  <p className="mt-1 text-sm text-white/90 drop-shadow">{stat.label}</p>
                </div>
              ))}
            </dl>
          </div>
        </section>
      </div>

      <section className="section bg-white">
        <div className="container-main">
          <div className="mx-auto max-w-2xl text-center">
            <span className="badge-primary">Why SmartJourney</span>
            <h2 className="mt-4 font-display text-3xl font-bold text-gray-900 sm:text-4xl">
              Everything a trip needs, planned in minutes
            </h2>
            <p className="mt-3 text-gray-600">
              One conversation gets you a verified, budget-checked, weather-aware itinerary —
              ready to save and share.
            </p>
          </div>

          <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((feature) => (
              <div key={feature.title} className="card-hover p-6">
                <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-royal-50 text-royal-700">
                  <feature.icon className="h-5 w-5" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">{feature.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-royal-900 py-16">
        <div className="container-main flex flex-col items-center justify-between gap-6 text-center sm:flex-row sm:text-left">
          <div>
            <h2 className="font-display text-2xl font-bold text-white sm:text-3xl">
              Ready to plan your next trip?
            </h2>
            <p className="mt-2 text-royal-200">Free to start. No credit card required.</p>
          </div>
          <Link href="/signup" className="btn-gradient px-8 py-3.5 text-base">
            Start Here <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </div>
      </section>

      <SiteFooter />
    </div>
  )
}
