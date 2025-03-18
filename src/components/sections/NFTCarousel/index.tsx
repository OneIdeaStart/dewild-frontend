import { useState, useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';

export const NFTCarousel = () => {
 const [isLoaded, setIsLoaded] = useState(false);
 const [spinning, setSpinning] = useState(false);
 const [spinningSlots, setSpinningSlots] = useState([false, false, false]);
 const [currentIndexes, setCurrentIndexes] = useState([0, 1, 2]);
 const [finalIndexes, setFinalIndexes] = useState([0, 1, 2]);
 const [selectedSlot, setSelectedSlot] = useState<number | null>(null);
 const [videoPlayingSlot, setVideoPlayingSlot] = useState<number | null>(null);

 const videoRefs = [useRef<HTMLVideoElement>(null), useRef<HTMLVideoElement>(null), useRef<HTMLVideoElement>(null)];

 const nftImages = [
   '/images/nft-1.png',
   '/images/nft-2.png',
   '/images/nft-3.png',
   '/images/nft-4.png',
   '/images/nft-5.png',
   '/images/nft-6.png',
   '/images/nft-7.png',
   '/images/nft-8.png',
   '/images/nft-9.png',
   '/images/nft-10.png',
   '/images/nft-11.png',
   '/images/nft-12.png',
   '/images/nft-13.png',
   '/images/nft-14.png',
   '/images/nft-15.png',
   '/images/nft-16.png',
   '/images/nft-17.png',
   '/images/nft-18.png',
   '/images/nft-19.png',
 ];

 const createSlotStrip = (startIndex: number) => {
   const multiplier = 3;
   const repeated = Array(multiplier).fill(nftImages).flat();
   const rotated = [...repeated.slice(startIndex), ...repeated.slice(0, startIndex)];
   return rotated;
 };

 const spin = () => {
   if (spinning) return;

   setSpinning(true);
   setSelectedSlot(null);

   const newFinalIndexes = currentIndexes.map(() =>
     Math.floor(Math.random() * nftImages.length)
   );
   setFinalIndexes(newFinalIndexes);

   const startDelays = [0, 400, 800];
   startDelays.forEach((delay, index) => {
     setTimeout(() => {
       setSpinningSlots((prev) => {
         const newState = [...prev];
         newState[index] = true;
         return newState;
       });
     }, delay);
   });

   const stopDelays = [2000, 2800, 3500];
   stopDelays.forEach((delay, index) => {
     setTimeout(() => {
       setSpinningSlots((prev) => {
         const newState = [...prev];
         newState[index] = false;
         return newState;
       });

       setCurrentIndexes((prev) => {
         const newIndexes = [...prev];
         newIndexes[index] = newFinalIndexes[index];
         return newIndexes;
       });

       if (index === 2) {
         setSpinning(false);

         setTimeout(() => {
           const randomSlot = Math.floor(Math.random() * 3);
           setSelectedSlot(randomSlot);
           setVideoPlayingSlot(randomSlot);

           if (videoRefs[randomSlot]?.current) {
             const videoEl = videoRefs[randomSlot].current;
             const videoPath = `/images/nft-${newFinalIndexes[randomSlot] + 1}.mp4`;
             videoEl.src = videoPath;

             videoEl.oncanplay = () => {
               videoEl.play().catch((e) => console.error('Video play error:', e));
             };

             videoEl.onended = () => {
               setVideoPlayingSlot(null);
             };
           }

           // Start new spin 5 seconds after stopping
           setTimeout(() => {
             spin();
           }, 5000);
         }, 500);
       }
     }, delay);
   });
 };

 useEffect(() => {
  // 0.2s delay after title animation starts
  setTimeout(() => {
    setIsLoaded(true);
    // Start spin only after appearance animation completes
    // 200ms delay + 500ms animation + 200ms delay for last slot
    setTimeout(() => {
      spin();
    }, 1800);
  }, 200);

  return () => {}; // Cleanup if needed
 }, []);


 return (
   <div className="flex gap-2 sm:gap-4 select-none">
     {[0, 1, 2].map((slotIndex) => {
       const slotStrip = createSlotStrip(currentIndexes[slotIndex]);
 
       return (
         <div
           key={slotIndex}
           className={cn(
             "w-28 h-28 sm:w-40 sm:h-40",
             "rounded-[24px] sm:rounded-[38px]", 
             "border-[4px] sm:border-[6px] border-white",
             "shadow-slot",
             "relative overflow-hidden",
             "hover:scale-105 transition-transform duration-300",
             "opacity-0 scale-[0.3]",
             isLoaded && "animate-slot-reveal"
           )}
           style={{
             boxSizing: 'border-box',
             backgroundClip: 'padding-box',
             animationDelay: `${0.1 * slotIndex}s`
           }}
         >
           <div className="absolute inset-0">
             <div
               className={cn(
                 "absolute top-0 left-0 w-full transition-all duration-500",
                 spinningSlots[slotIndex] && "animate-slot-spin"
               )}
               style={{
                 height: '1500%',
                 transform: spinningSlots[slotIndex]
                   ? undefined
                   : `translateY(-${(currentIndexes[slotIndex] * -100) / 15}%)`,
               }}
             >
               {slotStrip.map((src, imgIndex) => (
                 <div
                   key={imgIndex}
                   className="w-full relative"
                   style={{ height: `${100 / 15}%` }}
                 >
                   <img
                     src={src}
                     alt={`NFT ${imgIndex + 1}`}
                     className="w-full h-28 sm:h-40 object-cover"
                   />
                 </div>
               ))}
             </div>
           </div>
 
           <div
             className={cn(
               "absolute inset-0 z-10 transition-opacity",
               videoPlayingSlot === slotIndex ? "opacity-100" : "opacity-0"
             )}
           >
             <video
               ref={videoRefs[slotIndex]}
               className="w-full h-full object-cover"
               muted
               playsInline
             />
           </div>
         </div>
       );
     })}
   </div>
 );
};