// src/components/web3/UploadButton.tsx
'use client'

import { useState } from 'react'
import { Dialog, DialogContent } from '@/components/ui/dialog'
import { useCollabStatus } from '@/hooks/useCollabStatus'
import UploadDialog from '@/components/dialogs/UploadDialog'
import { useAppKitAccount } from '@reown/appkit/react'

export function UploadButton() {
  const { address } = useAppKitAccount()
  const { isCollabApplied, status, checkCollabStatus, applicationData } = useCollabStatus()
  const [dialogOpen, setDialogOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [promptData, setPromptData] = useState<any>(null)
  
  // Определяем состояние кнопки в зависимости от статуса
  const isActive = isCollabApplied && 
    (status === 'approved' || status === ('prompt_received' as any) || 
     status === 'nft_rejected');

  const handleUploadClick = async () => {
    if (!isActive || !address) return
    
    // Если уже на рассмотрении, не открываем диалог
    if (status === 'nft_pending') return;
    
    setIsLoading(true)
    setError(null)
    
    try {
      {
        const response = await fetch(`/api/prompts/assign?wallet=${address}`)
        const data = await response.json()
        
        if (!response.ok) {
          throw new Error(data.error || 'Failed to get prompt')
        }
        
        setPromptData(data.prompt)
      }
      
      setDialogOpen(true)
    } catch (err: any) {
      setError(err.message || 'Something went wrong')
      console.error('Error getting prompt for upload:', err)
    } finally {
      setIsLoading(false)
    }
  }

  const handleDialogClose = () => {
    setDialogOpen(false)
    // Принудительно обновляем статус
    setTimeout(() => {
      checkCollabStatus()
    }, 1000);
  }

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
      ) : (status === 'nft_pending' || status === 'nft_approved' || status === ('minted' as any)) ? (
        // Если загрузка завершена и ожидается апрув или уже апрувнуто
        <button 
          disabled
          className="w-full h-[52px] bg-[#202020] rounded-2xl text-2xl font-extrabold font-['Sofia Sans Extra Condensed'] uppercase flex items-center justify-center gap-2 cursor-not-allowed"
        >
          {status === 'nft_pending' && (
            <span className="relative text-orange-400">
              <span className="text-[19px]">🕛</span>
              &nbsp;PENDING
              <span className="animate-pulse">...</span>
            </span>
          )}
          {(status === 'nft_approved' || status === ('minted' as any)) && (
            <span className="text-green-400">
              <span className="text-[19px]">✅</span>
              &nbsp;APPROVED
            </span>
          )}
        </button>
      ) : (
        // По умолчанию показываем кнопку Upload
        <button 
          onClick={handleUploadClick}
          disabled={!isActive}
          className={`w-full h-[52px] rounded-2xl text-2xl font-extrabold font-['Sofia Sans Extra Condensed'] uppercase flex items-center justify-center gap-2 ${
            isActive 
              ? 'bg-white text-[#202020] cursor-pointer hover:bg-gray-100' 
              : 'bg-[#202020] text-white/70 cursor-not-allowed'
          }`}
        >
          {status === 'nft_rejected' ? (
            <span className="text-black">
              <span className="text-[19px]">🫣</span>
              &nbsp;UPLOAD ANOTHER
            </span>
          ) : (
            "UPLOAD IMAGE"
          )}
        </button>
      )}

      {error && (
        <p className="text-red-500 text-sm mt-2">{error}</p>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="bg-white w-screen h-screen p-0 m-0 max-w-none">
          <img
            src="/images/animals.png"
            alt="Animals"
            className="absolute w-full left-0 bottom-0 z-0"
          />
          <UploadDialog 
            onClose={handleDialogClose}
            promptData={promptData}
          />
        </DialogContent>
      </Dialog>
    </>
  )
}