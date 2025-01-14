'use client'

import { useState, useEffect } from 'react'
import { useAppKitAccount } from '@reown/appkit/react'
import { Dialog, DialogContent } from '@/components/ui/dialog'
import WhitelistDialog from '@/components/dialogs/WhitelistDialog'
import { useMintStage } from '@/hooks/useMintStage'
import { useMintStageContext } from '@/context/MintStageContext';
import { event } from '@/lib/gtag';
import { Button } from '@/components/ui/button'
import WhitelistSuccessDialog from '@/components/dialogs/WhitelistSuccessDialog'

export function WhitelistButton() {
    const { address } = useAppKitAccount()
    const { isWhitelisted , position, checkWhitelistStatus } = useMintStage()
    const { isWhitelistFull } = useMintStageContext();
    const [whitelistDialogOpen, setWhitelistDialogOpen] = useState(false)
    const [successDialogOpen, setSuccessDialogOpen] = useState(false)
    const [showConnectWalletError, setShowConnectWalletError] = useState(false)

    useEffect(() => {
        if (typeof window !== 'undefined') {
            // Даем время на инициализацию хука useWhitelistConditions
            setTimeout(() => {
                const searchParams = new URLSearchParams(window.location.search);
                if (searchParams.get('openWhitelist') === 'true') {
                    setWhitelistDialogOpen(true);
                    window.history.replaceState({}, '', '/');
                }
            }, 500);
        }
    }, []);

    useEffect(() => {
        if (isWhitelistFull) {
            setShowConnectWalletError(false); // Сбрасываем ошибку подключения если whitelist заполнен
        }
    }, [isWhitelistFull]);

    const handleWhitelistClick = () => {
        event({
            action: 'whitelist_dialog_open',
            category: 'whitelist',
            label: address ? 'With Wallet' : 'No Wallet',
        });
     
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

    const handleShare = () => {
        const text = encodeURIComponent("🔥 I just secured my spot on the #DeWildClub Whitelist!\n⚡ The Legends of #DeFi are calling, and I'm ready.\n🚨 Don't let #FOMO haunt you — join the @DeWildClub right now!\n\n#DeWild #NFTCommunity #NFTCollection")
        window.open(`https://twitter.com/intent/tweet?text=${text}`, '_blank')
    }    

    return (
        <div className="flex flex-col items-center gap-2">
            {isWhitelisted ? (
                <div className="flex flex-wrap items-center justify-center gap-3">
                    {position ? (
                        <span className="text-[#03CB00] text-[24px] font-bold uppercase">
                            {`You are #${position} on the whitelist! ✌️`}
                        </span>
                    ) : (
                        <span className="text-[#03CB00] text-[24px] font-bold uppercase">
                            You are on the whitelist! ✌️
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
                <div className="flex flex-col items-center">
                    <div className="relative">
                        <div className="button-container">
                        <Button
                            onClick={handleWhitelistClick}
                            variant="primary"
                            size="lg"
                            disabled={isWhitelistFull}
                        >
                            {isWhitelistFull 
                                ? <span className="text-gray-500">Whitelist is Full</span>
                                : 'Join Whitelist'
                            }
                        </Button>
                            <div className="reflect-effect"></div>
                        </div>
                        
                        {showConnectWalletError && !address && (
                            <div className="absolute top-[-48px] left-[50%] transform -translate-x-[50%] flex flex-col items-center">
                                <div className="bg-[#D90004] rounded-[8px] px-4 py-2 text-white text-[16px] font-extrabold uppercase text-center whitespace-nowrap">
                                    Connect wallet first (no signing needed)
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