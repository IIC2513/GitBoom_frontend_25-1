/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        'green-dark': '#1d311e',
        'green-medium': '#557e35',
        'green-light': '#a4c766',
        'beige': '#e8c3a4',
        'gray-custom': '#7b7b7b',
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
};