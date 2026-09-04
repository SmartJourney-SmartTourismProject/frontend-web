/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Deep purple brand scale (sampled from the SmartJourney Figma —
        // hero wordmark, sidebars, admin nav)
        royal: {
          50: '#f6f3fb',
          100: '#ece3f5',
          200: '#d5c1e8',
          300: '#b795d3',
          400: '#9868bb',
          500: '#7c2d92',
          600: '#6b1f7a',
          700: '#5a1968',
          800: '#4c1d75',
          900: '#3a1257',
          950: '#250a38',
        },
        // Pink/magenta accent scale (sampled from CTA button gradients)
        berry: {
          50: '#fdf2f9',
          100: '#fce7f3',
          200: '#f9c9e4',
          300: '#f3a0cd',
          400: '#e56dab',
          500: '#c64d9e',
          600: '#a8357f',
          700: '#8a2967',
          800: '#712155',
          900: '#5c1c46',
          950: '#360f28',
        },
        // Muted blue-slate used on the landing/auth header bars
        mist: {
          50: '#f4f6f8',
          100: '#e6eaef',
          200: '#c7d0da',
          300: '#a3b1c1',
          400: '#8294a5',
          500: '#647d94',
          600: '#526278',
          700: '#434f60',
          800: '#38414d',
          900: '#2f3640',
        },
        // Kept so any legacy component classes referencing these still resolve
        primary: {
          50: '#f6f3fb', 100: '#ece3f5', 200: '#d5c1e8', 300: '#b795d3',
          400: '#9868bb', 500: '#7c2d92', 600: '#6b1f7a', 700: '#5a1968',
          800: '#4c1d75', 900: '#3a1257',
        },
        secondary: {
          50: '#fef3c7', 100: '#fde68a', 200: '#fcd34d', 300: '#fbbf24',
          400: '#f59e0b', 500: '#d97706', 600: '#b45309', 700: '#92400e',
          800: '#78350f', 900: '#63300b',
        },
        accent: {
          50: '#fdf2f9', 100: '#fce7f3', 200: '#f9c9e4', 300: '#f3a0cd',
          400: '#e56dab', 500: '#c64d9e', 600: '#a8357f', 700: '#8a2967',
          800: '#712155', 900: '#5c1c46',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Playfair Display', 'Cal Sans', 'Georgia', 'serif'],
      },
      backgroundImage: {
        'brand-gradient': 'linear-gradient(90deg, #c64d9e 0%, #4c1d75 100%)',
        'brand-gradient-vert': 'linear-gradient(180deg, #c64d9e 0%, #4c1d75 100%)',
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-out',
        'slide-up': 'slideUp 0.5s ease-out',
        'slide-down': 'slideDown 0.3s ease-out',
        'scale-in': 'scaleIn 0.2s ease-out',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideDown: {
          '0%': { opacity: '0', transform: 'translateY(-10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        scaleIn: {
          '0%': { opacity: '0', transform: 'scale(0.95)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
      },
    },
  },
  plugins: [],
}
