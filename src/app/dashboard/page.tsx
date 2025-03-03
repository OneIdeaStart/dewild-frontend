'use client'

import { CollabButton } from '@/components/web3/CollabButton'
import { StepInfoButton } from '@/components/web3/StepInfoButton'
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
          <div className="px-10 pt-10 pb-4 bg-[#D41123] rounded-2xl flex flex-col justify-between h-full relative">
          <div className="absolute inset-0 rounded-2xl z-[2] bg-gradient-to-t from-black/50 to-black/10"></div>
            
            <div className="relative z-[3]">
              <h2 className="text-[32px] leading-[32px] text-white font-extrabold font-['Sofia Sans Extra Condensed'] uppercase mb-4">
                Step 1. Send Request
              </h2>
              <p className="text-[24px] leading-[24px] text-white font-extrabold font-['Sofia Sans Extra Condensed'] uppercase">
                Connect wallet, verify Discord & X, submit your application, and wait for approval (up to 24 hours).
              </p>
            </div>
  
            <div className="absolute bottom-0 left-0 right-0 rounded-b-2xl overflow-hidden z-[1]">
              <img 
                src="/images/collab-1.png" 
                alt="Step 1" 
                className="w-full h-full object-cover object-bottom"
              />
            </div>
  
            <div className="relative z-[3] w-full flex flex-col items-center gap-2">
              <div className="w-full">
                <CollabButton />
              </div>
              <StepInfoButton 
                step={1}
                title="Sending Your Collab Request"
                description="The first step in joining DeWild is submitting your collaboration request. This process involves connecting your wallet and verifying your social media accounts to ensure you're a real artist ready to contribute to our community."
                requirements={[
                  "Connect your Web3 wallet (Metamask, etc.)",
                  "Have active Discord account",
                  "Have active Twitter/X account",
                  "Follow DeWild on social media"
                ]}
                tips={[
                  "Make sure your social media profiles showcase your art or creative work",
                  "Have your wallet ready with enough ETH for gas fees",
                  "Keep an eye on your email for approval notifications"
                ]}
              />
            </div>
          </div>
  
          {/* Step 2 */}
          <div className="px-10 pt-10 pb-4 bg-[#E5D010] rounded-2xl flex flex-col justify-between h-full relative">
          <div className="absolute inset-0 rounded-2xl z-[2] bg-gradient-to-t from-black/50 to-black/10"></div>
            
            <div className="relative z-[3]">
              <h2 className="text-[32px] leading-[32px] text-white font-extrabold font-['Sofia Sans Extra Condensed'] uppercase mb-4">
                Step 2. Generate
              </h2>
              <p className="text-[24px] leading-[24px] text-white font-extrabold font-['Sofia Sans Extra Condensed'] uppercase">
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
  
            <div className="relative z-[3] w-full flex flex-col items-center gap-2">
              <div className="w-full">
                <PromptButton />
              </div>
              <StepInfoButton 
                step={2}
                title="Generating Your NFT"
                description="After approval, you'll receive a unique prompt to generate your NFT using our AI system. This is where your creativity comes into play as you customize and perfect your digital creation."
                requirements={[
                  "Approved collaboration request",
                  "Understanding of basic AI prompt concepts",
                  "Patience for generation process"
                ]}
                tips={[
                  "Experiment with different variations of your prompt",
                  "Consider the overall aesthetic of the collection",
                  "Take your time to get the perfect result"
                ]}
              />
            </div>
          </div>
  
          {/* Step 3 */}
          <div className="px-10 pt-10 pb-4 bg-[#09712D] rounded-2xl flex flex-col justify-between h-full relative">
          <div className="absolute inset-0 rounded-2xl z-[2] bg-gradient-to-t from-black/50 to-black/10"></div>
            
            <div className="relative z-[3]">
              <h2 className="text-[32px] leading-[32px] text-white font-extrabold font-['Sofia Sans Extra Condensed'] uppercase mb-4">
                Step 3. Upload Image
              </h2>
              <p className="text-[24px] leading-[24px] text-white font-extrabold font-['Sofia Sans Extra Condensed'] uppercase">
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
  
            <div className="relative z-[3] w-full flex flex-col items-center gap-2">
              <div className="w-full">
                <UploadButton />
              </div>
              <StepInfoButton 
                step={3}
                title="Uploading Your Creation"
                description="Once you're satisfied with your generated artwork, it's time to upload it to our platform. This step includes adding metadata and ensuring your NFT meets our quality standards."
                requirements={[
                  "Successfully generated NFT image",
                  "Prepared metadata information",
                  "Image meets technical requirements"
                ]}
                tips={[
                  "Double-check your image resolution and format",
                  "Write compelling metadata descriptions",
                  "Save backup copies of your work"
                ]}
              />
            </div>
          </div>
  
          {/* Step 4 */}
          <div className="px-10 pt-10 pb-4 bg-[#39A4D4] rounded-2xl flex flex-col justify-between h-full relative">
          <div className="absolute inset-0 rounded-2xl z-[2] bg-gradient-to-t from-black/50 to-black/10"></div>
            
            <div className="relative z-[3]">
              <h2 className="text-[32px] leading-[32px] text-white font-extrabold font-['Sofia Sans Extra Condensed'] uppercase mb-4">
                Step 4. Mint NFT
              </h2>
              <p className="text-[24px] leading-[24px] text-white font-extrabold font-['Sofia Sans Extra Condensed'] uppercase">
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
  
            <div className="relative z-[3] w-full flex flex-col items-center gap-2">
              <div className="w-full">
                <MintButton />
              </div>
              <StepInfoButton 
                step={4}
                title="Minting Your NFT"
                description="The final step is minting your NFT on the blockchain. This is where your digital creation becomes a permanent part of the DeWild collection and can be listed for auction."
                requirements={[
                  "Approved upload",
                  "ETH for minting (gas fees)",
                  "Connected wallet"
                ]}
                tips={[
                  "Monitor gas fees for optimal minting time",
                  "Have a strategy for your initial listing price",
                  "Prepare your marketing approach for the auction"
                ]}
              />
            </div>
          </div>
        </div>
      </div>
    )
  }