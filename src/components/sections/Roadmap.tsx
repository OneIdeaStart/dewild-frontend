// src/components/sections/Roadmap.tsx
'use client';

export function Roadmap() {
  const quarters = [
    {
      badge: {
        bg: "bg-accent-green",
        text: "text-[#99C1D7]",
      },
      quarter: "Q1",
      description: "We start by minting 2,222 NFTs – free and early adopters unite! With funds in hand, we finish the collection, launch the fixed price round, and hold the final auction. Oh, and the secondary market? It's opening. Get ready to trade like never before."
    },
    {
      badge: {
        bg: "bg-accent-blue",
        text: "text-[#7EF3E1]",
      },
      quarter: "Q2",
      description: "First, we settle debts (because responsibility, right?). Then, we crank up the fun with wild giveaways, insane promotions, and a shiny new dashboard for holders that'll make your NFTs feel like VIPs."
    },
    {
      badge: {
        bg: "bg-accent-orange",
        text: "text-[#CA0D21]",
      },
      quarter: "Q3",
      description: "We reveal the long-awaited $WILD tokenomics and supercharge the dashboard with more features. Bigger raffles, crazier contests, and, yes, the token launch. Staking, rewards, and endless DeFi fun are on the way."
    },
    {
      badge: {
        bg: "bg-accent-purple",
        text: "text-[#FFDD00]",
      },
      quarter: "Q4",
      description: "We drop exclusive, community-designed merch and evolve the dashboard with new tools. Next up? Planning the future: a new mint or token utilities. By year's end, DeWild will own Layer 2, and you'll be part of the legend."
    }
  ];

  return (
    <section className="w-full py-40 pb-40 bg-primary-black flex justify-center">
      <div className="flex-1 flex flex-col items-center gap-20 max-w-[472px] px-3">
        {/* Title */}
        <h2 className="w-full text-center text-white text-[72px] leading-[48px] font-bold">
          roadmap
        </h2>

        {/* Quarters */}
        <div className="w-full flex flex-col gap-20">
          {quarters.map((quarter, index) => (
            <div 
              key={index} 
              className="flex flex-col items-center gap-4"
            >
              {/* Quarter Badge */}
              <div className={`${quarter.badge.bg} rounded-2xl px-5 py-4`}>
                <span className={`${quarter.badge.text} text-[32px] leading-[32px] font-bold`}>
                  {quarter.quarter}
                </span>
              </div>

              {/* Description */}
              <p className="w-full text-center text-text-secondary text-[24px] leading-[24px] font-bold uppercase">
                {quarter.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}