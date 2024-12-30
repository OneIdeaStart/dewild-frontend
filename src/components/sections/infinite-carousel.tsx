'use client'

import { useEffect, useRef } from 'react'
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
      <div className="relative leading-[0px]">
        <div className="inline-flex w-[4480px] animate-marquee-left">
          <div className="flex">
            {TOP_ROW.map((src, index) => (
              <div 
                key={`top-${index}`}
                className="w-[320px] h-[320px] relative flex-shrink-0"
              >
                <Image
                  src={src}
                  alt={`NFT ${index + 1}`}
                  fill
                  quality={100}
                  className="object-cover"
                  sizes="320px"
                  priority
                />
              </div>
            ))}
          </div>
          <div className="flex">
            {TOP_ROW.map((src, index) => (
              <div 
                key={`top-repeat-${index}`}
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
      </div>

      <div className="relative leading-[0px]">
        <div className="inline-flex w-[4480px] animate-marquee-right">
          <div className="flex">
            {BOTTOM_ROW.map((src, index) => (
              <div 
                key={`bottom-${index}`}
                className="w-[320px] h-[320px] relative flex-shrink-0"
              >
                <Image
                  src={src}
                  alt={`NFT ${index + BOTTOM_ROW.length + 1}`}
                  fill
                  quality={100}
                  className="object-cover"
                  sizes="320px"
                  priority
                />
              </div>
            ))}
          </div>
          <div className="flex">
            {BOTTOM_ROW.map((src, index) => (
              <div 
                key={`bottom-repeat-${index}`}
                className="w-[320px] h-[320px] relative flex-shrink-0"
              >
                <Image
                  src={src}
                  alt={`NFT ${index + BOTTOM_ROW.length + 1}`}
                  fill
                  quality={100}
                  className="object-cover"
                  sizes="320px"
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}