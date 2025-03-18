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
   const { isCollabApplied, position, checkCollabStatus, isCollabFull, status, isLoading } = useCollabStatus()
   const [collabDialogOpen, setCollabDialogOpen] = useState(false)
   const [successDialogOpen, setSuccessDialogOpen] = useState(false)
   const [showConnectWalletError, setShowConnectWalletError] = useState(false)
   // Add state to store application ID
   const [applicationId, setApplicationId] = useState<string | undefined>()

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

   // Update dialog close handler to get application ID
   const handleCollabDialogClose = (success?: boolean, appId?: string) => {
       setCollabDialogOpen(false)
       if (success) {
           checkCollabStatus()
           // Save application ID
           setApplicationId(appId)
           setSuccessDialogOpen(true)
       }
   }

   const handleShare = () => {
       const text = encodeURIComponent("🔥 I just applied to collaborate with @DeWildClub!\n 🎭 11,111 NFTs, 11,111 artists — creating this collection together!\n 🚀 Let's make something legendary!\n 🎨 If they don't approve me, I'm starting a rebellion.\n\n#DeWildClub #NFTCommunity #NFTCollection")
       window.open(`https://twitter.com/intent/tweet?text=${text}`, '_blank')
   }    

   return (
        <>
            {address && isLoading ? (
                // If wallet is connected and loading - show spinner
                <button 
                    disabled
                    className="w-full h-[52px] bg-[#202020] rounded-2xl text-[#FDC867] text-2xl font-extrabold font-['Sofia Sans Extra Condensed'] uppercase flex items-center justify-center gap-2 cursor-not-allowed"
                >
                    <svg className="animate-spin h-6 w-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                </button>
            ) : isCollabApplied ? (
                // If check complete and application submitted - show status
                <button 
                    disabled
                    className="w-full h-[52px] bg-[#202020] rounded-2xl text-2xl font-extrabold font-['Sofia Sans Extra Condensed'] uppercase flex items-center justify-center gap-2 cursor-not-allowed"
                >
                    {status === 'pending' && (
                        <span className="relative text-orange-400">
                            <span className="text-[19px]">🕛</span>
                            &nbsp;PENDING
                            <span className="animate-pulse">...</span>
                        </span>
                    )}
                    {(status === 'approved' || status === ('prompt_received' as any) || 
                        status === ('nft_pending' as any) || 
                        status === ('nft_approved' as any) ||
                        status === ('minted' as any) || 
                        status === ('nft_rejected' as any)) && (
                        <span className="text-green-400">
                            <span className="text-[19px]">✅</span>
                            &nbsp;APPROVED
                        </span>
                    )}
                    {status === 'rejected' && (
                        <span className="text-red-400">
                            <span className="text-[19px]">🚫</span>
                            &nbsp;REJECTED
                        </span>
                    )}
                </button>
            ) : (
                // By default show Apply for Collab button
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

            <Dialog open={collabDialogOpen} onOpenChange={setCollabDialogOpen}>
                <DialogContent className="bg-white w-screen h-screen p-0 m-0 max-w-none animate-dark-slide">
                    <img
                        src="/images/animals.png"
                        alt="Animals"
                        className="absolute w-full left-0 bottom-0 z-0"
                    />
                    <CollabDialog onClose={handleCollabDialogClose} />
                </DialogContent>
            </Dialog>

            <CollabSuccessDialog 
                isOpen={successDialogOpen}
                onClose={() => setSuccessDialogOpen(false)}
                applicationId={applicationId} // Pass application ID
            />
        </>
    )
}