/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#eff6ff',
          100: '#dbeafe',
          500: '#1e40af',
          600: '#1d4ed8',
          700: '#1e3a8a',
        },
        navy: '#0F172A',
        gold: '#F59E0B',
      },
    },
  },
  plugins: [],
}

