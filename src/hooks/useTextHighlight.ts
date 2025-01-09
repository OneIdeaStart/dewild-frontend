// hooks/useTextHighlight.ts
import { useEffect, useRef } from 'react';

export const useTextHighlight = () => {
  const elementRef = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          
          // Значение от 0 до 1 для изменения цвета
          const ratio = entry.intersectionRatio;
          
          // RGB значения для #606060 и #FFFFFF
          const r = Math.round(96 + (255 - 96) * ratio);
          const g = Math.round(96 + (255 - 96) * ratio);
          const b = Math.round(96 + (255 - 96) * ratio);
                    
          element.style.color = `rgb(${r}, ${g}, ${b})`;
        });
      },
      {
        threshold: [0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1.0], // Более простой массив порогов
        rootMargin: '-37% 0px' // Упростим отступы
      }
    );

    observer.observe(element);

    return () => observer.unobserve(element);
  }, []);

  return elementRef;
};