'use client';

import { Check } from 'lucide-react';
import { useTextHighlight } from '@/hooks/useTextHighlight'

interface RoadmapItem {
 text: string;
 isCompleted: boolean;
 color: string;
}

interface QuarterSection {
 quarter: string;
 badge: {
   bg: string;
   text: string;
 };
 items: RoadmapItem[];
}

const roadmapData: QuarterSection[] = [
 {
   quarter: "Q1",
   badge: {
     bg: "bg-accent-green",
     text: "text-[#99C1D7]",
   },
   items: [
     { text: "Website WVP Launch", isCompleted: true, color: "#48926D" },
     { text: "Whitelist Stage 1 Kicks Off", isCompleted: true, color: "#48926D" },
     { text: "Free Mint & Early Adopters Stages", isCompleted: false, color: "#606060" },
     { text: "Finalizing the Collection", isCompleted: false, color: "#606060" },
     { text: "Public Mint and Auction Stages", isCompleted: false, color: "#606060" },
     { text: "Secondary Market Launch", isCompleted: false, color: "#606060" },
   ]
 },
 {
   quarter: "Q2",
   badge: {
     bg: "bg-accent-blue",
     text: "text-[#7EF3E1]", 
   },
   items: [
     { text: "Clearing Debts", isCompleted: false, color: "#606060" },
     { text: "Building a Thriving Community", isCompleted: false, color: "#606060" },
     { text: "Holder Dashboard Goes Live", isCompleted: false, color: "#606060" },
     { text: "Massive Giveaways", isCompleted: false, color: "#606060" },
     { text: "Explosive Promotions", isCompleted: false, color: "#606060" },
     { text: "Partnerships and collaborations", isCompleted: false, color: "#606060" },
   ]
 },
 {
   quarter: "Q3",
   badge: {
     bg: "bg-accent-orange",
     text: "text-[#CA0D21]",
   },
   items: [
     { text: "Supercharging the Dashboard", isCompleted: false, color: "#606060" },
     { text: "Bigger Raffles & Wild Contests", isCompleted: false, color: "#606060" },
     { text: "Mapping the Future of DeWild", isCompleted: false, color: "#606060" },
     { text: "$WILD Tokenomics Unveiled", isCompleted: false, color: "#606060" },
     { text: "Turning NFTs into the Ultimate Flex", isCompleted: false, color: "#606060" },
   ]
 },
 {
   quarter: "Q4",
   badge: {
     bg: "bg-accent-purple",
     text: "text-[#FFDD00]",
   },
   items: [
     { text: "Exclusive Community Merch Drop", isCompleted: false, color: "#606060" },
     { text: "Dashboard Upgrade 2.0", isCompleted: false, color: "#606060" },
     { text: "Token Launch Party Begins", isCompleted: false, color: "#606060" },
     { text: "Layer 2 Conquest in Progress", isCompleted: false, color: "#606060" },
     { text: "Writing DeWild's Legendary Status", isCompleted: false, color: "#606060" },
   ]
 }
];

export function Roadmap() {
  const q1DescRef = useTextHighlight();
  const q2DescRef = useTextHighlight();
  const q3DescRef = useTextHighlight();
  const q4DescRef = useTextHighlight();

  return (
    <section className="w-full py-40 pb-40 bg-primary-black flex justify-center">
      <div className="flex-1 flex flex-col items-center gap-20 max-w-[472px] px-3 w-[472px]">
        <h2 className="w-full text-center text-white text-[72px] leading-[48px] font-bold">
          roadmap
        </h2>

        <div className="w-full flex flex-col gap-20">
          {roadmapData.map((quarter, index) => (
            <div key={index} className="flex flex-col gap-8">
              <div className={`${quarter.badge.bg} rounded-2xl px-5 py-4 self-center`}>
                <span className={`${quarter.badge.text} text-[32px] leading-[32px] font-bold`}>
                  {quarter.quarter}
                </span>
              </div>

              <div className="flex flex-col gap-2">
                {quarter.items.map((item, itemIdx) => (
                  <div key={itemIdx} className="w-full flex items-center gap-[10px]">
                    <div className="shrink-0 text-[#606060] text-[24px] font-['Sofia Sans Extra Condensed'] font-extrabold uppercase leading-none">
                      {item.text}
                    </div>
                    <div className="flex-1 h-full flex pb-[5px] items-end">
                      <div className="w-full border-b-[2px] border-dotted border-[#606060]" />
                    </div>
                    <div className="shrink-0">
                      <Check style={{ color: item.color }} className="w-6 h-6" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}