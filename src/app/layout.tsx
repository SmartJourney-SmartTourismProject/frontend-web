import type { Metadata } from 'next';
import { Alexandria, Fraunces } from 'next/font/google';
import './globals.css';
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
  title: 'SmartJourney',
  description: 'AI-powered trip planning for Sri Lanka',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${fraunces.variable} ${alexandria.variable} h-full antialiased`}>
      <body className="min-h-full bg-white font-sans text-gray-900">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
