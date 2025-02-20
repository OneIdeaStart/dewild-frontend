'use client'

import { useState, useEffect } from 'react'
import { useAppKitAccount } from '@reown/appkit/react'
import { Dialog, DialogContent } from '@/components/ui/dialog'
import CollabDialog from '@/components/dialogs/CollabDialog'
import { useCollabStatus } from '@/hooks/useCollabStatus'
import { Button } from '@/components/ui/button'
import CollabSuccessDialog from '@/components/dialogs/CollabSuccessDialog'

export function CollabButton() {
   const { address } = useAppKitAccount()
   const { isCollabApplied, position, checkCollabStatus, isCollabFull } = useCollabStatus()
   const [collabDialogOpen, setCollabDialogOpen] = useState(false)
   const [successDialogOpen, setSuccessDialogOpen] = useState(false)
   const [showConnectWalletError, setShowConnectWalletError] = useState(false)

   useEffect(() => {
       if (isCollabFull) {
           setShowConnectWalletError(false);
       }
   }, [isCollabFull]);

   const handleCollabClick = () => {
    if (!address) {
        setShowConnectWalletError(true)
        return
    }
    setCollabDialogOpen(true)
   }

   const handleCollabDialogClose = (success?: boolean) => {
       setCollabDialogOpen(false)
       if (success) {
           checkCollabStatus()
           setSuccessDialogOpen(true)
       }
   }

   const handleShare = () => {
       const text = encodeURIComponent("🔥 I just applied to collaborate with @DeWildClub!\n 🎭 11,111 NFTs, 11,111 artists — creating this collection together!\n 🚀 Let's make something legendary!\n 🎨 If they don't approve me, I'm starting a rebellion.\n\n#DeWildClub #NFTCommunity #NFTCollection")
       window.open(`https://twitter.com/intent/tweet?text=${text}`, '_blank')
   }    

   return (
       <>
           {isCollabApplied ? (
               <div className="flex flex-wrap items-center justify-center gap-3">
                   {position ? (
                       <span className="text-[#03CB00] text-[24px] font-bold uppercase">
                           {`Your application is being reviewed! ✌️`}
                       </span>
                   ) : (
                       <span className="text-[#03CB00] text-[24px] font-bold uppercase">
                           Your collab application is received! ✌️
                       </span>
                   )}
                   <Button 
                       variant="primary"
                       size="sm"
                       onClick={handleShare}
                   >
                       Share on X
                   </Button>
               </div>
           ) : (
               <div className="relative">
                   <Button
                    variant="primary-light" 
                    size="lg"
                    onClick={handleCollabClick}
                    disabled={isCollabFull}
                    className="w-full"
                   >
                    {isCollabFull 
                        ? <span className="text-gray-500">Collab List is Full</span>
                        : 'Apply for Collab'
                    }
                   </Button>
                   
                   {showConnectWalletError && !address && (
                       <div className="absolute top-[-48px] left-[50%] transform -translate-x-[50%] flex flex-col items-center">
                           <div className="bg-[#D90004] rounded-[8px] px-4 py-2 text-white text-[16px] font-extrabold uppercase text-center whitespace-nowrap">
                               Connect wallet first (no signing needed)
                           </div>
                           <div className="w-0 h-0 border-l-[8px] border-l-transparent border-r-[8px] border-r-transparent border-t-[8px] border-t-[#D90004] mt-[-1px]"></div>
                       </div>
                   )}
               </div>
           )}

           {/* Collab Dialog */}
           <Dialog open={collabDialogOpen} onOpenChange={setCollabDialogOpen}>
               <DialogContent className="bg-white w-screen h-screen p-0 m-0 max-w-none">
                   <img
                       src="/images/animals.png"
                       alt="Animals"
                       className="absolute w-full left-0 bottom-0 z-0"
                   />
                   <CollabDialog onClose={handleCollabDialogClose} />
               </DialogContent>
           </Dialog>

           {/* Success Dialog */}
           <CollabSuccessDialog 
               isOpen={successDialogOpen}
               onClose={() => setSuccessDialogOpen(false)}
           />
       </>
   )
}