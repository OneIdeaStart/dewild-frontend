'use client';

import { useEffect, useState } from 'react'
import { NFTCarousel } from '@/components/sections/NFTCarousel'
import { JoinCollabButton } from '@/components/web3/JoinCollabButton'
import { useCollabStatus } from '@/hooks/useCollabStatus'

export function CollabSection() {
  const [isLoaded, setIsLoaded] = useState(false);
  const { isCollabFull } = useCollabStatus();
   
  useEffect(() => {
    setIsLoaded(true);
  }, []);
   
  return (
    <div className="h-full flex flex-col px-3">
      <div className="flex-1 min-h-10" />
      
      <div className="flex flex-col items-center gap-10">
        <h1 className="w-full text-center text-[72px] sm:text-[96px] leading-[48px] sm:leading-[64px] font-bold uppercase text-primary-black">
          <span 
            className={`inline-block opacity-0 scale-y-0 ${
              isLoaded ? 'animate-reveal' : ''
            }`}
          >
            DeWild
          </span>{" "}
          <span 
            className={`inline-block opacity-0 scale-y-0 ${
              isLoaded ? 'animate-reveal' : ''
            }`}
            style={{ animationDelay: '150ms' }}
          >
            Club
          </span>
        </h1>
  
        <NFTCarousel />
  
        <p 
          className={`max-w-[468px] text-[24px] leading-[24px] text-text-gray text-center font-bold uppercase opacity-0 ${
            isLoaded ? 'animate-reveal-text' : ''
          }`}
          style={{ animationDelay: '0.6s' }}
        >
          A bold NFT collection is born here. Join a wild community of artists, ready to create and collaborate. Become part of something timeless.
        </p>
      </div>
  
      <div className="flex-1 min-h-10" />
  
      <div 
        className={`h-20 flex flex-col items-center gap-3 opacity-0 scale-[3] ${
          isLoaded ? 'animate-button-fall' : ''
        }`} 
        style={{ animationDelay: '0.9s' }}
      >
        <span className="text-[16px] leading-[16px] text-text-gray font-bold uppercase">
          {isCollabFull ? 'All collaboration spots taken' : 'Got something bold to say?'}
        </span>
        <JoinCollabButton />
      </div>
  
      <div className="flex-1 min-h-10 pb-[36px]" />
    </div>
  );
}