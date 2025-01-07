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
      <div className="w-full max-w-[960px] grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-10">
        {/* Genesis Card */}
        <div className="p-4 bg-primary-black rounded-xl flex flex-col gap-3">
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
              Mint Genesis on Zora, enter the raffle for NFT #1. More Genesises = better chances. Surprises included.
            </p>
          </div>
          <button className="w-full py-2 px-8 bg-accent-orange rounded-xl">
            <span className="text-[#CA0D21] text-[24px] leading-[36px] font-bold uppercase">
              Mint on Zora
            </span>
          </button>
        </div>

        {/* Repost Card */}
        <div className="p-4 bg-primary-black rounded-xl flex flex-col gap-3">
          <div className="w-[112px] h-[112px] bg-[#EEEEEE] rounded-xl flex items-center justify-center">
            <svg width="81" height="72" viewBox="0 0 81 72" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M63.5779 0H75.9126L48.8299 30.5535L80.4711 72H55.6408L36.2002 46.8133L13.9441 72H1.60936L30.301 39.321L0.000488281 0H25.4475L43.0111 23.0081L63.5779 0ZM59.2607 64.8266H66.0985L21.8544 6.90775H14.5072L59.2607 64.8266Z" fill="black"/>
            </svg>
          </div>
          <div className="flex flex-col gap-3">
            <h3 className="text-white text-[32px] leading-[32px] font-bold uppercase">
              Repost to Win
            </h3>
            <p className="text-[#606060] text-[24px] leading-[24px] font-bold uppercase">
              Follow us and Retweet our pinned post on X.com for a shot at 1 of 10 NFTs. Easy win, big rewards!
            </p>
          </div>
          <button className="w-full py-2 px-8 bg-accent-purple rounded-xl">
            <span className="text-accent-yellow text-[24px] leading-[36px] font-bold uppercase">
              Make Repost
            </span>
          </button>
        </div>

        {/* DeBank Card */}
        <div className="p-4 bg-primary-black rounded-xl flex flex-col gap-3">
          <div className="w-[112px] h-[112px] bg-[#EEEEEE] rounded-xl flex items-center justify-center">
            <svg width="64" height="72" viewBox="0 0 64 72" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path opacity="0.8" d="M63.317 50.4265C63.317 62.3318 53.4971 72 41.4024 72H-0.000488281V57.5924H41.4024C45.3834 57.5924 48.6061 54.3697 48.6061 50.3886C48.6061 46.4076 45.3834 43.1848 41.4024 43.1848H26.8052V28.8152H41.4024C45.3834 28.8152 48.6061 25.5924 48.6061 21.6114C48.6061 17.6303 45.3834 14.4076 41.4024 14.4076H-0.000488281V0H41.4024C53.4971 0.0379147 63.317 9.70616 63.317 21.6114C63.317 26.9573 61.3455 32.0758 57.7436 36.019C61.3455 39.9621 63.317 45.1185 63.317 50.4265Z" fill="#FE815F"/>
              <path opacity="0.12" d="M-0.000488281 57.5924H35.5635C28.0185 66.3128 15.9995 72 2.46397 72C1.62984 72 0.833634 71.9621 0.0374258 71.9242C-0.00048886 71.9621 -0.000488281 57.5924 -0.000488281 57.5924ZM42.9948 43.1848H29.2317V28.8152H42.9948C44.0943 33.5545 44.0943 38.4834 42.9948 43.1848ZM35.5635 14.4076H-0.000488281V0.0758282C0.79572 0.0379135 1.62984 0 2.42605 0C15.9616 0.0379147 27.9806 5.6872 35.5635 14.4076Z" fill="black"/>
              <path d="M-0.000488281 0.0371094C20.1701 0.0371094 36.5114 16.1509 36.5114 36.0182C36.5114 55.8855 20.1701 71.9992 -0.000488281 71.9992V57.5916C12.0943 57.5916 21.9142 47.9234 21.9142 36.0182C21.9142 24.1129 12.0943 14.4447 -0.000488281 14.4447V0.0371094Z" fill="#FF6238"/>
            </svg>
          </div>
          <div className="flex flex-col gap-3">
            <h3 className="text-white text-[32px] leading-[32px] font-bold uppercase">
              Follow debank
            </h3>
            <p className="text-[#606060] text-[24px] leading-[24px] font-bold uppercase">
              Follow us on debank.com and wait for lucky draws with a chance to win dewild nfts and other prizes.
            </p>
          </div>
          <button className="w-full py-2 px-8 bg-accent-pink rounded-xl">
            <span className="text-[#026551] text-[24px] leading-[36px] font-bold uppercase">
              Follow DeBank
            </span>
          </button>
        </div>
      </div>
    </section>
  );
}