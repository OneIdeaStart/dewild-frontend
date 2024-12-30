// src/components/sections/TextCarousel.tsx
'use client'

import { useEffect, useRef, useState } from 'react'
import WhitelistDialog from '@/components/dialogs/WhitelistDialog'
import { Dialog, DialogContent } from '@/components/ui/dialog'
import { useAppKitAccount } from '@reown/appkit/react'
import { WhitelistButton } from '@/components/web3/WhitelistButton'
import { useMintStageContext } from '@/context/MintStageContext'

export function TextCarousel() {
    const { address } = useAppKitAccount()
    const [dialogOpen, setDialogOpen] = useState(false)
    const [showConnectWalletError, setShowConnectWalletError] = useState(false)
    const text = "you are free if you are dewild."
    const [setIsWhitelisted] = useState(false)
    const { isWhitelisted } = useMintStageContext()

    const handleWhitelistClick = () => {
        if (!address) {
            setShowConnectWalletError(true)
            return
        }
        setDialogOpen(true)
    }

    return (
        <section className="w-full overflow-hidden bg-white px-6 py-2 pb-48 flex flex-col items-center gap-48">
            <div className="w-full h-[296px] flex flex-col gap-2">
                <div className="relative">
                    <div className="flex animate-text-marquee-left">
                        <span className="text-black font-thin text-[196px] font-normal uppercase leading-[144px] font-['Azeret Mono'] whitespace-nowrap">
                            {text}&nbsp;{text}&nbsp;
                        </span>
                        <span className="text-black font-thin text-[196px] font-normal uppercase leading-[144px] font-['Azeret Mono'] whitespace-nowrap">
                            {text}&nbsp;{text}&nbsp;
                        </span>
                    </div>
                </div>
                
                <div className="relative">
                    <div className="flex animate-text-marquee-right">
                        <span className="text-black font-thin text-[196px] font-normal uppercase leading-[144px] font-['Azeret Mono'] whitespace-nowrap">
                            {text}&nbsp;{text}&nbsp;
                        </span>
                        <span className="text-black font-thin text-[196px] font-normal uppercase leading-[144px] font-['Azeret Mono'] whitespace-nowrap">
                            {text}&nbsp;{text}&nbsp;
                        </span>
                    </div>
                </div>
            </div>

            <WhitelistButton />
        </section>
    )
}