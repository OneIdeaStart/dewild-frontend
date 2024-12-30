// src/components/sections/hero.tsx
'use client';

import { MintSection } from '@/components/sections/MintSection'
import { useMintStage } from '@/hooks/useMintStage'
import { MintStage } from '@/types/mint-stages'

export function Hero() {
  const { currentStage } = useMintStage()

  return (
    <div className="min-h-[95vh] w-full">
      <div className="w-full min-h-[95vh] mx-auto px-3 md:px-6 pt-[72px] pb-6 flex flex-col">
        {/* Top Part с MintSection теперь будет растягиваться */}
        <div className="flex-1">
          <div className="flex flex-col pb-16">
            <div className="flex flex-col">
              <MintSection />
            </div>
          </div>
        </div>

        {/* Description теперь всегда будет прижат к низу */}
        <div className="mt-auto">
          <h1 className="text-[clamp(64px,12vw,120px)] leading-[clamp(48px,9vw,80px)] md:-ml-2 mb-4">
            DeWild
          </h1>
          <p className="text-sm leading-6 max-w-[780px]">
            11,111 unique PFPs for the wildest DeFi souls on Base Chain! Join the wild side of DeFi where your portfolio isn't the only thing that gets a little crazy.
          </p>
        </div>
      </div>
    </div>
  )
}