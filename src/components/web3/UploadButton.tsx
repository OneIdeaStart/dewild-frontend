// src/components/web3/UploadButton.tsx
'use client'

import { useState } from 'react'
import { Dialog, DialogContent } from '@/components/ui/dialog'
import { useCollabStatus } from '@/hooks/useCollabStatus'
import UploadDialog from '@/components/dialogs/UploadDialog'

export function UploadButton() {
 const { isCollabApplied, status } = useCollabStatus()
 const [dialogOpen, setDialogOpen] = useState(false)
 
 const isActive = isCollabApplied && status === 'approved'

 const handleDialogClose = (success?: boolean) => {
   setDialogOpen(false)
 }

 return (
   <>
     <button 
       onClick={() => isActive && setDialogOpen(true)}
       disabled={!isActive}
       className={`w-full h-[52px] rounded-2xl text-2xl font-extrabold font-['Sofia Sans Extra Condensed'] uppercase flex items-center justify-center gap-2 ${
         isActive 
           ? 'bg-white text-[#202020] cursor-pointer' 
           : 'bg-[#202020] text-white/70 cursor-not-allowed'
       }`}
     >
       UPLOAD IMAGE
     </button>

     <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
       <DialogContent className="bg-white w-screen h-screen p-0 m-0 max-w-none">
         <img
           src="/images/animals.png"
           alt="Animals"
           className="absolute w-full left-0 bottom-0 z-0"
         />
         <UploadDialog onClose={handleDialogClose} />
       </DialogContent>
     </Dialog>
   </>
 )
}