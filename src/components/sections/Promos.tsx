// src/components/sections/Promos.tsx
'use client';

export function Promos() {
 return (
   <section id="promos" className="w-full px-3 md:px-6 py-16 flex flex-col gap-12">
     {/* Header */}
     <div className="w-full flex flex-col gap-6">
       <div className="text-black text-[48px] sm:text-[64px] font-normal font-['Azeret Mono'] leading-[48px] sm:leading-[64px]">
         Promos
       </div>
       <div className="text-black text-sm font-normal font-['Azeret Mono'] leading-[22px] max-w-[1200px]">
         Our promos are here to keep things exciting. Whether you're in it for the prizes or just the thrill, there's always something worth your attention. Stay tuned, stay involved, and you might just score big!
       </div>
     </div>

     {/* Promo Cards */}
     <div className="w-full flex flex-col md:flex-row gap-12">
       {/* Genesis Card */}
       <div className="w-full md:w-1/2 h-fit p-6 bg-[#002BFF] shadow-[-8px_8px_0px_0px_black]">
         <div className="flex flex-col sm:flex-row gap-6">
           <img 
             className="w-[160px] h-[160px] flex-shrink-0 object-cover"
             src="/images/promo-1.gif" 
             alt="Genesis Promo"
           />
           <div>
             <div>
               <h3 className="text-white text-2xl font-normal uppercase font-['Azeret Mono'] leading-9">
                 Mint Genesis, win Dewild #1
               </h3>
               <p className="text-white text-sm font-normal font-['Azeret Mono'] leading-[22px] mt-2">
                 Infinite possibilities. Mint on Zora.com, enter the raffle for NFT #1, and back the project. More Genesis NFTs = better chances. Surprises for early supporters included.
               </p>
               <button className="w-[160px] h-[40px] px-3 py-2 bg-white border border-black shadow-[-4px_4px_0px_0px_black] flex justify-center items-center mt-6">
                 <span className="text-black text-sm font-normal uppercase font-['Azeret Mono'] leading-6">
                   Mint Genesis
                 </span>
               </button>
             </div>
           </div>
         </div>
       </div>

       {/* Repost Card */}
       <div className="w-full md:w-1/2 h-fit p-6 bg-[#002BFF] shadow-[-8px_8px_0px_0px_black]">
         <div className="flex flex-col sm:flex-row gap-6">
           <img 
             className="w-[160px] h-[160px] flex-shrink-0 object-cover"
             src="/images/promo-2.gif" 
             alt="Repost Promo"
           />
           <div>
             <div>
               <h3 className="text-white text-2xl font-normal uppercase font-['Azeret Mono'] leading-9">
                 Repost to win
               </h3>
               <p className="text-white text-sm font-normal font-['Azeret Mono'] leading-[22px] mt-2">
                 Click. Share. Win. Retweet our pinned post on X.com for a shot at 1 of 10 NFTs. That's it. Easy win, big rewards!
               </p>
               <button className="w-[160px] h-[40px] px-3 py-2 bg-white border border-black shadow-[-4px_4px_0px_0px_black] flex justify-center items-center mt-6">
                 <span className="text-black text-sm font-normal uppercase font-['Azeret Mono'] leading-6">
                   Make repost
                 </span>
               </button>
             </div>
           </div>
         </div>
       </div>
     </div>
   </section>
 );
}