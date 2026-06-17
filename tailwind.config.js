/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Outfit', 'Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      colors: {
        mundialYellow: '#FCD116',
        mundialBlue: '#003893',
        mundialRed: '#CE1126',
        mundialGold: '#F6D365',
      },
      boxShadow: {
        sports: '0 10px 25px rgba(0, 0, 0, 0.12)',
        'glow-yellow': '0 0 20px rgba(252, 209, 22, 0.3), 0 0 60px rgba(252, 209, 22, 0.1)',
        'glow-blue': '0 0 20px rgba(0, 56, 147, 0.3)',
        'glow-red': '0 0 20px rgba(206, 17, 38, 0.3)',
        glass: '0 8px 32px rgba(0, 0, 0, 0.25), inset 0 1px 0 rgba(255, 255, 255, 0.06)',
        'glass-lg': '0 16px 48px rgba(0, 0, 0, 0.35), inset 0 1px 0 rgba(255, 255, 255, 0.08)',
      },
      backdropBlur: {
        xs: '4px',
        glass: '16px',
        'glass-lg': '24px',
      },
      animation: {
        shimmer: 'shimmer 3s linear infinite',
        float: 'float 4s ease-in-out infinite',
        'glow-pulse': 'glow-pulse 2.5s ease-in-out infinite',
        'gradient-shift': 'gradient-shift 4s ease infinite',
      },
      keyframes: {
        shimmer: {
          '0%': { backgroundPosition: '-200% center' },
          '100%': { backgroundPosition: '200% center' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-12px)' },
        },
        'glow-pulse': {
          '0%, 100%': { boxShadow: '0 0 8px rgba(252, 209, 22, 0.15)' },
          '50%': { boxShadow: '0 0 24px rgba(252, 209, 22, 0.35)' },
        },
        'gradient-shift': {
          '0%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
          '100%': { backgroundPosition: '0% 50%' },
        },
      },
    },
  },
  plugins: [],
}
