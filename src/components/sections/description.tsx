// src/components/sections/Description.tsx
'use client';

type Item = {
  number: string;
  title: string;
  description: string;
  paddingTop: string;
};

interface ItemCardProps {
  item: Item;
}

export function Description() {
  const topRow: Item[] = [
    {
      number: "1",
      title: "11,111 NFTs",
      description: "Unique one-of-a-kind designs, there are no duplicates.",
      paddingTop: "pt-0 sm:pt-0 lg:pt-0"
    },
    {
      number: "2",
      title: "15 Animal Types",
      description: "Representing the wildest DeFi personalities.",
      paddingTop: "pt-0 sm:pt-12 lg:pt-12"
    },
    {
      number: "3",
      title: "Community-Driven",
      description: "2.5% royalties go back to the community wallet.",
      paddingTop: "pt-0 sm:pt-0 lg:pt-24"
    },
    {
      number: "4",
      title: "Three Mint Phases",
      description: "Early adopters, Fixed price, and final NFT auction.",
      paddingTop: "pt-0 sm:pt-12 lg:pt-36"
    }
   ];
   
   const bottomRow: Item[] = [
    {
      number: "5",
      title: "Powered by AI",
      description: "Art and execution driven by cutting-edge AI tools.",
      paddingTop: "pt-0 sm:pt-0 lg:pt-0"
    },
    {
      number: "6",
      title: "Built on Base Chain",
      description: "Fast, scalable, and ready for the future of Web3.",
      paddingTop: "pt-0 sm:pt-12 lg:pt-12"
    },
    {
      number: "7",
      title: "Whitelist-Only Free Mint",
      description: "Early adopters get exclusive access to the first phase.",
      paddingTop: "pt-0 sm:pt-0 lg:pt-24"
    },
    {
      number: "8",
      title: "Exclusive Giveaways",
      description: "Regular rewards and surprises for loyal holders.",
      paddingTop: "pt-0 sm:pt-12 lg:pt-36"
    }
   ];

   const ItemCard = ({ item }: ItemCardProps) => (
    <div className={`flex flex-col gap-6 ${item.paddingTop}`}>
      <div className="flex items-center relative">
        <div className="w-[75px] h-24 relative flex justify-center items-center">
          <img 
            className="w-[75px] h-[96px] absolute z-0" 
            src={`/images/about-${item.number}.png`}
            alt={`About ${item.number}`}
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
      <div className="flex flex-col">
        <div className="text-white text-sm font-bold font-['Azeret Mono'] leading-6">
          {item.title}
        </div>
        <div className="text-white text-sm font-normal font-['Azeret Mono'] leading-6">
          {item.description}
        </div>
      </div>
    </div>
 );

  return (
    <section className="w-full bg-black overflow-hidden">
      <div className="w-full px-3 md:px-6 pt-16 pb-16 lg:pb-0 flex flex-col items-center gap-32">
        {/* Welcome Text */}
        <div className="text-[#E0E0E0] text-lg md:text-2xl font-normal uppercase leading-[26px] md:leading-9">
          Welcome into DeWild, where 'wild' means as free as your leverage is high! We're 11,111 NFTs celebrating those crazy enough to call DeFi their lifestyle - from degen traders who check liquidations more often than their dating apps, to yield farmers who believe 100% APY is "playing it safe". Whether you're refreshing wallets every 30 seconds to track your portfolio (we know you do), aping into tokens faster than you can read their names, or just vibing with the community that truly gets your financial choices (try explaining 10x leverage to your mom) - this collection is your digital badge of honor in the wild world of decentralized finance.
        </div>

        {/* Lines Container */}
        <div className="w-full h-[250px] relative">
          <div className="absolute w-[200%] left-[-75%] flex flex-col gap-20 -rotate-3">
            {/* Red Line */}
            <div className="w-full px-1 bg-[#DE0401] rotate-6 flex justify-center items-center whitespace-nowrap">
              <div className="text-[#FFD84B] text-5xl font-normal uppercase leading-[48px]">
                You are free if you are dewild. You are free if you are dewild. You are free if you are dewild. You are free if you are dewild.
              </div>
            </div>

            {/* Yellow Line */}
            <div className="w-full px-1 bg-[#FFD84B] -rotate-3 flex justify-center items-center whitespace-nowrap">
              <div className="text-[#DE0401] text-5xl font-normal uppercase leading-[48px]">
                You are free if you are dewild. You are free if you are dewild. You are free if you are dewild. You are free if you are dewild.
              </div>
            </div>
          </div>
        </div>

        {/* About Collection */}
        <div id="about-collection" className="w-full flex flex-col gap-12">
          <div className="text-left sm:text-right text-white text-[48px] sm:text-[64px] font-normal font-['Azeret Mono'] leading-[48px] sm:leading-[64px] text-left md:text-right">
            About<br/>collection
          </div>
          
          <div className="w-full flex flex-col gap-12">
            {/* Top Row */}
            <div className="w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-24 gap-y-12">
              {topRow.map((item, index) => (
                <ItemCard key={index} item={item} />
              ))}
            </div>
            
            {/* Bottom Row */}
            <div className="w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-24 gap-y-12">
              {bottomRow.map((item, index) => (
                <ItemCard key={index} item={item} />
              ))}
            </div>
          </div>
        </div>

        {/* Founder's Message Block */}
        <div className="w-full flex flex-col lg:flex-row justify-between gap-12">
        <div className="text-white text-lg md:text-2xl font-normal uppercase leading-[26px] md:leading-9 font-['Azeret Mono']">
            I built DeWild to prove that the wildest ideas come to life when you take the first step. For years, I worked to build someone else's dreams, but after losing my job, I decided it was time to chase my own. My ultimate dream? To create something that would live on long after me. And what better way to achieve that than through blockchain and Web3?
            <br/><br/>
            Layer 2 never looked this wild.
          </div>
          <div className="hidden lg:block lg:pt-32 w-full lg:w-auto flex justify-end -mr-3 md:-mr-6 lg:flex-shrink-0">
            <div className="w-[256px] lg:w-[512px] h-[256px] lg:h-[512px]">
              <img 
                className="w-full h-full object-contain"
                src="/images/founder.png"
                alt="Founder"
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