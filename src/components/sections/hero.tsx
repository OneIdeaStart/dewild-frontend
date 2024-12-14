// components/sections/hero.tsx
'use client'

import { Button } from '../ui/button'

export function Hero() {
 return (
   <div className="min-h-[90vh] w-full">
     <div className="w-full mx-auto px-6 pt-[88px] pb-6 flex flex-col justify-between h-full min-h-[90vh]">
       <div className="flex-1 flex flex-col justify-between h-full">
         {/* Top Part */}
         <div className="flex flex-col">
           {/* Current Stage */}
           <div className="border-t border-black">
             <div className="py-4 flex gap-20">
               {/* Stage Info */}
               <div className="flex-1">
                 <h3 className="text-sm font-bold mb-2">Stage 1. Early adopters mint</h3>
                 <p className="text-sm leading-6">
                   Free mint of 999 NFTs with instant reveal, exclusively for whitelisted degens with a limit of 1 NFT per wallet.
                 </p>
               </div>

               {/* Conditions */}
               <div className="flex-1">
                 <h4 className="text-sm font-bold mb-2">Conditions</h4>
                 <div className="space-y-0">
                   <div className="flex items-center gap-2">
                     <div className="w-2 h-2 rounded-full bg-[#AAAAAA]" />
                     <span className="text-[#002BFF] text-sm leading-6">Connect wallet</span>
                   </div>
                   <div className="flex items-center gap-2">
                     <div className="w-2 h-2 rounded-full bg-[#03CB00]" />
                     <span className="text-[#002BFF] text-sm leading-6">Follow us on X.com</span>
                   </div>
                   <div className="flex items-center gap-2">
                     <div className="w-2 h-2 rounded-full bg-[#AAAAAA]" />
                     <span className="text-[#002BFF] text-sm leading-6">Join our Telegram</span>
                   </div>
                 </div>
               </div>

               {/* Button */}
               <div>
                 <Button 
                   variant="primary"
                   className="w-40 shadow-[-4px_4px_0px_0px_#000000] uppercase"
                 >
                   Join whitelist
                 </Button>
               </div>
             </div>
           </div>

           {/* Other Stages */}
           {['Fixed price mint', 'English Auction'].map((stage, index) => (
             <div key={stage} className="border-t border-black">
               <div className="py-2">
                 <h3 className="text-sm leading-5">Stage {index + 2}. {stage}</h3>
               </div>
             </div>
           ))}
         </div>

         {/* Description */}
         <div>
           <h1 className="text-[120px] leading-[80px] -ml-2 mb-4">DeWild</h1>
           <p className="text-sm leading-6 max-w-[780px]">
             1/1 NFT collection of 11,111 PFPs for DeFi pioneers on Base Chain, for wildest souls of DeFi who live, trade, and farm between checking their DeBank notifications.
           </p>
         </div>
       </div>
     </div>
   </div>
 )
}