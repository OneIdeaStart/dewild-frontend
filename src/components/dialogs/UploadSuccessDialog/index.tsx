// src/components/dialogs/UploadSuccessDialog/index.tsx
import { Dialog, DialogContent } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { useRouter } from 'next/navigation'

interface UploadSuccessDialogProps {
  isOpen: boolean
  onClose: () => void
}

export default function UploadSuccessDialog({ isOpen, onClose }: UploadSuccessDialogProps) {
  const router = useRouter()
  
  const handlePromptButtonClick = () => {
    onClose() // Закрываем диалог
    // Опционально: можно редиректить куда-то после закрытия
    // router.push('/#steps')
  }
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-[384px] bg-[#181818] rounded-[24px] p-0 overflow-hidden">
        <div className="flex flex-col items-center gap-10 px-8 py-10">
          {/* Status */}
          <div className="flex flex-col gap-2 text-center">
            <div className="text-accent-green text-[24px] font-extrabold uppercase leading-[24px]">
              🎨
            </div>
            <div className="text-accent-green text-[24px] font-extrabold uppercase leading-[24px]">
              IMAGE SUCCESSFULLY UPLOADED!
            </div>
          </div>

          {/* Message */}
          <div className="flex flex-col items-center gap-2 text-center">
            <div className="text-white text-[48px] font-extrabold uppercase leading-[48px]">
              Great job,<br/>artist!
            </div>
            <div className="text-text-secondary text-[16px] font-extrabold uppercase leading-[16px]">
              Your image is now being reviewed by our team. We'll notify you once it's approved for minting.
            </div>
          </div>

          {/* Next Steps */}
          <div className="flex flex-col items-center gap-4">
            <div className="text-white text-[24px] font-extrabold uppercase leading-[24px]">
              WHAT'S NEXT?
            </div>
            <Button 
              onClick={handlePromptButtonClick}
              variant="colored" 
              bgColor="bg-accent-yellow" 
              textColor="text-accent-green"
              size="lg"
            >
              Back to Dashboard
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