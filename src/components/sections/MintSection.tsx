// src/components/sections/MintSection.tsx
'use client';

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { useMintStage } from '@/hooks/useMintStage'
import { useAppKitAccount } from '@reown/appkit/react'
import { MintStage } from '@/types/mint-stages'
import { STAGE_CONFIGS } from '@/config/mint-stages'
import WhitelistDialog from '@/components/dialogs/WhitelistDialog'
import { WhitelistButton } from '@/components/web3/WhitelistButton'
import { useMintStageContext } from '@/context/MintStageContext';
import { 
    Dialog,
    DialogContent,
    DialogClose
} from '@/components/ui/dialog'

export function MintSection() {
  const { address } = useAppKitAccount()
  const { stageConfig, canInteract, checkWhitelistStatus } = useMintStage()
  const { isWhitelisted, currentStage } = useMintStageContext();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [showConnectWalletError, setShowConnectWalletError] = useState(false)

 // Обработчик для whitelist регистрации
 const handleWhitelistClick = () => {
   if (!address) {
     setShowConnectWalletError(true)
     return
   }
   if (!isWhitelisted) {
     setDialogOpen(true)
   }
 }

 const handleDialogClose = () => {
   setDialogOpen(false)
   checkWhitelistStatus()
 }

 // Базовый обработчик для всех действий
 const handleAction = () => {
   switch (currentStage) {
     case MintStage.WHITELIST_REGISTRATION:
       handleWhitelistClick()
       break
     case MintStage.FREE_MINT:
       console.log('Free mint action')
       break
     case MintStage.EARLY_ADOPTERS:
       console.log('Early adopters mint action')
       break
     case MintStage.FIXED_PRICE:
       console.log('Fixed price mint action')
       break
     case MintStage.FINAL_AUCTION:
       console.log('Auction action')
       break
     case MintStage.SOLD_OUT:
       window.open('https://opensea.io/collection/dewild', '_blank')
       break
   }
 }

 // Рендер для Join Whitelist фазы
 const renderWhitelistJoin = () => (
   <div className="py-4 flex flex-col sm:flex-row justify-between gap-4">
     <div>
       <h3 className="text-black text-sm font-bold font-['Azeret Mono'] leading-6">
         Phase 1. Join Whitelist
       </h3>
       <p className="text-black text-sm font-normal font-['Azeret Mono'] leading-6 max-w-[780px]">
       First 999 participants will get 1 free NFT in Phase 2, and all whitelisted wallets can mint 1,111 more at 0.0011 ETH in Phase 3.
       </p>
     </div>
     <WhitelistButton />
   </div>
 )

 // Рендер для Free Mint фазы
 const renderFreeMint = () => (
   <div className="py-4 flex flex-col sm:flex-row justify-between gap-4">
     <div>
       <h3 className="text-black text-sm font-bold font-['Azeret Mono'] leading-6">
         Phase 2. Free mint
       </h3>
       <div className="flex flex-col sm:flex-row gap-12">
         <div>
           <div className="text-black text-sm font-normal font-['Azeret Mono'] leading-6">Time Remaining</div>
           <div className="text-black text-sm font-bold font-['Azeret Mono'] leading-6">23:59:59</div>
         </div>
         <div>
           <div className="text-black text-sm font-normal font-['Azeret Mono'] leading-6">Minted</div>
           <div className="text-black text-sm font-bold font-['Azeret Mono'] leading-6">0/999</div>
         </div>
       </div>
     </div>
     <div className="flex items-start">
      <Button
        onClick={handleAction}
        disabled={!canInteract}
        variant="primary"
        className="w-40 shadow-[-4px_4px_0px_0px_#000000] uppercase"
      >
        FREE MINT
      </Button>
    </div>
   </div>
 )

 // Рендер для Early Adopters фазы
 const renderEarlyAdopters = () => (
   <div className="py-4 flex flex-col sm:flex-row justify-between border-t border-black gap-4">
     <div>
       <h3 className="text-black text-sm font-bold font-['Azeret Mono'] leading-6">
         Phase 3. Early adopters mint
       </h3>
       <div className="flex flex-col sm:flex-row gap-12">
         <div>
           <div className="text-black text-sm font-normal font-['Azeret Mono'] leading-6">Price</div>
           <div className="text-black text-sm font-bold font-['Azeret Mono'] leading-6">0.001 ETH</div>
         </div>
         <div>
           <div className="text-black text-sm font-normal font-['Azeret Mono'] leading-6">Minted</div>
           <div className="text-black text-sm font-bold font-['Azeret Mono'] leading-6">0/1111</div>
         </div>
       </div>
     </div>
     <div className="flex items-start">
     <Button
       onClick={handleAction}
       disabled={!canInteract}
       variant="primary"
       className="w-40 shadow-[-4px_4px_0px_0px_#000000] uppercase"
     >
       MINT NOW
     </Button>
     </div>
   </div>
 )

 // Рендер для Fixed Price фазы
 const renderFixedPrice = () => (
   <div className="py-4 flex flex-col sm:flex-row justify-between border-t border-black gap-4">
     <div>
       <h3 className="text-black text-sm font-bold font-['Azeret Mono'] leading-6">
         Phase 4. Fixed price mint
       </h3>
       <div className="flex flex-col sm:flex-row gap-12">
         <div>
           <div className="text-black text-sm font-normal font-['Azeret Mono'] leading-6">Price</div>
           <div className="text-black text-sm font-bold font-['Azeret Mono'] leading-6">0.011 ETH</div>
         </div>
         <div>
           <div className="text-black text-sm font-normal font-['Azeret Mono'] leading-6">Minted</div>
           <div className="text-black text-sm font-bold font-['Azeret Mono'] leading-6">0/8888</div>
         </div>
       </div>
     </div>
     <div className="flex items-start">
     <Button
       onClick={handleAction}
       disabled={!canInteract}
       variant="primary"
       className="w-40 shadow-[-4px_4px_0px_0px_#000000] uppercase"
     >
       MINT NOW
     </Button>
     </div>
   </div>
 )

 // Рендер для English Auction фазы
 const renderEnglishAuction = () => (
   <div className="py-4 flex flex-col sm:flex-row justify-between border-t border-black gap-4">
     <div>
       <h3 className="text-black text-sm font-bold font-['Azeret Mono'] leading-6">
         Phase 5. English Auction
       </h3>
       <div className="flex flex-col sm:flex-row gap-12">
         <div>
           <div className="text-black text-sm font-normal font-['Azeret Mono'] leading-6">Time Remaining</div>
           <div className="text-black text-sm font-bold font-['Azeret Mono'] leading-6">23:59:59</div>
         </div>
         <div>
           <div className="text-black text-sm font-normal font-['Azeret Mono'] leading-6">Current Bid</div>
           <div className="text-black text-sm font-bold font-['Azeret Mono'] leading-6">0.5 ETH</div>
         </div>
       </div>
     </div>
     <div className="flex items-start">
     <Button
       onClick={handleAction}
       disabled={!canInteract}
       variant="primary"
       className="w-40 shadow-[-4px_4px_0px_0px_#000000] uppercase"
     >
       PLACE BID
     </Button>
     </div>
   </div>
 )

 // Рендер для состояния sold out
 const renderSoldOut = () => (
   <div className="py-4 flex flex-col sm:flex-row justify-between border-t border-black gap-4">
     <div>
       <h3 className="text-black text-sm font-bold font-['Azeret Mono'] leading-6">
         Collection Sold Out
       </h3>
       <div className="flex flex-col sm:flex-row gap-12">
         <div>
           <div className="text-black text-sm font-normal font-['Azeret Mono'] leading-6">Floor Price</div>
           <div className="text-black text-sm font-bold font-['Azeret Mono'] leading-6">0.5 ETH</div>
         </div>
       </div>
     </div>
     <div className="flex items-start">
     <Button
       onClick={handleAction}
       variant="primary"
       className="w-40 shadow-[-4px_4px_0px_0px_#000000] uppercase"
     >
       VIEW ON OPENSEA
     </Button>
     </div>
   </div>
 )

 const allStages = [
    {
      stage: MintStage.WHITELIST_REGISTRATION,
      render: renderWhitelistJoin
    },
    {
      stage: MintStage.FREE_MINT,
      render: renderFreeMint
    },
    {
      stage: MintStage.EARLY_ADOPTERS,
      render: renderEarlyAdopters
    },
    {
      stage: MintStage.FIXED_PRICE,
      render: renderFixedPrice
    },
    {
      stage: MintStage.FINAL_AUCTION,
      render: renderEnglishAuction
    }
  ];

  return (
    <>
      <div>
        {allStages.map(({ stage, render }) => (
          <div key={stage} className="border-t border-black">
            {((currentStage === stage) || 
              (currentStage === MintStage.EARLY_ADOPTERS_PUBLIC && stage === MintStage.EARLY_ADOPTERS)) ? (
              render()
            ) : (
              <div className="py-2">
                <h3 className="text-black text-sm font-['Azeret Mono'] leading-6">
                  {STAGE_CONFIGS[stage].title}
                </h3>
              </div>
            )}
          </div>
        ))}
      </div>
    </>
  )
}