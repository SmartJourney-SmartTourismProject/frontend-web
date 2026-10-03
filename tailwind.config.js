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
        // Exact values from the Figma exports (Documentation/Design/UI_Mockups/landing/index.tsx):
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
        // Wide version for animated gradient-shift (background-size: 200%).
        'brand-gradient-wide': 'linear-gradient(90deg, #d552a3, #7a58ab, #412874, #d552a3)',
      },
      boxShadow: {
        glow: '0 0 24px rgba(213, 82, 163, 0.45)',
        'glow-lg': '0 0 40px rgba(213, 82, 163, 0.6)',
      },
      keyframes: {
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        drift: {
          '0%': { transform: 'translateX(-6%)' },
          '50%': { transform: 'translateX(6%)' },
          '100%': { transform: 'translateX(-6%)' },
        },
        shake: {
          '0%, 100%': { transform: 'translateX(0)' },
          '20%, 60%': { transform: 'translateX(-6px)' },
          '40%, 80%': { transform: 'translateX(6px)' },
        },
        marquee: {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(-50%)' },
        },
        'pulse-ring': {
          '0%': { transform: 'scale(0.6)', opacity: '0.8' },
          '100%': { transform: 'scale(2.2)', opacity: '0' },
        },
        'gradient-shift': {
          '0%, 100%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
        },
        'marker-drop': {
          '0%': { transform: 'translateY(-40px)', opacity: '0' },
          '60%': { transform: 'translateY(4px)', opacity: '1' },
          '80%': { transform: 'translateY(-4px)' },
          '100%': { transform: 'translateY(0)' },
        },
        'typing-dot': {
          '0%, 80%, 100%': { transform: 'translateY(0)', opacity: '0.4' },
          '40%': { transform: 'translateY(-4px)', opacity: '1' },
        },
        'glow-pulse': {
          '0%, 100%': { boxShadow: '0 0 12px rgba(213, 82, 163, 0.3)' },
          '50%': { boxShadow: '0 0 28px rgba(213, 82, 163, 0.65)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-8px)' },
        },
      },
      animation: {
        shimmer: 'shimmer 2s linear infinite',
        drift: 'drift 70s ease-in-out infinite',
        'drift-slow': 'drift 110s ease-in-out infinite reverse',
        shake: 'shake 0.5s ease-in-out 1',
        marquee: 'marquee 50s linear infinite',
        'pulse-ring': 'pulse-ring 1.8s ease-out infinite',
        'gradient-shift': 'gradient-shift 6s ease-in-out infinite',
        'marker-drop': 'marker-drop 0.6s ease-out both',
        'typing-dot': 'typing-dot 1.2s ease-in-out infinite',
        'glow-pulse': 'glow-pulse 3s ease-in-out infinite',
        float: 'float 4s ease-in-out infinite',
      },
    },
  },
  plugins: [],
};
