/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        'primary': {
          black: '#202020',
          white: '#FFFFFF',
        },
        'text': {
          primary: '#202020',
          secondary: '#606060',
          light: '#E9E9E9',
          gray: '#A9A9A9',
        },
        'accent': {
          yellow: '#F9E52C',
          blue: '#4801FF',
          pink: '#FF92B9',
          green: '#005544',
          purple: '#D26BFF',
          orange: '#F3A73A',
          burgundy: '#8B1933',
        }
      },
      keyframes: {
        'spin-slot': {
          '0%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-2px)' }
        },
        'blur-in': {
          '0%': { filter: 'blur(0)' },
          '100%': { filter: 'blur(2px)' }
        },
        'blur-out': {
          '0%': { filter: 'blur(2px)' },
          '100%': { filter: 'blur(0)' }
        },
        'slot-spin': {
          '0%': { transform: 'translateY(-20%)' },
          '100%': { transform: 'translateY(0)' }
        },
        'slot-stop': {
          '0%': { transform: 'translateY(-33.333%)' },
          '100%': { transform: 'translateY(-66.666%)' }
        },
        'marquee-left': {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(-955px)' }
        },
        'marquee-right': {
          '0%': { transform: 'translateX(-955px)' },
          '100%': { transform: 'translateX(0)' }
        }
      },
      animation: {
        'spin-slot': 'spin-slot 0.2s ease-in-out infinite',
        'blur-in': 'blur-in 0.2s ease-in forwards',
        'blur-out': 'blur-out 0.2s ease-out forwards',
        'slot-spin': 'slot-spin 0.3s linear infinite',
        'slot-stop': 'slot-stop 0.3s ease-out forwards',
        'marquee-left': 'marquee-left 20s linear infinite',
        'marquee-right': 'marquee-right 20s linear infinite'
      },
      transitionProperty: {
        'blur': 'filter'
      },
      blur: {
        'xs': '1px',
        'sm': '2px'
      },
      boxShadow: {
        'slot': '0px 1px 5px rgba(0,0,0,0.20), inset 0px 0px 10px rgba(0,0,0,0.05)'
      },
      transitionTimingFunction: {
        'slot-ease': 'cubic-bezier(0.33, 1, 0.68, 1)'
      }
    },
  },
  plugins: [],
}