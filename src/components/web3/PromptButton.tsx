// src/components/web3/PromptButton.tsx
'use client'

import { useState } from 'react'
import { Dialog, DialogContent } from '@/components/ui/dialog'
import { useCollabStatus } from '@/hooks/useCollabStatus'
import PromptDialog from '@/components/dialogs/PromptDialog'
import { useAppKitAccount } from '@reown/appkit/react'
import { ApplicationStatus } from '@/types/collab'

export function PromptButton() {
  const { address } = useAppKitAccount()
  const { isCollabApplied, status, checkCollabStatus } = useCollabStatus()
  const [dialogOpen, setDialogOpen] = useState(false)
  const [promptData, setPromptData] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  // Активируем кнопку также при nft_rejected
  const isActive = isCollabApplied && 
    (status === 'approved' || 
     status === ('prompt_received' as ApplicationStatus) || 
     status === ('nft_rejected' as ApplicationStatus))

  const handleGetPrompt = async () => {
    if (!isActive || !address) return
    
    setIsLoading(true)
    setError(null)
    
    try {
      const response = await fetch(`/api/prompts/assign?wallet=${address}`)
      const data = await response.json()
      
      if (!response.ok) {
        // Если ошибка из-за статуса заявки, 
        // но локально кнопка активна - обновляем статус
        if (data.status === 'prompt_received') {
          // Принудительно обновляем статус в хуке useCollabStatus
          checkCollabStatus(); 
          setPromptData(data.prompt);
          setDialogOpen(true);
          return;
        }
        
        throw new Error(data.error || 'Failed to get prompt')
      }
      
      setPromptData(data.prompt)
      setDialogOpen(true)
    } catch (err: any) {
      setError(err.message || 'Something went wrong')
      console.error('Error getting prompt:', err)
    } finally {
      setIsLoading(false)
    }
  }

  const handleDialogClose = () => {
    setDialogOpen(false)
    // Обновляем статус после закрытия диалога
    setTimeout(() => {
      checkCollabStatus();
    }, 1000);
  }

  // Меняем текст кнопки для случая nft_rejected
  const buttonText = () => {
    if (isLoading) {
      return (
        <span className="flex items-center gap-2">
          <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          LOADING...
        </span>
      );
    }
    if (status === ('nft_rejected' as ApplicationStatus)) {
      return 'VIEW PROMPT';
    }
    return 'GET PROMPT';
  };

  return (
    <>
      <button 
        onClick={handleGetPrompt}
        disabled={!isActive || isLoading}
        className={`w-full h-[52px] rounded-2xl text-2xl font-extrabold font-['Sofia Sans Extra Condensed'] uppercase flex items-center justify-center gap-2 ${
          isActive 
            ? 'bg-white text-[#202020] cursor-pointer hover:bg-gray-100' 
            : 'bg-[#202020] text-white/70 cursor-not-allowed'
        }`}
      >
        {buttonText()}
      </button>

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
          <PromptDialog 
            promptData={promptData} 
            onClose={handleDialogClose} 
          />
        </DialogContent>
      </Dialog>
    </>
  )
}