// tailwind.config.js
module.exports = {
  purge: [
    './src/**/*.{js,jsx,ts,tsx}',
    './public/index.html'
  ],
  darkMode: false,
  theme: {
    fontFamily: {
      'sans': ['Poppins', 'ui-sans-serif', 'system-ui'],
    },
    screens: {
      'sm': '640px',
      'md': '768px',
      'lg': '992px',
      'xl': '980px',
      '2xl': '1150px',
    },
    extend: {},
  },
  variants: {
    extend: {},
  },
  plugins: [],
}