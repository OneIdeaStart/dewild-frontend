// src/components/sections/hero.tsx
'use client';

import { CollabSection } from '@/components/sections/CollabSection'
import { useEffect, useState } from 'react';
import { useCollabStatus } from '@/hooks/useCollabStatus'

export function Hero() {
  const [isLoaded, setIsLoaded] = useState(false);
  const [scrollStretch, setScrollStretch] = useState(0);
  const [isReleasing, setIsReleasing] = useState(false);
  const [isTop, setIsTop] = useState(true);
 
  useEffect(() => {
    let lastTimestamp = 0;
    let scrollTimer: NodeJS.Timeout | null = null;
    let accumulatedStretch = 0;
 
    const handleScroll = () => {
      setIsTop(window.scrollY === 0);
 
      if (scrollTimer) {
        clearTimeout(scrollTimer);
      }
 
      // Get current time for scroll speed calculation
      const now = Date.now();
      const timeDelta = now - lastTimestamp;
      lastTimestamp = now;
 
      // Increase tension based on scroll speed
      if (timeDelta > 0) {
        accumulatedStretch = Math.min(accumulatedStretch + 2, 40); // Sharper tension
        setScrollStretch(accumulatedStretch);
        setIsReleasing(false);
      }
 
      // Timer to determine end of scroll
      scrollTimer = setTimeout(() => {
        setIsReleasing(true);
        setScrollStretch(0);
        accumulatedStretch = 0;
      }, 25); // Reduced delay for faster reaction
    };
 
    window.addEventListener('scroll', handleScroll);
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (scrollTimer) {
        clearTimeout(scrollTimer);
      }
    };
  }, []);

  useEffect(() => {
    setTimeout(() => {
      setIsLoaded(true);
    }, 1300); // 1.4s - 0.2s = 1.2s
  }, []);
 
  return (
    <section className="w-full h-screen min-h-[696px] flex flex-col">
      <div className="flex-1 min-h-0">
        <div className="h-full flex flex-col mt-[56px]">
          <CollabSection />
        </div>
      </div>
      
      <div className={`relative w-full h-[60px] translate-y-full ${
          isLoaded ? 'animate-dark-slide' : ''
        }`}>
        <svg 
          viewBox="0 0 1440 60" 
          preserveAspectRatio="none"
          className="absolute inset-0 w-full h-full"
        >
          <path
            style={{
              // Sharper bounce effect
              transition: isReleasing ? 'all 0.1s cubic-bezier(.32,2,.55,.27)' : 'none'
            }}
            d={`M0,0 L1440,0 L1440,60 L0,60 Z M0,0 C360,${30 + scrollStretch} 1080,${30 + scrollStretch} 1440,0`}
            fill="#202020"
          />
        </svg>
        
        <div 
          className={`absolute inset-0 flex justify-center items-center translate-y-[12px] transition-opacity duration-300 ${
            isTop ? 'opacity-50' : 'opacity-0'
          }`}
        >
          <span className="text-[12px] leading-[12px] text-white font-bold uppercase transition-transform"
                style={{
                  transform: `translateY(${scrollStretch * 0.5}px)`
                }}>
            ⇣
          </span>
        </div>
      </div>
    </section>
  );
 }
 