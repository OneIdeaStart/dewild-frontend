'use client'

import { WhitelistButton } from '@/components/web3/WhitelistButton'

export function Footer() {
  return (
    <footer className="w-full min-h-screen pb-6 px-3 flex flex-col">
      {/* Main content with button - занимает всё свободное место */}
      <div className="w-[179px] flex-1 flex flex-col justify-center items-center mx-auto">
        <div className="flex flex-col items-center gap-3">
          <WhitelistButton />
          <span className="text-text-gray text-[16px] leading-[16px] font-bold uppercase">
            round 1/5
          </span>
        </div>
      </div>

      {/* Bottom section with fixed height */}
      <div className="flex flex-col items-center gap-10">
        {/* Copyright */}
        <span className="text-text-gray text-[32px] leading-[32px] font-bold">
          © 2025
        </span>

        {/* Social Links */}
        <div className="w-full flex flex-wrap justify-center gap-4 sm:gap-10">
          <a 
            href="https://x.com/dewild" 
            target="_blank" 
            rel="noopener noreferrer" 
            className="text-accent-blue text-[32px] leading-[32px] font-bold uppercase hover:opacity-80 transition-opacity"
          >
            x.com
          </a>
          
          <a 
            href="https://discord.gg/dewild" 
            target="_blank" 
            rel="noopener noreferrer" 
            className="text-accent-purple text-[32px] leading-[32px] font-bold uppercase hover:opacity-80 transition-opacity"
          >
            discord
          </a>
          
          <a 
            href="https://tiktok.com/@dewild" 
            target="_blank" 
            rel="noopener noreferrer" 
            className="text-accent-green text-[32px] leading-[32px] font-bold uppercase hover:opacity-80 transition-opacity"
          >
            tiktok
          </a>
          
          <a 
            href="https://debank.com/dewild" 
            target="_blank" 
            rel="noopener noreferrer" 
            className="text-accent-orange text-[32px] leading-[32px] font-bold uppercase hover:opacity-80 transition-opacity"
          >
            debank
          </a>
          
          <a 
            href="mailto:collab@dewild.club" 
            className="text-accent-pink text-[32px] leading-[32px] font-bold uppercase hover:opacity-80 transition-opacity"
          >
            collab@dewild.club
          </a>
        </div>
      </div>
    </footer>
  )
}