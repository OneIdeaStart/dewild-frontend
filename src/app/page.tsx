import { Hero } from '@/components/sections/hero';
import { InfiniteCarousel } from '@/components/sections/infinite-carousel';
import { Description } from '@/components/sections/description';

export default function Home() {
  return (
    <>
      <Hero />
      <InfiniteCarousel />
      <Description />
    </>
  );
}