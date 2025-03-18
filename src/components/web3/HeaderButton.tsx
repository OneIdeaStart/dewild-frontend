// src/components/web3/HeaderButton.tsx
'use client'

import { usePathname, useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import ConnectButton from '../web3/ConnectButton'

export function HeaderButton() {
  const pathname = usePathname()
  const router = useRouter()

  // If we're on dashboard, collection page or NFT detail page, show ConnectButton
  if (pathname.startsWith('/dashboard') || 
      pathname.startsWith('/collection')) {
    return <ConnectButton />
  }

  // On other pages (mainly home) show button to go to dashboard
  return (
    <Button
      onClick={() => router.push('/dashboard')}
      variant="default"
      size="default"
      className="px-4 pt-[9px] pb-[7px] border-2 border-black rounded-[10px] flex items-center justify-center hover:bg-[#FFF7AC] transition-opacity"
    >
      <span className="text-black text-base font-bold font-['Sofia Sans Extra Condensed'] uppercase leading-5">
        Collab App
      </span>
    </Button>
  )
}