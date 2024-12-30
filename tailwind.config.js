/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      screens: {
        'md': '1024px',
      },
      fontFamily: {
        mono: [
          'var(--font-azeret)',
          'var(--font-jetbrains)',
          'monospace'
        ],
      },
      animation: {
        'marquee-left': 'marquee-left 25s linear infinite',
        'marquee-right': 'marquee-right 25s linear infinite',
        'text-marquee-left': 'text-marquee-left 40s linear infinite',
        'text-marquee-right': 'text-marquee-right 40s linear infinite',
      },
      keyframes: {
        'marquee-left': {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(-2240px)' }
        },
        'marquee-right': {
          '0%': { transform: 'translateX(-2240px)' },
          '100%': { transform: 'translateX(0)' }
        },
        'text-marquee-left': {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(-4079px)' } // Фиксированное значение для текста
        },
        'text-marquee-right': {
          '0%': { transform: 'translateX(-4079px)' },
          '100%': { transform: 'translateX(0)' }
        }
      }
    },
  },
  plugins: [],
}