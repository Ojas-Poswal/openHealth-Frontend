/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        // Brand palette sampled from the openHealth logo.
        ink: {
          950: '#040A14',
          900: '#071120',
          800: '#0B1A2E',
          700: '#102340',
          600: '#16304F',
        },
        brand: {
          50: '#E6FBFF',
          100: '#C2F3FE',
          200: '#8AE7FC',
          300: '#4FD8F7',
          400: '#22C6EE',
          500: '#0EA5D6',
          600: '#0B7FB4',
          700: '#0C6690',
        },
        mint: {
          300: '#6EE7B7',
          400: '#34D399',
          500: '#10B981',
          600: '#059669',
        },
        royal: {
          400: '#60A5FA',
          500: '#3B82F6',
          600: '#2563EB',
          700: '#1D4ED8',
        },
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        display: ['"Plus Jakarta Sans"', 'Inter', 'sans-serif'],
      },
      boxShadow: {
        glow: '0 0 0 1px rgba(34,198,238,0.18), 0 18px 48px -24px rgba(34,198,238,0.55)',
        card: '0 1px 0 0 rgba(255,255,255,0.04) inset, 0 20px 40px -28px rgba(0,0,0,0.9)',
      },
      backgroundImage: {
        'brand-gradient': 'linear-gradient(120deg, #22C6EE 0%, #3B82F6 48%, #34D399 100%)',
        'brand-soft':
          'linear-gradient(135deg, rgba(34,198,238,0.16) 0%, rgba(59,130,246,0.12) 50%, rgba(52,211,153,0.14) 100%)',
        grid: 'linear-gradient(rgba(148,197,255,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(148,197,255,0.06) 1px, transparent 1px)',
      },
      keyframes: {
        'fade-in': {
          from: { opacity: '0', transform: 'translateY(6px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        'scale-in': {
          from: { opacity: '0', transform: 'scale(0.97)' },
          to: { opacity: '1', transform: 'scale(1)' },
        },
        shimmer: {
          '100%': { transform: 'translateX(100%)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
      },
      animation: {
        'fade-in': 'fade-in 0.28s ease-out both',
        'scale-in': 'scale-in 0.18s ease-out both',
        shimmer: 'shimmer 1.6s infinite',
        float: 'float 6s ease-in-out infinite',
      },
    },
  },
  plugins: [],
}
