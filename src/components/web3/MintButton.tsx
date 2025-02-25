// src/components/web3/MintButton.tsx
'use client'

import { useState } from 'react'
import { Dialog, DialogContent } from '@/components/ui/dialog'
import { useCollabStatus } from '@/hooks/useCollabStatus'

export function MintButton() {
  const { isCollabApplied, status } = useCollabStatus()
  const [dialogOpen, setDialogOpen] = useState(false)
  
  // Изначально неактивна
  const isActive = false // Здесь будет логика активации

  return (
    <button 
      disabled
      className="w-full h-[52px] bg-[#202020] rounded-2xl text-white/70 text-2xl font-extrabold font-['Sofia Sans Extra Condensed'] uppercase flex items-center justify-center gap-2 cursor-not-allowed"
    >
      MINT NFT
    </button>
  )
}
