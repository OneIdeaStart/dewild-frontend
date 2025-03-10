// src/components/web3/HeaderButton.tsx
'use client'

import { usePathname, useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import ConnectButton from '../web3/ConnectButton'

export function HeaderButton() {
  const pathname = usePathname()
  const router = useRouter()

  // Если мы на дашборде, странице коллекции или странице детальной информации NFT, показываем ConnectButton
  if (pathname.startsWith('/dashboard') || 
      pathname.startsWith('/collection')) {
    return <ConnectButton />
  }

  // На других страницах (в основном на главной) показываем кнопку перехода в дашборд
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