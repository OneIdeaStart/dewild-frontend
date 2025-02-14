// src/components/sections/Promos.tsx
'use client';

export function Promos() {
  return (
    <section id="promos" className="w-full pt-40 pb-40 px-3 flex flex-col items-center gap-20">
      {/* Title */}
      <h2 className="text-[72px] leading-[48px] font-bold text-primary-black">
        promos
      </h2>

      {/* Promo Cards */}
      <div className="w-full max-w-[960px] grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-10">
        {/* Genesis Card */}
        <div className="p-4 bg-primary-black rounded-xl flex flex-col gap-4">
          <div className="w-[112px] h-[112px] bg-[#EEEEEE] rounded-xl flex items-center justify-center">
            <img 
              src="/images/logo-zora.png"
              alt="Genesis Promo"
              className="w-[72px] h-[72px]"
            />
          </div>
          <div className="flex flex-col gap-3">
            <h3 className="text-white text-[32px] leading-[32px] font-bold uppercase">
              Win DeWild #1
            </h3>
            <p className="text-[#606060] text-[24px] leading-[24px] font-bold uppercase">
            Mint a Genesis NFT on Zora and enter the raffle to win DeWild #1 — the first NFT ever created in the collection. More Genesis NFTs = more chances. Surprises included for lucky participants!
            </p>
          </div>
          <a 
            href="https://zora.co/collect/base:0x166256b2e874f2b7d8144568e8d82435ee0245e3/1" 
            target="_blank" 
            rel="noopener noreferrer"
            className="w-full"
          >
            <button className="w-full py-2 px-8 bg-accent-orange rounded-xl">
              <span className="text-[#CA0D21] text-[24px] leading-[36px] font-bold uppercase">
                Mint Genesis
              </span>
            </button>
          </a>
        </div>

        {/* Repost Card */}
        <div className="p-4 bg-primary-black rounded-xl flex flex-col gap-4">
          <div className="w-[112px] h-[112px] bg-[#EEEEEE] rounded-xl flex items-center justify-center">
            <svg width="81" height="72" viewBox="0 0 81 72" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M63.5779 0H75.9126L48.8299 30.5535L80.4711 72H55.6408L36.2002 46.8133L13.9441 72H1.60936L30.301 39.321L0.000488281 0H25.4475L43.0111 23.0081L63.5779 0ZM59.2607 64.8266H66.0985L21.8544 6.90775H14.5072L59.2607 64.8266Z" fill="black"/>
            </svg>
          </div>
          <div className="flex flex-col gap-3">
            <h3 className="text-white text-[32px] leading-[32px] font-bold uppercase">
              Mint Your Statement
            </h3>
            <p className="text-[#606060] text-[24px] leading-[24px] font-bold uppercase">
            Follow us on X.com, like and repost our pinned post, and drop a bold message in the comments. The best messages will get the chance to mint their own NFT and become part of DeWild history.
            </p>
          </div>
          <a 
            href="https://x.com/DeWildClub" 
            target="_blank" 
            rel="noopener noreferrer"
            className="w-full"
          >
            <button className="w-full py-2 px-8 bg-accent-purple rounded-xl">
              <span className="text-accent-yellow text-[24px] leading-[36px] font-bold uppercase">
                Follow on X
              </span>
            </button>
          </a>
        </div>
      </div>
    </section>
  );
}