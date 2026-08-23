/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        bg: '#F5E6CA',
        primary: '#8B4513',
        accent: '#A0522D',
        secondary: '#D2B48C',
        darker: '#5D3A1A',
      },
      fontFamily: {
        typewriter: ['"Special Elite"', 'cursive'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['"Playfair Display"', 'serif'],
      },
    },
  },
  plugins: [],
}
