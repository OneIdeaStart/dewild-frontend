'use client';

import { Card } from "@/components/ui/card"
import { useTextHighlight } from '@/hooks/useTextHighlight'
import Link from 'next/link';

export function Description() {
  const welcomeText1Ref = useTextHighlight();
  const welcomeText2Ref = useTextHighlight();
  const welcomeText3Ref = useTextHighlight();
  const founderText1Ref = useTextHighlight();
  const founderText2Ref = useTextHighlight();
  const founderText3Ref = useTextHighlight();
  const contractsTextRef = useTextHighlight();

  const contracts = [
    {
      title: "DEWILD CLUB",
      address: "0x61749CED22F506C2120D66883643608451c1EAb9",
      url: "https://basescan.org/address/0x61749ced22f506c2120d66883643608451c1eab9",
      bgColor: "#F9E52C", // Yellow
      textColor: "#48926D", // Green
    },
    {
      title: "DEWILD MINTER",
      address: "0xc4f17aaa5B0172BC6f3716C2c3b42670450877a6",
      url: "https://basescan.org/address/0xc4f17aaa5B0172BC6f3716C2c3b42670450877a6",
      bgColor: "#4801FF", // Purple
      textColor: "#7EF3E1", // Light blue
    },
    {
      title: "PRIMARY SALE",
      address: "0x0dd959eF9aD8052aA9E4C639AAeE756C82FdF253",
      url: "https://basescan.org/address/0x0dd959eF9aD8052aA9E4C639AAeE756C82FdF253",
      bgColor: "#8B1933", // Burgundy
      textColor: "#FDC867", // Gold
    },
    {
      title: "ROYALTY SPLIT",
      address: "0x470BF0DA6157Cc7b94bF3Cf862d774602251eb99",
      url: "https://basescan.org/address/0x470BF0DA6157Cc7b94bF3Cf862d774602251eb99",
      bgColor: "#FF92B9", // Pink
      textColor: "#026551", // Dark green
    },
  ];

  const cards = [
    {
      image: '/images/about-1.png',
      title: 'Uniqueness',
      description: 'Every NFT is 1/1—pure originality, no copies.',
      bgColor: '#F9E52C',
      textColor: '#48926D'
    },
    {
      image: '/images/about-2.png',
      title: 'Rarity',
      description: 'Defined by traits, making each piece special.',
      bgColor: '#4801FF',
      textColor: '#7EF3E1'
    },
    {
      image: '/images/about-3.png',
      title: 'Auctions',
      description: 'Artists mint and list their NFTs in open auctions.',
      bgColor: '#8B1933',
      textColor: '#FDC867'
    },
    {
      image: '/images/about-4.png',
      title: 'Earnings',
      description: '75% to artists, 25% to project growth from first sales.',
      bgColor: '#FF92B9',
      textColor: '#026551'
    },
    {
      image: '/images/about-5.png',
      title: 'Royalties',
      description: '5% from resales go to artists & community.',
      bgColor: '#F3A73A',
      textColor: '#CA0D21'
    },
    {
      image: '/images/about-6.png',
      title: 'Support',
      description: '10% of all revenue funds emerging artists.',
      bgColor: '#005544',
      textColor: '#99C1D7'
    },
    {
      image: '/images/about-7.png',
      title: 'AI-Powered',
      description: 'Created with AI and the artist’s vision combined.',
      bgColor: '#1F315F',
      textColor: '#DA8D67'
    },
    {
      image: '/images/about-8.png',
      title: 'Revolution',
      description: 'A creator-led movement shaping Web3.',
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
          Unique 1/1 PFP masterpieces. No duplicates — just bold art that speaks louder than words. 11k fearless artists, 11k legendary NFTs, 11k bold statements.
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

      {/* Contracts Section */}
      <div className="max-w-[960px] flex flex-col items-center gap-20 w-full">
        <h2 className="text-[72px] leading-[48px] text-white font-bold">
          our contracts
        </h2>
        <div className="max-w-[472px]">
          <p 
            ref={contractsTextRef}
            className="text-[24px] leading-[32px] text-[#606060] font-bold uppercase text-center transition-colors duration-300"
          >
            DeWild is built entirely on Base Chain for maximum security and transparency. All our contracts are publicly verified, non-upgradeable, and immutable.
          </p>
        </div>
        {/* Contract Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 w-full">
          {contracts.map((contract) => (
            <div 
              key={contract.title}
              className="flex flex-col rounded-[16px] overflow-hidden"
              style={{ backgroundColor: contract.bgColor }}
            >
              <div className="p-6 flex flex-col h-full">
                <h3 
                  className="text-[32px] leading-[32px] font-extrabold mb-6" 
                  style={{ color: contract.textColor }}
                >
                  {contract.title}
                </h3>
                <div 
                  className="text-[24px] leading-[24px] font-bold mb-6 break-words"
                  style={{ color: contract.textColor }}
                >
                  {contract.address}
                </div>
                <div className="mt-auto pt-6 border-t border-opacity-30 text-center flex justify-center items-center" style={{ borderColor: contract.textColor }}>
                  <Link 
                    href={contract.url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-[24px] leading-[24px] font-bold hover:underline text-center"
                    style={{ color: contract.textColor }}
                  >
                    VIEW ON BASESCAN
                  </Link>
                </div>
              </div>
            </div>
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
          Our goal is to unite creators from around the world, restore the glory of PFP NFTs, and build the best and legendary collection across Layer 2 blockchains.
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