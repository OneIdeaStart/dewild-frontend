// src/components/sections/CollabStages.tsx
'use client';

export function CollabStages() {
  return (
    <section className="w-full pt-40 pb-20 px-3 flex flex-col items-center gap-20">
      {/* Title */}
      <h2 className="text-[72px] leading-[48px] font-bold text-primary-black">
        collab stages
      </h2>

      {/* Stages Container */}
      <div className="w-full max-w-[960px] grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-10">
        {/* Stage 1 - Whitelist */}
        <div className="p-4 bg-accent-yellow rounded-2xl flex flex-col gap-3">
          <h3 className="text-[#48926D] text-[32px] leading-[32px] font-bold uppercase">
            Apply for Collab
          </h3>
          <div className="w-fit px-2 bg-accent-green rounded">
            <span className="text-[14px] leading-[16px] text-[#99C1D7] font-bold uppercase">
              Step 1
            </span>
          </div>
          <p className="text-[#48926D] text-[24px] leading-[24px] font-bold uppercase">
          Go to the DeWild Collab App and submit your application to join the movement of fearless artists.
          </p>
        </div>

        {/* Stage 2 - Free Mint */}
        <div className="p-4 bg-accent-burgundy rounded-2xl flex flex-col gap-3">
          <h3 className="text-[#EFB260] text-[32px] leading-[32px] font-bold uppercase">
            Generate Your NFT
          </h3>
          <div className="w-fit px-2 bg-accent-blue rounded">
            <span className="text-[14px] leading-[16px] text-[#7EF3E1] font-bold uppercase">
              Step 2
            </span>
          </div>
          <p className="text-[#EFB260] text-[24px] leading-[24px] font-bold uppercase">
          Receive your unique prompt, add your creativity, and let AI bring your vision to life. Regenerate until it’s perfect.
          </p>
        </div>

        {/* Stage 3 - Early Adopters */}
        <div className="p-4 bg-accent-blue rounded-2xl flex flex-col gap-3">
          <h3 className="text-[#7EF3E1] text-[32px] leading-[32px] font-bold uppercase">
            Mint Your NFT
          </h3>
          <div className="w-fit px-2 bg-accent-burgundy rounded">
            <span className="text-[14px] leading-[16px] text-[#FDC867] font-bold uppercase">
              Step 3
            </span>
          </div>
          <p className="text-[#7EF3E1] text-[24px] leading-[24px] font-bold uppercase">
          Lock your creation on the blockchain, making it yours forever and undeniably unique.
          </p>
        </div>

        {/* Stage 4 - Fixed Price */}
        <div className="p-4 bg-accent-pink rounded-2xl flex flex-col gap-3">
          <h3 className="text-[#026551] text-[32px] leading-[32px] font-bold uppercase">
            List for Auction
          </h3>
          <div className="w-fit px-2 bg-[#1F315F] rounded">
            <span className="text-[14px] leading-[16px] text-[#DA8D67] font-bold uppercase">
              Step 4
            </span>
          </div>
          <p className="text-[#026551] text-[24px] leading-[24px] font-bold uppercase">
          Put your masterpiece up for auction and connect with collectors who value your creativity.
          </p>
        </div>

        {/* Stage 5 - English Auction */}
        <div className="p-4 bg-accent-green rounded-2xl flex flex-col gap-3">
          <h3 className="text-[#99C1D7] text-[32px] leading-[32px] font-bold uppercase">
            Enjoy the Impact
          </h3>
          <div className="w-fit px-2 bg-accent-orange rounded">
            <span className="text-[14px] leading-[16px] text-[#CA0D21] font-bold uppercase">
              Step 5
            </span>
          </div>
          <p className="text-[#99C1D7] text-[24px] leading-[24px] font-bold uppercase">
          Watch your bold statement spread across the digital world, sparking fearless conversations.
          </p>
        </div>
      </div>
    </section>
  );
}