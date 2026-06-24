/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        darkBg: '#0B0F19',
        darkCard: '#151C2C',
        darkCardBorder: 'rgba(255, 255, 255, 0.08)',
        neonCyan: '#06B6D4',
        neonTeal: '#10B981',
        neonIndigo: '#6366F1',
        neonWarning: '#F59E0B',
        neonCritical: '#EF4444'
      },
      boxShadow: {
        'glow-cyan': '0 0 15px rgba(6, 182, 212, 0.15)',
        'glow-teal': '0 0 15px rgba(16, 185, 129, 0.15)',
        'glow-indigo': '0 0 15px rgba(99, 102, 241, 0.15)'
      }
    },
  },
  plugins: [],
}
