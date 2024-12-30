// src/components/sections/MintStages.tsx
'use client';

export function MintStages() {
 return (
   <section id="mint-stages" className="w-full bg-white px-3 md:px-6 py-16 flex flex-col items-end gap-32">
     <div className="w-full flex flex-col gap-12">
       {/* Title */}
       <div className="w-full text-black text-[48px] sm:text-[64px] font-normal font-['Azeret Mono'] leading-[48px] sm:leading-[64px]">
         Mint phases
       </div>

       {/* Stages Container */}
       <div className="w-full flex flex-col gap-6">
         {/* Stage 1 */}
         <div className="w-full pt-2 border-t border-black flex flex-col gap-2">
            <div className="text-black text-lg sm:text-2xl font-normal uppercase font-['Azeret Mono'] leading-6 sm:leading-9">
            Phase 1. Join Whitelist
            </div>
            <div className="text-black text-sm font-['Azeret Mono'] leading-6 max-w-[1200px]">
            <span className="font-bold">10,000 spots.</span> Be early, be rewarded! The first 999 get access to the Free Mint in Phase 2, and all whitelisted wallets can mint at 0.0011 $ETH in Phase 3.
            </div>
         </div>

         {/* Stage 2 */}
         <div className="w-full pt-2 border-t border-black flex flex-col gap-2">
            <div className="text-black text-lg sm:text-2xl font-normal uppercase font-['Azeret Mono'] leading-6 sm:leading-9">
            Phase 2. Free mint
            </div>
            <div className="text-black text-sm font-['Azeret Mono'] leading-6 max-w-[1200px]">
            <span className="font-bold">999 NFTs, price: 0 $ETH (gas only).</span> Whitelist only, 1 NFT per wallet. Minting lasts 24 hours. Any unminted NFTs roll into Phase 3.
            </div>
         </div>

         {/* Stage 3 */}
         <div className="w-full pt-2 border-t border-black flex flex-col gap-2">
            <div className="text-black text-lg sm:text-2xl font-normal uppercase font-['Azeret Mono'] leading-6 sm:leading-9">
            Phase 3. Early adopters mint
            </div>
            <div className="text-black text-sm font-['Azeret Mono'] leading-6 max-w-[1200px]">
            <span className="font-bold">1,111 NFTs, price: 0.0011 $ETH.</span> Whitelist gets 24 hours to mint up to 11 NFTs per wallet, then opens to everyone. This phase continues until all NFTs are minted.
            </div>
         </div>

         {/* Stage 4 */}
         <div className="w-full pt-2 border-t border-black flex flex-col gap-2">
            <div className="text-black text-lg sm:text-2xl font-normal uppercase font-['Azeret Mono'] leading-6 sm:leading-9">
            Phase 4. Fixed price mint
            </div>
            <div className="text-black text-sm font-['Azeret Mono'] leading-6 max-w-[1200px]">
            <span className="font-bold">8,888 NFTs, price: 0.011 $ETH.</span> Public mint at a fair, fixed price. This phase runs until all NFTs are minted. Reveal happens mid-round or later – stay tuned!
            </div>
         </div>

         {/* Stage 5 */}
         <div className="w-full pt-2 border-t border-black flex flex-col gap-2">
            <div className="text-black text-lg sm:text-2xl font-normal uppercase font-['Azeret Mono'] leading-6 sm:leading-9">
            Phase 5. English auction
            </div>
            <div className="text-black text-sm font-['Azeret Mono'] leading-6 max-w-[1200px]">
            <span className="font-bold">1 NFT, start price: 0.11 $ETH.</span> The final NFT goes to the highest bidder. The auction ends after 24 hours with no new bids.
            </div>
         </div>
       </div>
     </div>
   </section>
 );
}