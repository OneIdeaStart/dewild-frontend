// src/components/web3/MintButton.tsx
'use client'

import { useState } from 'react'
import { Dialog, DialogContent } from '@/components/ui/dialog'
import { useCollabStatus } from '@/hooks/useCollabStatus'
import { useAppKitAccount } from '@reown/appkit/react'
import MintDialog from '@/components/dialogs/MintDialog'

export function MintButton() {
  const { address } = useAppKitAccount()
  const { isCollabApplied, status, checkCollabStatus } = useCollabStatus()
  const [dialogOpen, setDialogOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  
  // Кнопка активна только если NFT одобрен
  const isActive = isCollabApplied && status === ('nft_approved' as any);

  const handleMintClick = () => {
    if (!isActive || !address) return;
    // Просто открываем диалог без получения подписи
    setDialogOpen(true);
  };

  const handleDialogClose = () => {
    setDialogOpen(false);
    // Обновляем статус после закрытия диалога
    setTimeout(() => {
      checkCollabStatus();
    }, 1000);
  };

  return (
    <>
      {isLoading ? (
        // Если идет загрузка - показываем спиннер
        <button 
          disabled
          className="w-full h-[52px] bg-[#202020] rounded-2xl text-white text-2xl font-extrabold font-['Sofia Sans Extra Condensed'] uppercase flex items-center justify-center gap-2 cursor-not-allowed"
        >
          <svg className="animate-spin h-6 w-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        </button>
      ) : status === 'minted' ? (
        // Если уже заминчено - показываем статус
        <button 
          disabled
          className="w-full h-[52px] bg-[#202020] rounded-2xl text-2xl font-extrabold font-['Sofia Sans Extra Condensed'] uppercase flex items-center justify-center gap-2 cursor-not-allowed"
        >
          <span className="text-green-400">
            <span className="text-[19px]">✅</span>
            &nbsp;MINTED
          </span>
        </button>
      ) : (
        // По умолчанию показываем кнопку Mint
        <button 
          onClick={handleMintClick}
          disabled={!isActive}
          className={`w-full h-[52px] rounded-2xl text-2xl font-extrabold font-['Sofia Sans Extra Condensed'] uppercase flex items-center justify-center gap-2 ${
            isActive 
              ? 'bg-white text-[#202020] cursor-pointer hover:bg-gray-100' 
              : 'bg-[#202020] text-white/70 cursor-not-allowed'
          }`}
        >
          MINT NFT
        </button>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="bg-white w-screen h-screen p-0 m-0 max-w-none">
          <img
            src="/images/animals.png"
            alt="Animals"
            className="absolute w-full left-0 bottom-0 z-0"
          />
          {/* Удаляем передачу signature, так как получать её будем внутри диалога */}
          <MintDialog onClose={handleDialogClose} />
        </DialogContent>
      </Dialog>
    </>
  )
}