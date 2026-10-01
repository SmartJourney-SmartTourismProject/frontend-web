import type { Metadata } from 'next';
import { Alexandria, Fraunces } from 'next/font/google';
import './globals.css';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { Providers } from './providers';

// Fraunces (serif, headings/logo) + Alexandria (sans, body) match the brand
// typography used throughout the Figma mockups (frontend-web/figma/).
const fraunces = Fraunces({ subsets: ['latin'], variable: '--font-serif', weight: ['500', '600'] });
const alexandria = Alexandria({
  subsets: ['latin'],
  variable: '--font-sans',
  weight: ['300', '400', '500', '600'],
});

export const metadata: Metadata = {
  // Resolves relative Open Graph image URLs (set NEXT_PUBLIC_SITE_URL in production).
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'),
  title: 'SmartJourney',
  description: 'AI-powered trip planning for Sri Lanka',
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  // Read once per request here so SessionProvider starts hydrated (see providers.tsx).
  const session = await getServerSession(authOptions);
  return (
    <html lang="en" className={`${fraunces.variable} ${alexandria.variable} h-full antialiased`}>
      <body className="min-h-full bg-white font-sans text-gray-900">
        <Providers session={session}>{children}</Providers>
      </body>
    </html>
  );
}
