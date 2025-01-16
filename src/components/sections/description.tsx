'use client';

import { Card } from "@/components/ui/card"
import { useTextHighlight } from '@/hooks/useTextHighlight'

export function Description() {
  const welcomeText1Ref = useTextHighlight();
  const welcomeText2Ref = useTextHighlight();
  const welcomeText3Ref = useTextHighlight();
  const founderText1Ref = useTextHighlight();
  const founderText2Ref = useTextHighlight();
  const founderText3Ref = useTextHighlight();

  const cards = [
    {
      image: '/images/about-1.png',
      title: '11,111 NFTs',
      description: 'One-of-a-kind, no duplicates, just individuality.',
      bgColor: '#F9E52C',
      textColor: '#48926D'
    },
    {
      image: '/images/about-2.png',
      title: '15 Characters',
      description: 'Embodiments of bold personalities, unique as its owner.',
      bgColor: '#4801FF',
      textColor: '#7EF3E1'
    },
    {
      image: '/images/about-3.png',
      title: 'Rarity',
      description: 'Unique attributes create one-of-a-kind combos.',
      bgColor: '#8B1933',
      textColor: '#FDC867'
    },
    {
      image: '/images/about-8.png',
      title: 'Free Mint',
      description: 'Early adopters get exclusive access to the first phase.',
      bgColor: '#D26BFF',
      textColor: '#FFDD00'
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
  ];

  return (
    <section className="w-full bg-[#202020] flex flex-col items-center gap-40 px-3 py-40">
      {/* Welcome Text Block */}
      <div className="max-w-[472px] flex flex-col gap-20">
        <p 
          ref={welcomeText1Ref}
          className="text-[24px] leading-[24px] text-[#606060] font-bold uppercase text-center transition-colors duration-300"
        >
          Welcome to DeWild Club, a collection for those who live boldly and choose freedom. 11,111 unique NFTs represent the untamed spirit of those who embrace the wild side of Web3.        </p>
        <p 
          ref={welcomeText2Ref}
          className="text-[24px] leading-[24px] text-[#606060] font-bold uppercase text-center transition-colors duration-300"
        >
          Whether you’re an innovator, creator, or dreamer, DeWild is for those who dare to be different and make their mark in the new digital world.
        </p>
        <p 
          ref={welcomeText3Ref}
          className="text-[24px] leading-[24px] text-[#606060] font-bold uppercase text-center transition-colors duration-300"
        >
          DeWild NFT is your avatar in the digital frontier, a talisman of boldness and freedom, unlocking the path to unique opportunities and legendary connections.
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
        <p 
          ref={founderText1Ref}
          className="text-[24px] leading-[24px] text-[#606060] font-bold uppercase text-center transition-colors duration-300"
        >
          DeWild was born from a desire to create something bold, free, and lasting. It’s a celebration of those who choose freedom and dare to stand apart in a world of conformity."
        </p>
        <p 
          ref={founderText2Ref}
          className="text-[24px] leading-[24px] text-[#606060] font-bold uppercase text-center transition-colors duration-300"
        >
          For years, I helped build someone else’s dreams. Losing my job became the wake-up call I needed to chase my own vision—a vision fueled by passion and a belief in limitless potential.
        </p>
        <p 
          ref={founderText3Ref}
          className="text-[24px] leading-[24px] text-[#606060] font-bold uppercase text-center transition-colors duration-300"
        >
          This collection represents not just my journey but the collective power of those who dare to break free. Together, we’re shaping something that will live on long after us.
        </p>
      </div>
    </section>
  );
}