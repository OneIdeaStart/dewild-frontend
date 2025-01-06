import localFont from 'next/font/local'
import { Sofia_Sans_Extra_Condensed } from 'next/font/google'

export const sofia = Sofia_Sans_Extra_Condensed({
  subsets: ['latin'],
  weight: ['800'], // Используем только bold (800)
  display: 'swap',
  preload: true,
  variable: '--font-sofia'
})

