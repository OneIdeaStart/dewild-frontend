// src/styles/fonts.ts
import { Sofia_Sans_Extra_Condensed } from 'next/font/google'

export const sofia = Sofia_Sans_Extra_Condensed({
  subsets: ['latin'],
  weight: ['400', '700', '800'],
  variable: '--font-sofia',
  display: 'swap',
  preload: true,
})