/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        mundialYellow: '#FCD116',
        mundialBlue: '#003893',
        mundialRed: '#CE1126',
      },
      boxShadow: {
        sports: '0 10px 25px rgba(0, 0, 0, 0.12)',
      },
    },
  },
  plugins: [],
}
