// src/components/dialogs/CollabSuccessDialog/index.tsx
import { Dialog, DialogContent } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import { useAppKitAccount } from '@reown/appkit/react'

interface WhitelistSuccessDialogProps {
  isOpen: boolean
  onClose: () => void
  applicationId?: string // Добавлено поле для ID заявки
}

export default function WhitelistSuccessDialog({ isOpen, onClose, applicationId }: WhitelistSuccessDialogProps) {
    const router = useRouter()
    const { address } = useAppKitAccount()
    const [loading, setLoading] = useState(false)
    const [discordChannelId, setDiscordChannelId] = useState<string | null>(null)
    
    // Получаем данные о канале при открытии диалога
    useEffect(() => {
      if (!isOpen) return
      
      setLoading(true)
      
      // Формируем URL в зависимости от доступных данных
      let fetchUrl = '/api/collab/application?'
      if (applicationId) {
        fetchUrl += `id=${applicationId}`
      } else if (address) {
        fetchUrl += `wallet=${address}`
      } else {
        setLoading(false)
        return
      }
      
      // Запрашиваем данные заявки
      fetch(fetchUrl)
        .then(response => {
          if (!response.ok) {
            throw new Error('Failed to fetch application')
          }
          return response.json()
        })
        .then(data => {
          if (data && data.discordChannelId) {
            setDiscordChannelId(data.discordChannelId)
          }
        })
        .catch(error => {
          console.error('Failed to fetch application data:', error)
        })
        .finally(() => {
          setLoading(false)
        })
    }, [isOpen, applicationId, address])
  
    const handleDiscordClick = () => {
      onClose() // Закрываем диалог
      
      // Формируем URL для Discord канала
      const serverId = '1318073258251255878' // ID вашего сервера
      
      // Используем ID канала из заявки или запасной URL
      const discordUrl = discordChannelId 
        ? `https://discord.com/channels/${serverId}/${discordChannelId}`
        : 'https://discord.gg/ttte5Zqn9X'
      
      window.open(discordUrl, '_blank')
    }
    
    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
          <DialogContent className="max-w-[384px] bg-[#181818] rounded-[24px] p-0 overflow-hidden">
            <div className="flex flex-col items-center gap-10 px-8 py-10">
              {/* Status */}
              <div className="flex flex-col gap-2 text-center">
                <div className="text-accent-green text-[24px] font-extrabold uppercase leading-[24px]">
                  ✌️
                </div>
                <div className="text-accent-green text-[24px] font-extrabold uppercase leading-[24px]">
                  WE'VE RECEIVED YOUR APPLICATION!
                </div>
              </div>

              {/* Message */}
              <div className="flex flex-col items-center gap-2 text-center">
                <div className="text-white text-[48px] font-extrabold uppercase leading-[48px]">
                  Congrats,<br/>dewild one!
                </div>
                <div className="text-text-secondary text-[16px] font-extrabold uppercase leading-[16px]">
                  We're reviewing submissions and will notify you through Discord once your collaboration is approved.
                </div>
              </div>

              {/* Discord Section */}
              <div className="flex flex-col items-center gap-4">
                <div className="text-white text-[24px] font-extrabold uppercase leading-[24px]">
                  CHECK YOUR APP STATUS IN DISCORD
                </div>
                <Button 
                  onClick={handleDiscordClick}
                  variant="colored" 
                  bgColor="bg-[#F9E52C]"
                  textColor="text-[#005544]"
                  size="lg"
                  disabled={loading}
                >
                  {loading ? "Loading..." : "Check Status"}
                </Button>
              </div>

              {/* Close Button */}
              <button 
                onClick={onClose}
                className="text-text-secondary text-[24px] font-extrabold uppercase leading-[24px]"
              >
                Close
              </button>
            </div>
          </DialogContent>
        </Dialog>
    )
}