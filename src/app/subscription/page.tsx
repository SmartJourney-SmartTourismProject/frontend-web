'use client'

import { Check } from 'lucide-react'
import toast from 'react-hot-toast'
import { SettingsShell } from '@/components/settings/SettingsShell'
import { useSubscriptionStore } from '@/lib/store'
import { cn } from '@/lib/utils'
import type { SubscriptionPlanId } from '@/types/app'

const PLANS: {
  id: SubscriptionPlanId
  name: string
  price: string
  blurb: string
  features: string[]
  highlight?: boolean
}[] = [
  {
    id: 'free',
    name: 'Free',
    price: '$0',
    blurb: 'Get started with the basics',
    features: ['Up to 3 saved itineraries / month', 'Verified listings only', 'Basic weather check', 'Standard support'],
  },
  {
    id: 'lite',
    name: 'Lite',
    price: '$4.99',
    blurb: 'For travelers planning often',
    features: ['Unlimited saved itineraries', 'Budget tracker & alerts', 'Live weather rerouting', 'Priority support'],
  },
  {
    id: 'pro',
    name: 'Pro',
    price: '$9.99',
    blurb: 'Full concierge-level planning',
    features: ['Everything in Lite', 'Offline maps & itineraries', 'Real-time itinerary rerouting', 'Dedicated trip concierge'],
    highlight: true,
  },
]

export default function SubscriptionPage() {
  const { planId, tripsUsedThisMonth, setPlan } = useSubscriptionStore()
  const current = PLANS.find((p) => p.id === planId)!

  return (
    <SettingsShell title="Subscription" subtitle="Pick the plan that fits how you travel">
      <div className="mb-6 flex items-center gap-3 rounded-xl bg-royal-50 px-4 py-3">
        <span className="rounded-full bg-royal-800 px-2.5 py-1 text-[10px] font-bold uppercase text-white">
          {current.name}
        </span>
        <p className="text-sm font-medium text-gray-700">
          You&rsquo;re on the {current.name} plan · {tripsUsedThisMonth} of {planId === 'free' ? 3 : '∞'} trips used this month
        </p>
      </div>

      <div className="grid gap-5 sm:grid-cols-3">
        {PLANS.map((plan) => (
          <div
            key={plan.id}
            className={cn(
              'flex flex-col rounded-2xl border p-5',
              plan.highlight
                ? 'border-transparent bg-brand-gradient text-white shadow-lg'
                : 'border-gray-200 bg-white'
            )}
          >
            <p className="font-display text-lg font-bold">{plan.name}</p>
            <p className="mt-2 text-3xl font-bold">
              {plan.price}
              <span className={cn('text-sm font-medium', plan.highlight ? 'text-white/80' : 'text-gray-400')}> /month</span>
            </p>
            <p className={cn('mt-1 text-sm', plan.highlight ? 'text-white/80' : 'text-gray-400')}>{plan.blurb}</p>
            <ul className="mt-4 flex-1 space-y-2 text-sm">
              {plan.features.map((f) => (
                <li key={f} className="flex items-start gap-2">
                  <Check className={cn('mt-0.5 h-3.5 w-3.5 shrink-0', plan.highlight ? 'text-white' : 'text-green-600')} />
                  <span className={plan.highlight ? 'text-white/90' : 'text-gray-600'}>{f}</span>
                </li>
              ))}
            </ul>
            <button
              onClick={() => {
                setPlan(plan.id)
                toast.success(`Switched to ${plan.name}`)
              }}
              disabled={plan.id === planId}
              className={cn(
                'mt-5 rounded-xl py-2.5 text-sm font-semibold transition disabled:cursor-default',
                plan.id === planId
                  ? plan.highlight
                    ? 'bg-white/20 text-white'
                    : 'bg-royal-50 text-royal-400'
                  : plan.highlight
                    ? 'bg-white text-royal-800 hover:bg-white/90'
                    : 'border border-gray-300 text-gray-700 hover:bg-gray-50'
              )}
            >
              {plan.id === planId ? 'Current plan' : `Upgrade to ${plan.name}`}
            </button>
          </div>
        ))}
      </div>
      <p className="mt-5 text-center text-xs text-gray-400">Cancel anytime · Prices shown exclude local taxes</p>
    </SettingsShell>
  )
}
