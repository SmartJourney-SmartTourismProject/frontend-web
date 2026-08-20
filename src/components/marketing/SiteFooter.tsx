import Link from 'next/link'
import { LogoWordmark } from '@/components/ui/Logo'

export function SiteFooter() {
  return (
    <footer className="border-t border-gray-100 bg-white">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="flex flex-col items-start justify-between gap-8 sm:flex-row">
          <div>
            <LogoWordmark textClassName="text-royal-800" />
            <p className="mt-3 max-w-xs text-sm text-gray-500">
              AI-powered travel planning for Sri Lanka — verified listings, real-time weather
              and safety, and budgets that actually add up.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-8 text-sm sm:grid-cols-3">
            <div>
              <p className="mb-3 font-semibold text-gray-900">Product</p>
              <ul className="space-y-2 text-gray-500">
                <li><Link href="/home" className="hover:text-royal-700">Plan a trip</Link></li>
                <li><Link href="/explore" className="hover:text-royal-700">Explore</Link></li>
                <li><Link href="/subscription" className="hover:text-royal-700">Pricing</Link></li>
              </ul>
            </div>
            <div>
              <p className="mb-3 font-semibold text-gray-900">Company</p>
              <ul className="space-y-2 text-gray-500">
                <li><a href="#" className="hover:text-royal-700">About</a></li>
                <li><a href="#" className="hover:text-royal-700">Contact</a></li>
              </ul>
            </div>
            <div>
              <p className="mb-3 font-semibold text-gray-900">Legal</p>
              <ul className="space-y-2 text-gray-500">
                <li><a href="#" className="hover:text-royal-700">Privacy</a></li>
                <li><a href="#" className="hover:text-royal-700">Terms</a></li>
              </ul>
            </div>
          </div>
        </div>
        <div className="mt-10 border-t border-gray-100 pt-6 text-xs text-gray-400">
          © {new Date().getFullYear()} SmartJourney. All rights reserved.
        </div>
      </div>
    </footer>
  )
}
