// src/components/sections/Roadmap.tsx
'use client';

export function Roadmap() {
 const roadmapItems = [
   {
     number: "1",
     title: "Q1: Unleashing the Wild",
     bulletPoints: [
       "Mint early adopters NFTs: 999 free, 1,111 at 0.0011 ETH.",
       "Fixed price mint for 8,888 NFTs at 0.011 ETH.",
       "Reveal all stage 2 NFTs.",
       "Final auction for NFT #11111.",
       "Launch DeBank account for tracking and community raffles."
     ],
     paddingTop: "pt-0 sm:pt-0 lg:pt-0"
   },
   {
     number: "2",
     title: "Q2: Building the Wild Hub",
     bulletPoints: [
       "Launch NFT Holder Dashboard with stats, rarity tools, and rewards.",
       "Announce DeWild tokenomics and roadmap for token integration.",
       "Introduce community voting for new features and utilities.",
       "Host exclusive raffles and giveaways for NFT holders."
     ],
     paddingTop: "pt-0 sm:pt-12 lg:pt-12"
   },
   {
     number: "3",
     title: "Q3: Token Time",
     bulletPoints: [
       "Launch DeWild token with staking features for rewards.",
       "Conduct airdrop for loyal NFT holders.",
       "Expand dashboard functionality with token-based tools.",
       "Begin partnerships to explore cross-chain integrations."
     ],
     paddingTop: "pt-0 sm:pt-0 lg:pt-24"
   },
   {
     number: "4",
     title: "Q4: The Great Expansion",
     bulletPoints: [
       "Release exclusive merch designed with community input.",
       "Add new utilities and interactive features to the dashboard.",
       "Plan the next mint or launch new token utilities.",
       "Establish DeWild as the go-to Layer 2 NFT collection."
     ],
     paddingTop: "pt-0 sm:pt-12 lg:pt-36"
   }
 ];

 const ItemCard = ({ item }: { item: typeof roadmapItems[0] }) => (
   <div className={`flex flex-col gap-6 ${item.paddingTop} lg:${item.paddingTop}`}>
     <div className="flex items-center relative">
       <div className="w-[75px] h-24 relative flex justify-center items-center">
         <img 
           className="w-[75px] h-[96px] absolute z-0" 
           src={`/images/roadmap-${item.number}.png`}
           alt={`Roadmap ${item.number}`}
           width={100}
           height={100}
           style={{
             maxWidth: '100px',
             maxHeight: '100px',
           }}
         />
       </div>
       <div className="text-white text-[128px] -ml-[30px] font-thin italic uppercase leading-6 font-['Azeret Mono'] relative z-10">
         {item.number}.
       </div>
     </div>
     <div className="flex flex-col gap-2">
       <div className="text-white text-sm font-bold font-['Azeret Mono'] leading-6">
         {item.title}
       </div>
       <ul className="list-disc pl-4">
         {item.bulletPoints.map((point, index) => (
           <li key={index} className="text-white text-sm font-normal font-['Azeret Mono'] leading-6">
             {point}
           </li>
         ))}
       </ul>
     </div>
   </div>
 );

 return (
   <section id="roadmap" className="w-full bg-black overflow-hidden">
     <div className="w-full px-3 md:px-6 pt-16 pb-16 lg:pb-0 flex flex-col gap-12">
       {/* Title */}
       <div className="text-left sm:text-right text-white text-[48px] sm:text-[64px] font-normal font-['Azeret Mono'] leading-[48px] sm:leading-[64px]">
         Roadmap<br/>2025
       </div>
       
       {/* Roadmap Items */}
       <div className="w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 gap-x-24 gap-y-12">
         {roadmapItems.map((item, index) => (
           <ItemCard key={index} item={item} />
         ))}
       </div>

       {/* Bottom Text */}
       <div className="w-full flex flex-col lg:flex-row justify-between items-start mt-24">
         <div className="text-white text-lg md:text-2xl font-normal uppercase leading-[26px] md:leading-9 font-['Azeret Mono']">
           All this and more is possible if the full collection mints: raffles, exclusive events, seasonal drops, dashboard upgrades, creative contests, milestone airdrops, Layer 2 collaborations, and community-driven innovation. Together, we'll make DeWild the ultimate Layer 2 NFT experience!
         </div>
         <div className="hidden lg:block lg:pt-32 w-full lg:w-auto flex justify-end -mr-3 md:-mr-6 lg:flex-shrink-0">
            <div className="w-[256px] lg:w-[512px] h-[256px] lg:h-[512px]">
              <img 
                className="w-full h-full object-contain"
                src="/images/roadmap-rat.png"
                alt="Roadmap"
                width={512}
                height={512}
              />
            </div>
          </div>
       </div>
     </div>
   </section>
 );
}