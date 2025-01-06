// src/components/dialogs/WhitelistSuccessDialog/index.tsx
import { Dialog, DialogContent } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { useRouter } from 'next/navigation'

interface WhitelistSuccessDialogProps {
  isOpen: boolean
  onClose: () => void
}

export default function WhitelistSuccessDialog({ isOpen, onClose }: WhitelistSuccessDialogProps) {
    const router = useRouter()
  
    const handlePromoClick = () => {
      onClose() // Закрываем диалог
      // Редиректим на главную с якорем секции промо
      router.push('/#promos')
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
              you are on the whitelist!
            </div>
          </div>

          {/* Message */}
          <div className="flex flex-col items-center gap-2 text-center">
            <div className="text-white text-[48px] font-extrabold uppercase leading-[48px]">
              Congrats,<br/>dewild one!
            </div>
            <div className="text-text-secondary text-[16px] font-extrabold uppercase leading-[16px]">
              Stay tuned for announcements on x.com and Discord and don't miss the start of the mint round.
            </div>
          </div>

          {/* Promo Section */}
          <div className="flex flex-col items-center gap-4">
            <div className="text-white text-[24px] font-extrabold uppercase leading-[24px]">
              to win more & help the project
            </div>
            <Button 
                onClick={handlePromoClick}
                variant="colored" 
                bgColor="bg-accent-yellow" 
                textColor="text-accent-green"
                size="lg"
            >
                Check our promos
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