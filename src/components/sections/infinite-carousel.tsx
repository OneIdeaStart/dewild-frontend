// components/sections/infinite-carousel.tsx
'use client'

import Image from 'next/image'

const TOP_ROW = [
  '/images/nft-1.jpg',
  '/images/nft-2.jpg',
  '/images/nft-3.jpg',
  '/images/nft-4.jpg',
  '/images/nft-5.jpg',
  '/images/nft-6.jpg',
  '/images/nft-7.jpg',
]

const BOTTOM_ROW = [
  '/images/nft-8.jpg',
  '/images/nft-9.jpg',
  '/images/nft-10.jpg',
  '/images/nft-11.jpg',
  '/images/nft-12.jpg',
  '/images/nft-13.jpg',
  '/images/nft-14.jpg',
]

export function InfiniteCarousel() {
  return (
    <section className="w-full overflow-hidden">
      <div className="relative">
        <div className="flex animate-marquee-left">
          {[...TOP_ROW, ...TOP_ROW, ...TOP_ROW].map((src, index) => (
            <div 
              key={index} 
              className="w-[320px] h-[320px] relative flex-shrink-0"
            >
              <Image
                src={src}
                alt={`NFT ${index + 1}`}
                fill
                quality={100}
                className="object-cover"
                sizes="320px"
              />
            </div>
          ))}
        </div>
      </div>

      <div className="relative">
        <div className="flex animate-marquee-right">
          {[...BOTTOM_ROW, ...BOTTOM_ROW, ...BOTTOM_ROW].map((src, index) => (
            <div 
              key={index} 
              className="w-[320px] h-[320px] relative flex-shrink-0"
            >
              <Image
                src={src}
                alt={`NFT ${index + 9}`}
                fill
                quality={100}
                className="object-cover"
                sizes="320px"
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}