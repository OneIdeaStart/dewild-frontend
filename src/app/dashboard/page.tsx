'use client'

import { CollabButton } from '@/components/web3/CollabButton'
import { PromptButton } from '@/components/web3/PromptButton'
import { UploadButton } from '@/components/web3/UploadButton'
import { MintButton } from '@/components/web3/MintButton'

export default function DashboardPage() {
  return (
    <div className="h-full flex flex-col p-6">
      {/* Верхняя часть с заголовком */}
      <div>
        <h1 className="text-5xl font-extrabold font-['Sofia Sans Extra Condensed'] uppercase mb-1">
          Welcome to DeWild Collab App
        </h1>
        <p className="text-2xl text-[#a8a8a8] font-extrabold font-['Sofia Sans Extra Condensed'] uppercase mb-8">
          Artist, creator, troublemaker? Perfect. Make art, make noise, make history. Mint your statement and let it live forever.
        </p>
      </div>

      {/* Карточки этапов */}
      <div className="grid grid-cols-4 gap-4 flex-1 h-full">
        {/* Step 1 */}
        <div className="p-10 bg-[#D41123] rounded-2xl flex flex-col justify-between h-full relative">
          <div className="absolute inset-0 bg-black/20 rounded-2xl z-[2]"></div>
          
          <div className="relative z-[3]">
            <h2 className="text-[32px] text-white font-extrabold font-['Sofia Sans Extra Condensed'] uppercase mb-4">
              Step 1. Send Request
            </h2>
            <p className="text-2xl text-white font-extrabold font-['Sofia Sans Extra Condensed'] uppercase">
              Connect your wallet, verify Discord & Twitter, and submit your application. Approval may take up to 24 hours.
            </p>
          </div>

          <div className="absolute bottom-0 left-0 right-0 rounded-b-2xl overflow-hidden z-[1]">
            <img 
              src="/images/collab-1.png" 
              alt="Step 1" 
              className="w-full h-full object-cover object-bottom"
            />
          </div>

          <div className="relative z-[3] w-full">
            <CollabButton />
          </div>
        </div>

        {/* Step 2 */}
        <div className="p-10 bg-[#E5D010] rounded-2xl flex flex-col justify-between h-full relative">
          <div className="absolute inset-0 bg-black/20 rounded-2xl z-[2]"></div>
          
          <div className="relative z-[3]">
            <h2 className="text-[32px] text-white font-extrabold font-['Sofia Sans Extra Condensed'] uppercase mb-4">
              Step 2. Generate
            </h2>
            <p className="text-2xl text-white font-extrabold font-['Sofia Sans Extra Condensed'] uppercase">
              Get your unique prompt, head to Replicate, and generate your PFP. Customize it for the best result.
            </p>
          </div>

          <div className="absolute bottom-0 left-0 right-0 rounded-b-2xl overflow-hidden z-[1]">
            <img 
              src="/images/collab-2.png" 
              alt="Step 2" 
              className="w-full h-full object-cover object-bottom"
            />
          </div>

          <div className="relative z-[3] w-full">
            <PromptButton />
          </div>
        </div>

        {/* Step 3 */}
        <div className="p-10 bg-[#09712D] rounded-2xl flex flex-col justify-between h-full relative">
          <div className="absolute inset-0 bg-black/20 rounded-2xl z-[2]"></div>
          
          <div className="relative z-[3]">
            <h2 className="text-[32px] text-white font-extrabold font-['Sofia Sans Extra Condensed'] uppercase mb-4">
              Step 3. Upload Image
            </h2>
            <p className="text-2xl text-white font-extrabold font-['Sofia Sans Extra Condensed'] uppercase">
              Save your generated image, upload it here, add metadata, and wait for approval (up to 24 hours).
            </p>
          </div>

          <div className="absolute bottom-0 left-0 right-0 rounded-b-2xl overflow-hidden z-[1]">
            <img 
              src="/images/collab-3.png" 
              alt="Step 3" 
              className="w-full h-full object-cover object-bottom"
            />
          </div>

          <div className="relative z-[3] w-full">
            <UploadButton />
          </div>
        </div>

        {/* Step 4 */}
        <div className="p-10 bg-[#39A4D4] rounded-2xl flex flex-col justify-between h-full relative">
          <div className="absolute inset-0 bg-black/20 rounded-2xl z-[2]"></div>
          
          <div className="relative z-[3]">
            <h2 className="text-[32px] text-white font-extrabold font-['Sofia Sans Extra Condensed'] uppercase mb-4">
              Step 4. Mint NFT
            </h2>
            <p className="text-2xl text-white font-extrabold font-['Sofia Sans Extra Condensed'] uppercase">
              Mint your NFT, head to DeWild.art, and list it for auction. Let the world see your boldest creation.
            </p>
          </div>

          <div className="absolute bottom-0 left-0 right-0 rounded-b-2xl overflow-hidden z-[1]">
            <img 
              src="/images/collab-4.png" 
              alt="Step 4" 
              className="w-full h-full object-cover object-bottom"
            />
          </div>

          <div className="relative z-[3] w-full">
            <MintButton />
          </div>
        </div>
      </div>
    </div>
  )
}