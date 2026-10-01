import Link from 'next/link';
import { Plane } from 'lucide-react';
import { DESTINATIONS } from '@/lib/landing-destinations';

const FOOTER_LINKS = [
  {
    heading: 'Product',
    links: [
      { label: 'Destinations', href: '#destinations' },
      { label: 'Features', href: '#features' },
      { label: 'How it works', href: '#how-it-works' },
    ],
  },
  {
    heading: 'Account',
    links: [
      { label: 'Log In', href: '/login' },
      { label: 'Sign Up', href: '/signup' },
    ],
  },
];

export function Footer() {
  return (
    <footer className="bg-brand-900 px-6 py-14 text-white sm:px-10 lg:px-20">
      <div className="mx-auto flex max-w-6xl flex-col gap-10 sm:flex-row sm:justify-between">
        <div className="max-w-xs">
          <div className="flex items-center gap-2">
            <Plane className="h-6 w-6 rotate-45 text-sky-300" />
            <span className="font-serif text-xl font-semibold">SmartJourney</span>
          </div>
          <p className="mt-3 text-sm text-white/60">
            AI-powered trip planning that adapts to your time, budget, and interests.
          </p>
        </div>

        <div className="flex flex-wrap gap-16">
          {FOOTER_LINKS.map((column) => (
            <div key={column.heading}>
              <p className="text-sm font-semibold uppercase tracking-wide text-white/50">
                {column.heading}
              </p>
              <ul className="mt-4 space-y-2">
                {column.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-sm text-white/75 transition hover:text-white"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      <div className="mx-auto mt-12 max-w-6xl border-t border-white/10 pt-6 text-sm text-white/50">
        © {new Date().getFullYear()} SmartJourney. All rights reserved.
      </div>
    </footer>
  );
}
