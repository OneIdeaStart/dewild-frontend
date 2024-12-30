// src/components/web3/WhitelistButton.tsx
'use client'

import { useState } from 'react'
import { useAppKitAccount } from '@reown/appkit/react'
import { Dialog, DialogContent } from '@/components/ui/dialog'
import WhitelistDialog from '@/components/dialogs/WhitelistDialog'
import { useMintStage } from '@/hooks/useMintStage'

export function WhitelistButton() {
    const { address } = useAppKitAccount()
    const { isWhitelisted, checkWhitelistStatus } = useMintStage()
    const [dialogOpen, setDialogOpen] = useState(false)
    const [showConnectWalletError, setShowConnectWalletError] = useState(false)

    const handleWhitelistClick = () => {
        if (!address) {
            setShowConnectWalletError(true)
            return
        }
        setDialogOpen(true)
    }

    const handleDialogClose = (success?: boolean) => {
        if (success) {
            checkWhitelistStatus() // Обновляем статус после успешного добавления
        }
        setDialogOpen(false)
    }

    return (
        <div className="flex flex-col items-center gap-2">
            {isWhitelisted ? (
                <span className="text-[#03CB00] text-sm leading-6 text-center sm:w-[160px] sm:whitespace-normal whitespace-nowrap">
                    You are on the whitelist! ✌️
                </span>
            ) : (
                <div className="flex flex-col items-center">
                    <button 
                        onClick={handleWhitelistClick}
                        className="w-[160px] h-[40px] px-3 py-2 bg-[#002BFF] shadow-[-4px_4px_0px_0px_black] flex justify-center items-center"
                    >
                        <span className="text-center text-white text-sm font-normal uppercase font-['Azeret Mono'] leading-6">
                            Join whitelist
                        </span>
                    </button>
                    {showConnectWalletError && !address && (
                        <p className="text-red-500 text-sm w-[160px] text-center mt-2">
                            Connect wallet (no signing)
                        </p>
                    )}
                </div>
            )}

            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogContent className="w-screen h-screen p-0 m-0 max-w-none">
                    <img 
                        src="/images/animals.png" 
                        alt="Animals" 
                        className="absolute w-full left-0 bottom-0 z-0" 
                    />
                    <WhitelistDialog onClose={handleDialogClose} />
                </DialogContent>
            </Dialog>
        </div>
    )
}

