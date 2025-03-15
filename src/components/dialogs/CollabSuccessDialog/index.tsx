// src/components/dialogs/CollabSuccessDialog/index.tsx
import { Dialog, DialogContent } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { useRouter } from 'next/navigation'

interface WhitelistSuccessDialogProps {
  isOpen: boolean
  onClose: () => void
}

export default function WhitelistSuccessDialog({ isOpen, onClose }: WhitelistSuccessDialogProps) {
    const router = useRouter()
  
    const handleDiscordClick = () => {
      onClose() // Закрываем диалог
      // Открываем ссылку на Discord сервер в новой вкладке
      window.open('https://discord.com/channels/1318073258251255878/1349114669293637665', '_blank');
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
            We're reviewing submissions and will notify you trough Discord once your collaboration is approved.
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
            >
                Check Status
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