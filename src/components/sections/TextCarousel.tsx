// src/components/sections/TextCarousel.tsx
'use client'

export function TextCarousel() {
  const text = "let's make nfts great again."
  const singleTextWidth = 943;

  return (
    <section className="w-full flex flex-col">
      {/* Black background text */}
      <div className="w-full py-2 bg-primary-black overflow-hidden">
        <div className="relative">
          <div className="flex animate-marquee-left whitespace-nowrap">
            <div className="flex gap-2.5" style={{ width: `${singleTextWidth * 4}px` }}>
              {Array.from({ length: 4 }).map((_, i) => (
                <span 
                  key={i}
                  className="text-white text-[96px] leading-[64px] font-bold uppercase flex-shrink-0"
                  style={{ width: `${singleTextWidth}px` }}
                >
                  {text}
                </span>
              ))}
            </div>
            <div className="flex gap-2.5" style={{ width: `${singleTextWidth * 4}px` }}>
              {Array.from({ length: 4 }).map((_, i) => (
                <span 
                  key={i}
                  className="text-white text-[96px] leading-[64px] font-bold uppercase flex-shrink-0"
                  style={{ width: `${singleTextWidth}px` }}
                >
                  {text}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
      
      {/* White background text */}
      <div className="w-full py-2 bg-white overflow-hidden">
        <div className="relative">
          <div className="flex animate-marquee-right whitespace-nowrap">
            <div className="flex gap-2.5" style={{ width: `${singleTextWidth * 4}px` }}>
              {Array.from({ length: 4 }).map((_, i) => (
                <span 
                  key={i}
                  className="text-primary-black text-[96px] leading-[64px] font-bold uppercase flex-shrink-0"
                  style={{ width: `${singleTextWidth}px` }}
                >
                  {text}
                </span>
              ))}
            </div>
            <div className="flex gap-2.5" style={{ width: `${singleTextWidth * 4}px` }}>
              {Array.from({ length: 4 }).map((_, i) => (
                <span 
                  key={i}
                  className="text-primary-black text-[96px] leading-[64px] font-bold uppercase flex-shrink-0"
                  style={{ width: `${singleTextWidth}px` }}
                >
                  {text}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}