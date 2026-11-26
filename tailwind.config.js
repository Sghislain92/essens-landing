/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./index.html', './assets/js/**/*.js'],
  theme: {
    extend: {
      colors: {
        deep: '#170407',
        bord: '#3a0a12',
        wine: '#6d0f1f',
        liqueur: '#c0182f',
        gold: '#e9c87c',
        cream: '#fbefe3',
        soft: '#e7c2b8',
        brand: { green: '#0f4d3a', orange: '#f6a04a' },
      },
      fontFamily: {
        display: ['Fraunces', 'Georgia', 'serif'],
        brush: ['"Caveat Brush"', 'cursive'],
        logo: ['"Baloo 2"', 'sans-serif'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      borderColor: { line: 'rgba(233,200,124,.22)' },
      keyframes: {
        marquee: { to: { transform: 'translateX(-50%)' } },
        cue: {
          '0%': { transform: 'scaleY(0)', transformOrigin: 'top' },
          '50%': { transform: 'scaleY(1)', transformOrigin: 'top' },
          '51%': { transformOrigin: 'bottom' },
          '100%': { transform: 'scaleY(0)', transformOrigin: 'bottom' },
        },
      },
      animation: { marquee: 'marquee 30s linear infinite', cue: 'cue 1.8s ease-in-out infinite' },
    },
  },
  plugins: [],
};
