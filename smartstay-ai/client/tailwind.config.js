/*** Tailwind config ***/
/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    './index.html',
    './src/**/*.{js,jsx,ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        neon: {
          500: '#00E5FF',
          700: '#00B8D4'
        }
      }
    },
  },
  plugins: [],
}
