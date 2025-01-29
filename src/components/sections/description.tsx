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
      title: '11k NFTs',
      description: 'Unique and bold, each one a masterpiece.',
      bgColor: '#F9E52C',
      textColor: '#48926D'
    },
    {
      image: '/images/about-2.png',
      title: '11k Creators',
      description: 'Fearless creators leaving their mark on Web3.',
      bgColor: '#4801FF',
      textColor: '#7EF3E1'
    },
    {
      image: '/images/about-3.png',
      title: '11k Stories',
      description: 'Every NFT tells a tale of individuality and creativity.',
      bgColor: '#8B1933',
      textColor: '#FDC867'
    },
    {
      image: '/images/about-4.png',
      title: '11k Views',
      description: 'A collection as diverse as the creators behind it.',
      bgColor: '#FF92B9',
      textColor: '#026551'
    },
    {
      image: '/images/about-5.png',
      title: '11k Originals',
      description: 'No copies, no imitations, just pure, unrepeatable art.',
      bgColor: '#F3A73A',
      textColor: '#CA0D21'
    },
    {
      image: '/images/about-6.png',
      title: '11k Links',
      description: 'Uniting artists and collectors in a shared vision.',
      bgColor: '#005544',
      textColor: '#99C1D7'
    },
    {
      image: '/images/about-7.png',
      title: '11k Dreams',
      description: 'Ideas brought to life by those who dare to create.',
      bgColor: '#1F315F',
      textColor: '#DA8D67'
    },
    {
      image: '/images/about-8.png',
      title: '11k Marks',
      description: 'Each piece leaves its bold mark on the digital world.',
      bgColor: '#D26BFF',
      textColor: '#FFDD00'
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
          We are creating a collection of 11,111 PFP NFTs in collaboration with 11,111 bold artists who have something to say to the world.</p>
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
          These NFTs is a 1/1 PFP masterpieces. No duplicates, no shortcuts—just bold art that speaks louder than words. Own a piece of individuality and let it roar.
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
          DeWild was created to amplify voices and celebrate individuality. It’s a collection for those who embrace freedom, defy expectations, and boldly make their mark in the digital world."
        </p>
        <p 
          ref={founderText2Ref}
          className="text-[24px] leading-[24px] text-[#606060] font-bold uppercase text-center transition-colors duration-300"
        >
          Losing my job was the push I needed to finally pursue my own dream — a dream driven by creativity, boldness, and the belief that art has the power to inspire change.
        </p>
        <p 
          ref={founderText3Ref}
          className="text-[24px] leading-[24px] text-[#606060] font-bold uppercase text-center transition-colors duration-300"
        >
          This collection isn’t just about one person — it’s about all of us who refuse to blend in. Together, we’re crafting a legacy of fearless expression and boundless creativity.


        </p>
      </div>
    </section>
  );
}