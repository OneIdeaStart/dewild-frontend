'use client';

import { Card } from "@/components/ui/card"

export function Description() {
  const cards = [
    {
      image: '/images/about-1.png',
      title: '11,111 NFTs',
      description: 'Unique one-of-a-kind designs, there are no duplicates.',
      bgColor: '#F9E52C',
      textColor: '#48926D'
    },
    {
      image: '/images/about-2.png',
      title: '15 NFT Types',
      description: 'Representing the wildest DeFi personalities.',
      bgColor: '#4801FF',
      textColor: '#7EF3E1'
    },
    {
      image: '/images/about-3.png',
      title: 'Five stages',
      description: 'whitelist, free mint, Early adopters, Fixed price, auction.',
      bgColor: '#8B1933',
      textColor: '#FDC867'
    },
    {
      image: '/images/about-4.png',
      title: 'Community',
      description: '2.5% royalties go back to the community wallet.',
      bgColor: '#FF92B9',
      textColor: '#026551'
    },
    {
      image: '/images/about-5.png',
      title: 'Built on Base',
      description: 'Fast, scalable, and ready for the future of Web3.',
      bgColor: '#F3A73A',
      textColor: '#CA0D21'
    },
    {
      image: '/images/about-6.png',
      title: 'AI Powered',
      description: 'Art and execution driven by cutting-edge AI tools.',
      bgColor: '#005544',
      textColor: '#99C1D7'
    },
    {
      image: '/images/about-7.png',
      title: 'Giveaways',
      description: 'Regular rewards and surprises for loyal holders.',
      bgColor: '#1F315F',
      textColor: '#DA8D67'
    },
    {
      image: '/images/about-8.png',
      title: 'Free Mint',
      description: 'Early adopters get exclusive access to the first phase.',
      bgColor: '#D26BFF',
      textColor: '#FFDD00'
    }
  ];

  return (
    <section className="w-full bg-[#202020] flex flex-col items-center gap-40 px-3 py-40">
      {/* Welcome Text Block */}
      <div className="max-w-[472px] flex flex-col gap-20">
        <p className="text-[24px] leading-[24px] text-[#606060] font-bold uppercase text-center">
          Welcome to DeWild, where 'wild' means as free as your leverage is high. We're 11,111 unique NFTs celebrating the untamed spirit of DeFi and the crazy souls who thrive in it.
        </p>
        <p className="text-[24px] leading-[24px] text-[#606060] font-bold uppercase text-center">
          Be you a trader, airdrop hunter, yield farmer, or NFT enthusiast, if DeFi runs through your veins, this is for you. Whether you're chasing gains, refreshing wallets, or aping into the next big thing – welcome to the wild side.
        </p>
        <p className="text-[24px] leading-[24px] text-[#606060] font-bold uppercase text-center">
          This collection is your digital badge of honor in the wild world of decentralized finance. It's not just about NFTs; it's about celebrating the bold, the brave, and the borderline unhinged who make DeFi a lifestyle.
        </p>
      </div>

      {/* About Section */}
      <div className="max-w-[960px] flex flex-col items-center gap-20 w-full">
        <h2 className="text-[72px] leading-[48px] text-white font-bold">
          about
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-10 w-full">
          {cards.map((card) => (
            <Card
              key={card.title}
              {...card}
            />
          ))}
        </div>
      </div>

      {/* Founder's Message */}
      <div className="max-w-[472px] flex flex-col gap-20">
        <p className="text-[24px] leading-[24px] text-[#606060] font-bold uppercase text-center">
          Layer 2 never looked this wild, and I can't wait for you to join me on this journey.
        </p>
        <p className="text-[24px] leading-[24px] text-[#606060] font-bold uppercase text-center">
          i built DeWild to prove that the wildest ideas come to life when you take the first step. For years, I worked to build someone else's dreams, but after losing my job, I decided it was time to chase my own.
        </p>
        <p className="text-[24px] leading-[24px] text-[#606060] font-bold uppercase text-center">
          My ultimate dream? To create something that would live on long after me. And what better way to achieve that than through blockchain and Web3?
        </p>
      </div>
    </section>
  );
}