/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-sans)', 'system-ui', 'sans-serif'],
        serif: ['var(--font-serif)', 'Georgia', 'serif'],
      },
      colors: {
        // Exact values from the Figma exports (frontend-web/figma/landing/index.tsx):
        // deep purple for headings/sidebar, pink-to-purple gradient for CTAs.
        brand: {
          50: '#f5f1fa',
          100: '#e6dcf2',
          200: '#c9b3e2',
          300: '#a988d0',
          400: '#7a58ab',
          500: '#5c3d8c',
          600: '#412874',
          700: '#391f66',
          800: '#2d1852',
          900: '#221240',
        },
        accent: {
          500: '#d552a3',
          600: '#c23e8f',
        },
      },
      backgroundImage: {
        'brand-gradient': 'linear-gradient(171deg, #d552a3 0%, #412874 100%)',
      },
    },
  },
  plugins: [],
};
