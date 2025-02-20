// src/app/dashboard/page.tsx
import { CollabButton } from '@/components/web3/CollabButton'

export default function DashboardPage() {
    return (
      <div className="h-full flex flex-col p-6">  {/* Добавили h-full */}
        {/* Верхняя часть с заголовком */}
        <div>
          <h1 className="text-5xl font-extrabold font-['Sofia Sans Extra Condensed'] uppercase mb-1">
            Welcome to DeWild Collab App
          </h1>
          <p className="text-2xl text-[#a8a8a8] font-extrabold font-['Sofia Sans Extra Condensed'] uppercase mb-8">
            Artist, creator, troublemaker? Perfect. Make art, make noise, make history. Mint your statement and let it live forever.
          </p>
        </div>
  
        {/* Карточки этапов - занимают все оставшееся пространство */}
        <div className="grid grid-cols-4 gap-4 flex-1 h-full">
            {/* Step 1 */}
            <div className="p-10 bg-[#D41123] rounded-2xl flex flex-col justify-between h-full relative">
            {/* Изображение */}
            <div className="absolute bottom-0 left-0 right-0 rounded-b-2xl overflow-hidden z-[1]">
                <img 
                src="/images/collab-1.png" 
                alt="Step 1" 
                className="w-full h-full object-cover object-bottom"
                />
            </div>

            {/* Затемнение */}
            <div className="absolute inset-0 bg-black/20 rounded-2xl z-[2]"></div>
            
            {/* Контент */}
            <div className="relative z-[3]">
                <h2 className="text-[32px] text-white font-extrabold font-['Sofia Sans Extra Condensed'] uppercase mb-4">
                Step 1. Send Request
                </h2>
                <p className="text-2xl text-white font-extrabold font-['Sofia Sans Extra Condensed'] uppercase">
                Connect your wallet, verify Discord & Twitter, and submit your application. Approval may take up to 24 hours.
                </p>
            </div>

            {/* Оригинальный CollabButton */}
            <div className="relative z-[3] w-full">
                <CollabButton />
            </div>
            </div>

            {/* Step 2 */}
            <div className="p-10 bg-[#E5D010] rounded-2xl flex flex-col justify-between h-full relative overflow-hidden">
            {/* Затемнение на весь степ (z-index: 1) */}
            <div className="absolute inset-0 bg-black/20 rounded-2xl z-[2]"></div>
            
            {/* Контент (z-index: 3) */}
            <div className="relative z-[3]">
                <h2 className="text-[32px] text-white font-extrabold font-['Sofia Sans Extra Condensed'] uppercase mb-4">
                Step 2. Generate
                </h2>
                <p className="text-2xl text-white font-extrabold font-['Sofia Sans Extra Condensed'] uppercase">
                Get your unique prompt, head to Replicate, and generate your PFP. Customize it for the best result.
                </p>
            </div>

            {/* Изображение (z-index: 2) */}
            <div className="absolute bottom-0 left-0 right-0 rounded-2xl overflow-hidden z-[1]">
                <img 
                src="/images/collab-2.png" 
                alt="Step 1" 
                className="w-full h-full object-cover object-bottom"
                />
            </div>

            {/* Кнопка (z-index: 3) */}
            <button className="w-full h-[52px] bg-white rounded-2xl text-[#202020] text-2xl font-extrabold font-['Sofia Sans Extra Condensed'] uppercase relative z-[3]">
                Get Prompt
            </button>
            </div>

            {/* Step 3 */}
            <div className="p-10 bg-[#09712D] rounded-2xl flex flex-col justify-between h-full relative overflow-hidden">
            {/* Затемнение на весь степ (z-index: 1) */}
            <div className="absolute inset-0 bg-black/20 rounded-2xl z-[2]"></div>
            
            {/* Контент (z-index: 3) */}
            <div className="relative z-[3]">
                <h2 className="text-[32px] text-white font-extrabold font-['Sofia Sans Extra Condensed'] uppercase mb-4">
                Step 3. Upload Image
                </h2>
                <p className="text-2xl text-white font-extrabold font-['Sofia Sans Extra Condensed'] uppercase">
                Save your generated image, upload it here, add metadata, and wait for approval (up to 24 hours).
                </p>
            </div>

            {/* Изображение (z-index: 2) */}
            <div className="absolute bottom-0 left-0 right-0 rounded-2xl overflow-hidden z-[1]">
                <img 
                src="/images/collab-3.png" 
                alt="Step 1" 
                className="w-full h-full object-cover object-bottom"
                />
            </div>

            {/* Кнопка (z-index: 3) */}
            <button className="w-full h-[52px] bg-white rounded-2xl text-[#202020] text-2xl font-extrabold font-['Sofia Sans Extra Condensed'] uppercase relative z-[3]">
                Upload Image
            </button>
            </div>

            {/* Step 4 */}
            <div className="p-10 bg-[#39A4D4] rounded-2xl flex flex-col justify-between h-full relative overflow-hidden">
            {/* Затемнение на весь степ (z-index: 1) */}
            <div className="absolute inset-0 bg-black/20 rounded-2xl z-[2]"></div>
            
            {/* Контент (z-index: 3) */}
            <div className="relative z-[3]">
                <h2 className="text-[32px] text-white font-extrabold font-['Sofia Sans Extra Condensed'] uppercase mb-4">
                Step 4. Mint NFT
                </h2>
                <p className="text-2xl text-white font-extrabold font-['Sofia Sans Extra Condensed'] uppercase">
                Mint your NFT, head to DeWild.art, and list it for auction. Let the world see your boldest creation.
                </p>
            </div>

            {/* Изображение (z-index: 2) */}
            <div className="absolute bottom-0 left-0 right-0 rounded-2xl overflow-hidden z-[1]">
                <img 
                src="/images/collab-4.png" 
                alt="Step 1" 
                className="w-full h-full object-cover object-bottom"
                />
            </div>

            {/* Кнопка (z-index: 3) */}
            <button className="w-full h-[52px] bg-white rounded-2xl text-[#202020] text-2xl font-extrabold font-['Sofia Sans Extra Condensed'] uppercase relative z-[3]">
                Mint NFT
            </button>
            </div>
        </div>
      </div>
    )
  }