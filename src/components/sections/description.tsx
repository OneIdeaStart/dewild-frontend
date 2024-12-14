// src/components/sections/Description.tsx
'use client';

export function Description() {
  return (
    <section className="w-full bg-black overflow-hidden">
      <div className="w-full px-6 py-16 flex flex-col items-center gap-32">
        {/* Welcome Text */}
        <div className="text-[#E0E0E0] text-2xl font-normal uppercase leading-9">
        Welcome into DeWild, where 'wild' means as free as your leverage is high! We're 11,111 NFTs celebrating those crazy enough to call DeFi their lifestyle - from degen traders who check liquidations more often than their dating apps, to yield farmers who believe 100% APY is "playing it safe". Whether you're refreshing DeBank every 30 seconds to track your portfolio (we know you do), aping into tokens faster than you can read their names, or just vibing with the community that truly gets your financial choices (try explaining 10x leverage to your mom) - this collection is your digital badge of honor in the wild world of decentralized finance.
        </div>

        {/* Lines Container */}
        <div className="w-full h-[250px] relative">
          <div className="absolute w-[200%] left-[-75%] flex flex-col gap-20 -rotate-3">
            {/* Red Line */}
            <div className="w-full px-1 bg-[#DE0401] rotate-6 flex justify-center items-center whitespace-nowrap">
              <div className="text-[#FFD84B] text-5xl font-normal uppercase leading-[48px]">
                Wild Means Free Wild Means Free Wild Means Free Wild Means Free Wild Means Free
              </div>
            </div>

            {/* Yellow Line */}
            <div className="w-full px-1 bg-[#FFD84B] -rotate-3 flex justify-center items-center whitespace-nowrap">
              <div className="text-[#DE0401] text-5xl font-normal uppercase leading-[48px]">
                Free Wild Means Free Wild Means Free Wild Means Free Wild Means Free Wild Means Free
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}