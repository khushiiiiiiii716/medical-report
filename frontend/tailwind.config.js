/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Poppins', 'Inter', 'sans-serif'],
      },
      colors: {
        darkBg: 'var(--bg-primary)',
        darkCard: 'var(--bg-card)',
        darkCardBorder: 'var(--border-color)',
        medical: {
          50: '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#2563eb',
          600: '#1d4ed8',
          700: '#1e40af',
        },
        health: {
          50: '#ecfdf5',
          100: '#d1fae5',
          400: '#34d399',
          500: '#10b981',
          600: '#059669',
        },
        neonCyan: '#2563EB',
        neonTeal: '#10B981',
        neonIndigo: '#0EA5E9',
        neonWarning: '#F59E0B',
        neonCritical: '#EF4444',
      },
      boxShadow: {
        'glow-cyan': '0 0 20px rgba(37, 99, 235, 0.18)',
        'glow-teal': '0 0 20px rgba(16, 185, 129, 0.18)',
        'glow-indigo': '0 0 20px rgba(14, 165, 233, 0.18)',
        'soft': '0 18px 40px -22px rgba(15, 23, 42, 0.18)',
        'soft-lg': '0 25px 60px -28px rgba(15, 23, 42, 0.22)',
        'card': '0 4px 24px -4px rgba(15, 23, 42, 0.08)',
        'card-hover': '0 12px 40px -12px rgba(37, 99, 235, 0.15)',
      },
      borderRadius: {
        '4xl': '2rem',
        '5xl': '2.5rem',
      },
      keyframes: {
        'fade-in-up': {
          '0%': { opacity: '0', transform: 'translateY(16px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'float': {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-8px)' },
        },
        'pulse-soft': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.7' },
        },
        'shimmer': {
          '0%': { backgroundPosition: '200% 0' },
          '100%': { backgroundPosition: '-200% 0' },
        },
        'scan-line': {
          '0%': { top: '0%' },
          '100%': { top: '100%' },
        },
        'scale-in': {
          '0%': { opacity: '0', transform: 'scale(0.95)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        'slide-in-left': {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(0)' },
        },
      },
      animation: {
        'fade-in-up': 'fade-in-up 0.55s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'fade-in-up-delay-1': 'fade-in-up 0.55s cubic-bezier(0.16, 1, 0.3, 1) 0.1s forwards',
        'fade-in-up-delay-2': 'fade-in-up 0.55s cubic-bezier(0.16, 1, 0.3, 1) 0.2s forwards',
        'fade-in-up-delay-3': 'fade-in-up 0.55s cubic-bezier(0.16, 1, 0.3, 1) 0.3s forwards',
        'fade-in': 'fade-in 0.3s ease forwards',
        'float': 'float 5s ease-in-out infinite',
        'pulse-soft': 'pulse-soft 2s ease-in-out infinite',
        'shimmer': 'shimmer 1.4s infinite',
        'scan-line': 'scan-line 2s linear infinite',
        'scale-in': 'scale-in 0.35s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'slide-in-left': 'slide-in-left 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards',
      },
    },
  },
  plugins: [],
}
