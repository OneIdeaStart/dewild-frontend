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
          '100%': { transform: 'translateX(-903px)' }
        },
        'marquee-right': {
          '0%': { transform: 'translateX(-903px)' },
          '100%': { transform: 'translateX(0)' }
        },
        'reveal': {
          '0%': { 
            opacity: '0',
            transform: 'scaleY(0)',
            transformOrigin: 'bottom'
          },
          '70%': {
            opacity: '1',
            transform: 'scaleY(1.1)',
            transformOrigin: 'bottom'
          },
          '85%': {
            transform: 'scaleY(0.95)',
            transformOrigin: 'bottom'
          },
          '95%': {
            transform: 'scaleY(1.02)',
            transformOrigin: 'bottom'
          },
          '100%': { 
            opacity: '1',
            transform: 'scaleY(1)',
            transformOrigin: 'bottom'
          }
        },
        'slot-reveal': {
          '0%': { 
            opacity: '0',
            transform: 'scale(0.3)',
          },
          '20%': {
            opacity: '1',
          },
          '70%': {
            opacity: '1',
            transform: 'scale(1.1)',
          },
          '85%': {
            opacity: '1',
            transform: 'scale(0.95)',
          },
          '95%': {
            opacity: '1',
            transform: 'scale(1.02)',
          },
          '100%': { 
            opacity: '1',
            transform: 'scale(1)',
          }
        },
        'reveal-text': {
          '0%': { 
            opacity: '0',
            clipPath: 'inset(0 100% 0 0)' 
          },
          '10%': {
            opacity: '1',
          },
          '100%': { 
            opacity: '1',
            clipPath: 'inset(0 0 0 0)' 
          }
        },
        'button-fall': {
          '0%': { 
            opacity: '0',
            transform: 'scale(0.3) translateY(0)',
          },
          '2%': {
            opacity: '1',
          },
          '70%': {
            transform: 'scale(1.4)',
          },
          '75%': {
            transform: 'scale(1.5)',
          },
          '80%': {
            transform: 'scale(1.4)',
          },
          '100%': { 
            opacity: '1',
            transform: 'scale(1) translateY(0)',
          }
        },
        'header-slide': {
          '0%': { 
            transform: 'translateY(-100%)',
          },
          '85%': {
            transform: 'translateY(5px)',
          },
          '100%': { 
            transform: 'translateY(0)',
          }
        },
        'dark-slide': {
          '0%': { 
            transform: 'translateY(100%)',
          },
          '100%': { 
            transform: 'translateY(0)',
          }
        }
      },
      animation: {
        'spin-slot': 'spin-slot 0.2s ease-in-out infinite',
        'blur-in': 'blur-in 0.2s ease-in forwards',
        'blur-out': 'blur-out 0.2s ease-out forwards',
        'slot-spin': 'slot-spin 0.3s linear infinite',
        'slot-stop': 'slot-stop 0.3s ease-out forwards',
        'marquee-left': 'marquee-left 20s linear infinite',
        'marquee-right': 'marquee-right 20s linear infinite',
        'reveal': 'reveal 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) forwards',
        'slot-reveal': 'slot-reveal 0.8s cubic-bezier(0.34, 1.56, 0.64, 1) forwards',
        'reveal-text': 'reveal-text 0.5s ease-out forwards',
        'button-fall': 'button-fall 0.5s cubic-bezier(0.1, 0, 0.9, 1) forwards',
        'header-slide': 'header-slide 0.3s cubic-bezier(0.34, 1.56, 0.64, 1) forwards',
        'dark-slide': 'dark-slide 0.3s forwards'
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