import { Hero } from '@/components/sections/hero';
import { Description } from '@/components/sections/description';
import { MintStages } from '@/components/sections/MintStages';
import { Promos } from '@/components/sections/Promos';
import { Roadmap } from '@/components/sections/Roadmap';
import { TextCarousel } from '@/components/sections/TextCarousel';
import { Footer } from '@/components/sections/Footer'

export default function Home() {
  return (
    <>
      <Hero />
      <Description />
      <MintStages />
      <Promos />
      <Roadmap />
      <TextCarousel />
      <Footer />
    </>
  );
}