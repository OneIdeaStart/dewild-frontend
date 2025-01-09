// src/components/sections/MintStages.tsx
'use client';

export function MintStages() {
  return (
    <section className="w-full pt-40 pb-20 px-3 flex flex-col items-center gap-20">
      {/* Title */}
      <h2 className="text-[72px] leading-[48px] font-bold text-primary-black">
        mint stages
      </h2>

      {/* Stages Container */}
      <div className="w-full max-w-[960px] grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-10">
        {/* Stage 1 - Whitelist */}
        <div className="p-4 bg-accent-yellow rounded-2xl flex flex-col gap-3">
          <h3 className="text-[#48926D] text-[32px] leading-[32px] font-bold uppercase">
            1. Join Whitelist
          </h3>
          <div className="w-fit px-2 bg-accent-green rounded">
            <span className="text-[14px] leading-[16px] text-[#99C1D7] font-bold uppercase">
              Stage 1
            </span>
          </div>
          <p className="text-[#48926D] text-[24px] leading-[24px] font-bold uppercase">
            10,000 spots. The first 999 get access to the Free Mint in Phase 2. all whitelisted users can mint at 0.0011 $ETH in stage 3.
          </p>
        </div>

        {/* Stage 2 - Free Mint */}
        <div className="p-4 bg-accent-burgundy rounded-2xl flex flex-col gap-3">
          <h3 className="text-[#EFB260] text-[32px] leading-[32px] font-bold uppercase">
            2. Free mint
          </h3>
          <div className="w-fit px-2 bg-accent-blue rounded">
            <span className="text-[14px] leading-[16px] text-[#7EF3E1] font-bold uppercase">
              Stage 2
            </span>
          </div>
          <p className="text-[#EFB260] text-[24px] leading-[24px] font-bold uppercase">
            999 NFTs, price: 0 $ETH (gas only). Whitelist only, 1 NFT per wallet. Minting lasts 24 hours. Any unminted NFTs roll into Phase 3.
          </p>
        </div>

        {/* Stage 3 - Early Adopters */}
        <div className="p-4 bg-accent-blue rounded-2xl flex flex-col gap-3">
          <h3 className="text-[#7EF3E1] text-[32px] leading-[32px] font-bold uppercase">
            3. Early Adopters mint
          </h3>
          <div className="w-fit px-2 bg-accent-burgundy rounded">
            <span className="text-[14px] leading-[16px] text-[#FDC867] font-bold uppercase">
              Stage 3
            </span>
          </div>
          <p className="text-[#7EF3E1] text-[24px] leading-[24px] font-bold uppercase">
            1,111 NFTs, price: 0.0011 $ETH. Whitelist gets 24 hours to mint up to 11 NFTs per wallet, then opens to everyone.
          </p>
        </div>

        {/* Stage 4 - Fixed Price */}
        <div className="p-4 bg-accent-pink rounded-2xl flex flex-col gap-3">
          <h3 className="text-[#026551] text-[32px] leading-[32px] font-bold uppercase">
            4. Public mint
          </h3>
          <div className="w-fit px-2 bg-[#1F315F] rounded">
            <span className="text-[14px] leading-[16px] text-[#DA8D67] font-bold uppercase">
              Stage 4
            </span>
          </div>
          <p className="text-[#026551] text-[24px] leading-[24px] font-bold uppercase">
            8,888 NFTs, price: 0.011 $ETH. Public mint at a fair, fixed price. Reveal happens mid-round or later.
          </p>
        </div>

        {/* Stage 5 - English Auction */}
        <div className="p-4 bg-accent-green rounded-2xl flex flex-col gap-3">
          <h3 className="text-[#99C1D7] text-[32px] leading-[32px] font-bold uppercase">
            5. English auction
          </h3>
          <div className="w-fit px-2 bg-accent-orange rounded">
            <span className="text-[14px] leading-[16px] text-[#CA0D21] font-bold uppercase">
              Stage 5
            </span>
          </div>
          <p className="text-[#99C1D7] text-[24px] leading-[24px] font-bold uppercase">
            1 NFT, start price: 0.11 $ETH. The final NFT goes to the highest bidder. Auction ends after 24 hours with no new bids.
          </p>
        </div>
      </div>
    </section>
  );
}