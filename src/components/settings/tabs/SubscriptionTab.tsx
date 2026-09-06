import { Check } from 'lucide-react';

// Static, per smartjourney-ui-build-decisions memory: subscription/
// subscription_plan tables stay deferred, no billing, no quota
// enforcement - this is a pricing page, not a working paywall.
const PLANS = [
  {
    id: 'free',
    name: 'Free',
    price: '$0',
    tagline: 'Get started with the basics',
    features: [
      'Up to 3 saved itineraries / month',
      'Verified listings only',
      'Basic weather check',
      'Standard support',
    ],
    current: true,
  },
  {
    id: 'lite',
    name: 'Lite',
    price: '$4.99',
    tagline: 'For travelers planning often',
    features: ['Unlimited saved itineraries', 'Budget tracker & alerts', 'Live weather rerouting', 'Priority support'],
    current: false,
  },
  {
    id: 'pro',
    name: 'Pro',
    price: '$9.99',
    tagline: 'Full concierge-level planning',
    features: [
      'Everything in Lite',
      'Offline maps & itineraries',
      'Real-time itinerary rerouting',
      'Dedicated trip concierge',
    ],
    current: false,
    highlight: true,
  },
];

export function SubscriptionTab() {
  return (
    <div>
      <div className="mb-6 flex items-center gap-3 rounded-2xl bg-brand-50 px-4 py-3">
        <span className="rounded-full bg-brand-gradient px-2.5 py-1 text-[10px] font-bold text-white">
          FREE
        </span>
        <p className="text-sm text-gray-700">
          You&apos;re on the Free plan · <span className="text-gray-500">2 of 3 trips used this month</span>
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {PLANS.map((plan) => (
          <div
            key={plan.id}
            className={`flex flex-col rounded-2xl border p-5 ${
              plan.highlight
                ? 'bg-brand-gradient text-white'
                : 'border-gray-200 text-gray-900'
            }`}
          >
            <h3 className="font-serif text-lg font-semibold">{plan.name}</h3>
            <p className="mt-1 text-2xl font-bold">
              {plan.price}
              <span className={`text-sm font-normal ${plan.highlight ? 'text-white/80' : 'text-gray-500'}`}>
                /month
              </span>
            </p>
            <p className={`mt-1 text-xs ${plan.highlight ? 'text-white/80' : 'text-gray-500'}`}>
              {plan.tagline}
            </p>

            <ul className="mt-4 flex flex-1 flex-col gap-2">
              {plan.features.map((feature) => (
                <li key={feature} className="flex items-start gap-2 text-xs">
                  <Check className={`mt-0.5 h-3.5 w-3.5 shrink-0 ${plan.highlight ? 'text-white' : 'text-brand-600'}`} />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>

            <button
              disabled={plan.current}
              className={`mt-5 rounded-xl px-4 py-2 text-sm font-semibold transition ${
                plan.current
                  ? 'border border-gray-200 text-gray-400'
                  : plan.highlight
                    ? 'bg-white text-brand-700 hover:opacity-90'
                    : 'border border-gray-300 text-gray-700 hover:bg-gray-50'
              }`}
            >
              {plan.current ? 'Current plan' : `Upgrade to ${plan.name}`}
            </button>
          </div>
        ))}
      </div>

      <p className="mt-5 text-center text-xs text-gray-400">Cancel anytime · Prices shown exclude local taxes</p>
    </div>
  );
}
