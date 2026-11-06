/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./*.html",
    "./script.js"
  ],
  theme: {
    container: {
      center: true,
      padding: { DEFAULT: '1.25rem', sm: '1.5rem', lg: '2rem' },
      screens: { sm: '640px', md: '768px', lg: '1024px', xl: '1200px' },
    },
    extend: {
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        display: ['Poppins', 'Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      colors: {
        navy: {
          950: '#07142b',
          900: '#0b1f3a',
          800: '#122a4d',
        },
      },
      boxShadow: {
        brand: '0 20px 40px -10px rgba(30, 64, 175, 0.25)',
      },
    },
  },
  plugins: [],
};
