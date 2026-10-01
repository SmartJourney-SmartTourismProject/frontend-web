'use client';

import { useEffect, useState } from 'react';
import { Plane } from 'lucide-react';
import clsx from 'clsx';
import { AuthLaunchButton } from '@/components/auth/AuthLaunchButton';

const NAV_LINKS = [
  { href: '#destinations', label: 'Destinations' },
  { href: '#how-it-works', label: 'How it works' },
  { href: '#features', label: 'Features' },
];

export function Header() {
  // Condenses once the page scrolls: tighter padding, smaller logo and a
  // white background so it stays readable over any section.
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <header
      className={clsx(
        'fixed inset-x-0 top-0 z-30 flex items-center justify-between px-6 backdrop-blur-xl transition-all duration-300 sm:px-10',
        scrolled
          ? 'border-b border-brand-100 bg-white/95 py-2 shadow-lg shadow-brand-900/10'
          : 'border-b border-brand-100/60 bg-white/90 py-4',
      )}
    >
      <div className="flex items-center gap-2">
        <Plane
          className={clsx(
            'rotate-45 text-brand-500 transition-all duration-300',
            scrolled ? 'h-6 w-6' : 'h-7 w-7',
          )}
        />
        <span
          className={clsx(
            'font-serif font-semibold text-brand-700 transition-all duration-300',
            scrolled ? 'text-lg sm:text-xl' : 'text-xl sm:text-2xl',
          )}
        >
          SmartJourney
        </span>
      </div>

      <nav className="hidden items-center gap-8 md:flex">
        {NAV_LINKS.map((link) => (
          <a
            key={link.href}
            href={link.href}
            className="text-sm font-medium text-gray-600 transition hover:text-brand-600"
          >
            {link.label}
          </a>
        ))}
      </nav>

      <div className="flex items-center gap-2 sm:gap-3">
        <AuthLaunchButton
          mode="login"
          className="whitespace-nowrap rounded-xl border border-brand-500 px-3 py-2 text-sm font-bold text-brand-600 sm:py-2.5 transition duration-200 hover:scale-[1.03] hover:bg-brand-50 sm:px-6"
        >
          Log In
        </AuthLaunchButton>
        <AuthLaunchButton
          mode="signup"
          className="whitespace-nowrap rounded-xl bg-brand-gradient px-3 py-2 text-sm font-bold text-white sm:py-2.5 shadow-md transition duration-200 hover:scale-[1.03] hover:shadow-glow active:scale-[0.97] sm:px-6"
        >
          Sign Up
        </AuthLaunchButton>
      </div>
    </header>
  );
}
