/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        dark: {
          900: '#343434', // Background utama super gelap
        }
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'], // Font modern
      }
    },
  },
  plugins: [],
}
