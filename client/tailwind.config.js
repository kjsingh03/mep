/** @type {import('tailwindcss').Config} */
export default {
    content: [
      "./index.html",
      "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
      extend: {},
      screens: {
        'xxs':'375px',
        'xs':'475px',
        'sm': '640px',
        'md': '769px',
        'lg': '1024px',
        'xlg': '1164px',
        'xl': '1280px',
        '2xl': '1536px',
        '3xl':'1720px',
        '4xl':'1900px',
        '5xl':'2060px',
        '6xl':'2200px',
        '7xl':'2400px'
      }
    },
    plugins: [],
  }