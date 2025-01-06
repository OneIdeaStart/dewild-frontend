'use client'

import { useState } from 'react'
import { useAppKitAccount } from '@reown/appkit/react'
import { Dialog, DialogContent } from '@/components/ui/dialog'
import WhitelistDialog from '@/components/dialogs/WhitelistDialog'
import { useMintStage } from '@/hooks/useMintStage'
import { Button } from '@/components/ui/button'
import WhitelistSuccessDialog from '@/components/dialogs/WhitelistSuccessDialog'

export function WhitelistButton() {
    const { address } = useAppKitAccount()
    const { isWhitelisted, checkWhitelistStatus } = useMintStage()
    const [whitelistDialogOpen, setWhitelistDialogOpen] = useState(false)
    const [successDialogOpen, setSuccessDialogOpen] = useState(false)
    const [showConnectWalletError, setShowConnectWalletError] = useState(false)

    const handleWhitelistClick = () => {
        if (!address) {
            setShowConnectWalletError(true)
            return
        }
        setWhitelistDialogOpen(true)
    }

    const handleWhitelistDialogClose = (success?: boolean) => {
        setWhitelistDialogOpen(false)
        if (success) {
            checkWhitelistStatus()
            setSuccessDialogOpen(true) // Открываем диалог успеха
        }
    }

    return (
        <div className="flex flex-col items-center gap-2">
            {isWhitelisted ? (
                <span className="text-[#03CB00] text-[24px] font-bold uppercase">
                    You are on the whitelist! ✌️
                </span>
            ) : (
                <div className="flex flex-col items-center">
                    <div className="relative">
                        <div className="button-container">
                            <Button
                                onClick={handleWhitelistClick}
                                variant="primary"
                                size="lg"
                            >
                                Join whitelist
                            </Button>
                            <div className="reflect-effect"></div>
                        </div>
                        
                        {showConnectWalletError && !address && (
                            <div className="absolute top-[-48px] left-[50%] transform -translate-x-[50%] flex flex-col items-center">
                                <div className="bg-[#D90004] rounded-[8px] px-4 py-2 text-white text-[16px] font-extrabold uppercase text-center min-w-[250px]">
                                    Connect wallet (no signing)
                                </div>
                                <div className="w-0 h-0 border-l-[8px] border-l-transparent border-r-[8px] border-r-transparent border-t-[8px] border-t-[#D90004] mt-[-1px]"></div>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Whitelist Dialog */}
            <Dialog open={whitelistDialogOpen} onOpenChange={setWhitelistDialogOpen}>
                <DialogContent className="bg-white w-screen h-screen p-0 m-0 max-w-none">
                    <img
                        src="/images/animals.png"
                        alt="Animals"
                        className="absolute w-full left-0 bottom-0 z-0"
                    />
                    <WhitelistDialog onClose={handleWhitelistDialogClose} />
                </DialogContent>
            </Dialog>

            {/* Success Dialog */}
            <WhitelistSuccessDialog 
                isOpen={successDialogOpen}
                onClose={() => setSuccessDialogOpen(false)}
            />
        </div>
    )
}