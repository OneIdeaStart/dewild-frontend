'use client';

import { useEffect, useState } from 'react'
import { NFTCarousel } from '@/components/sections/NFTCarousel'
import { Button } from '@/components/ui/button'
import { useMintStage } from '@/hooks/useMintStage'
import { useAppKitAccount } from '@reown/appkit/react'
import { MintStage } from '@/types/mint-stages'
import { STAGE_CONFIGS } from '@/config/mint-stages'
import WhitelistDialog from '@/components/dialogs/WhitelistDialog'
import { WhitelistButton } from '@/components/web3/WhitelistButton'
import { useMintStageContext } from '@/context/MintStageContext';
import { cn } from '@/lib/utils';

export function MintSection() {
  const { address } = useAppKitAccount()
  const { stageConfig, canInteract, checkWhitelistStatus } = useMintStage()
  const { isWhitelisted, currentStage } = useMintStageContext();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [showConnectWalletError, setShowConnectWalletError] = useState(false)

  // Обработчики
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

  const handleAction = () => {
    switch (currentStage) {
      case MintStage.WHITELIST_REGISTRATION:
        handleWhitelistClick()
        break;
      case MintStage.FREE_MINT:
        console.log('Free mint action')
        break;
      case MintStage.EARLY_ADOPTERS:
        console.log('Early adopters mint action')
        break;
      case MintStage.FIXED_PRICE:
        console.log('Fixed price mint action')
        break;
      case MintStage.FINAL_AUCTION:
        console.log('Auction action')
        break;
      case MintStage.SOLD_OUT:
        window.open('https://opensea.io/collection/dewild', '_blank')
        break;
    }
  }

  const renderWhitelistJoin = () => {
    const [isLoaded, setIsLoaded] = useState(false);
    const { isWhitelistFull } = useMintStageContext();
   
    useEffect(() => {
      setIsLoaded(true);
    }, []);
   
    return (
      <div className="h-full flex flex-col px-3">
        <div className="flex-1 min-h-10" />
        
        <div className="flex flex-col items-center gap-10">
          {/* Title - добавляем адаптивные размеры и центрирование */}
          <h1 className="w-full text-center text-[72px] sm:text-[96px] leading-[48px] sm:leading-[64px] font-bold uppercase text-primary-black">
            <span 
              className={`inline-block opacity-0 scale-y-0 ${
                isLoaded ? 'animate-reveal' : ''
              }`}
            >
              DeWild
            </span>{" "}
            <span 
              className={`inline-block opacity-0 scale-y-0 ${
                isLoaded ? 'animate-reveal' : ''
              }`}
              style={{ animationDelay: '150ms' }}
            >
              Club
            </span>
          </h1>
    
          {/* NFT Preview Images */}
          <NFTCarousel />
    
          {/* Description */}
          <p 
            className={`max-w-[468px] text-[24px] leading-[24px] text-text-gray text-center font-bold uppercase opacity-0 ${
              isLoaded ? 'animate-reveal-text' : ''
            }`}
            style={{ animationDelay: '0.6s' }}
          >
            11,111 unique PFP nfts for wildest DeFi souls on Base chain! Join the wild side of DeFi – where your portfolio isn't the only thing that gets a little crazy.
          </p>
        </div>
    
        <div className="flex-1 min-h-10" />
    
        {/* Button container */}
        <div 
          className={`h-20 flex flex-col items-center gap-3 opacity-0 scale-[3] ${
            isLoaded ? 'animate-button-fall' : ''
          }`} 
          style={{ animationDelay: '0.9s' }}
        >
          <span className="text-[16px] leading-[16px] text-text-gray font-bold uppercase">
            {isWhitelistFull ? 'Stage 1/5. Completed' : 'Stage 1/5. Active'}
          </span>
          <WhitelistButton />
        </div>
    
        <div className="flex-1 min-h-10 pb-[36px]" />
      </div>
    )
   }

  // Остальные методы рендера оставляем как есть
  const renderFreeMint = () => (
    <div>Free Mint Stage - TODO</div>
  )

  const renderEarlyAdopters = () => (
    <div>Early Adopters Stage - TODO</div>
  )

  const renderFixedPrice = () => (
    <div>Fixed Price Stage - TODO</div>
  )

  const renderEnglishAuction = () => (
    <div>English Auction Stage - TODO</div>
  )

  const renderSoldOut = () => (
    <div>Sold Out Stage - TODO</div>
  )

  // Рендер текущей стадии
  const renderCurrentStage = () => {
    switch (currentStage) {
      case MintStage.WHITELIST_REGISTRATION:
        return renderWhitelistJoin();
      case MintStage.FREE_MINT:
        return renderFreeMint();
      case MintStage.EARLY_ADOPTERS:
      case MintStage.EARLY_ADOPTERS_PUBLIC:
        return renderEarlyAdopters();
      case MintStage.FIXED_PRICE:
        return renderFixedPrice();
      case MintStage.FINAL_AUCTION:
        return renderEnglishAuction();
      case MintStage.SOLD_OUT:
        return renderSoldOut();
      default:
        return renderWhitelistJoin();
    }
  };

  return renderCurrentStage();
}