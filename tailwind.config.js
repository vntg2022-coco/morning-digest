/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        navy: {
          DEFAULT: '#0D1B3E',
          mid: '#1A2F5E',
          light: '#2A4480',
        },
        accent: {
          DEFAULT: '#2563EB',
          light: '#EFF4FF',
        }
      }
    },
  },
  plugins: [],
}
