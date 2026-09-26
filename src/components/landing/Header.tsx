'use client';

import Link from 'next/link';
import { Plane } from 'lucide-react';

const NAV_LINKS = [
  { href: '#features', label: 'Features' },
  { href: '#how-it-works', label: 'How it works' },
  { href: '#why-us', label: 'Why SmartJourney' },
];

export function Header() {
  return (
    <header className="absolute inset-x-0 top-0 z-30 flex items-center justify-between bg-black/30 px-6 py-4 backdrop-blur-md sm:px-10">
      <div className="flex items-center gap-2">
        <Plane className="h-7 w-7 rotate-45 text-sky-300" />
        <span className="font-serif text-2xl font-semibold text-white">SmartJourney</span>
      </div>

      <nav className="hidden items-center gap-8 md:flex">
        {NAV_LINKS.map((link) => (
          <a
            key={link.href}
            href={link.href}
            className="text-sm font-medium text-white/85 transition hover:text-white"
          >
            {link.label}
          </a>
        ))}
      </nav>

      <div className="flex items-center gap-3">
        <Link
          href="/login"
          className="rounded-xl border border-white px-5 py-2.5 text-sm font-bold text-white transition duration-200 hover:bg-white/10 sm:px-6"
        >
          Log In
        </Link>
        <Link
          href="/signup"
          className="rounded-xl bg-brand-gradient px-5 py-2.5 text-sm font-bold text-white shadow-md transition duration-200 hover:shadow-lg hover:brightness-110 active:scale-[0.97] sm:px-6"
        >
          Sign Up
        </Link>
      </div>
    </header>
  );
}
