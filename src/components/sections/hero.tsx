// src/components/sections/hero.tsx
'use client';

import { MintSection } from '@/components/sections/MintSection'
import { useEffect, useState } from 'react';
import { useMintStage } from '@/hooks/useMintStage'
import { MintStage } from '@/types/mint-stages'

export function Hero() {
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
 
      // Получаем текущее время для расчета скорости скролла
      const now = Date.now();
      const timeDelta = now - lastTimestamp;
      lastTimestamp = now;
 
      // Увеличиваем натяжение на основе скорости скролла
      if (timeDelta > 0) {
        accumulatedStretch = Math.min(accumulatedStretch + 2, 40); // Более резкое натяжение
        setScrollStretch(accumulatedStretch);
        setIsReleasing(false);
      }
 
      // Таймер для определения окончания скролла
      scrollTimer = setTimeout(() => {
        setIsReleasing(true);
        setScrollStretch(0);
        accumulatedStretch = 0;
      }, 25); // Уменьшили задержку для более быстрой реакции
    };
 
    window.addEventListener('scroll', handleScroll);
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (scrollTimer) {
        clearTimeout(scrollTimer);
      }
    };
  }, []);
 
  return (
    <section className="w-full h-screen min-h-[696px] flex flex-col">
      <div className="flex-1 min-h-0">
        <div className="h-full flex flex-col mt-[56px]">
          <MintSection />
        </div>
      </div>
      
      <div className="relative w-full h-[60px]">
        <svg 
          viewBox="0 0 1440 60" 
          preserveAspectRatio="none"
          className="absolute inset-0 w-full h-full"
        >
          <path
            style={{
              // Более резкий bounce эффект
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
 