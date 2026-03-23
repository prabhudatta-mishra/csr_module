/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{html,ts,scss}",
  ],
  theme: {
    extend: {
      colors: {
        csr: {
          green: {
            DEFAULT: '#16a34a', // emerald-600
            50: '#ecfdf5', 100: '#d1fae5', 200: '#a7f3d0', 300: '#6ee7b7', 400: '#34d399', 500: '#10b981', 600: '#16a34a', 700: '#15803d', 800: '#166534', 900: '#14532d'
          },
          teal: {
            DEFAULT: '#0d9488', // teal-600
          }
        }
      }
    }
  },
  plugins: [],
};
