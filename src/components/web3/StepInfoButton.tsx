// src/components/web3/StepInfoButton.tsx
'use client'

import { useState } from 'react'
import { Dialog, DialogContent } from '@/components/ui/dialog'

interface StepInfoButtonProps {
  step: number;
  title: string;
  description: string;
  requirements?: string[];
  tips?: string[];
}

export function StepInfoButton({ step, title, description, requirements, tips }: StepInfoButtonProps) {
    const [dialogOpen, setDialogOpen] = useState(false)
  
    return (
      <>
        {/* Обновленная ссылка Learn more */}
        <button 
          onClick={() => setDialogOpen(true)}
          className="mt-2 text-[24px] leading-[36px] font-bold uppercase text-white underline hover:no-underline transition-all font-['Sofia Sans Extra Condensed']"
        >
          LEARN MORE
        </button>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="bg-white p-8 rounded-2xl max-w-2xl">
          <div className="flex flex-col gap-6">
            <h2 className="text-4xl font-extrabold font-['Sofia Sans Extra Condensed'] uppercase">
              {title}
            </h2>
            
            <p className="text-[24px] leading-[24px] text-[#a9a9a9] font-extrabold font-['Sofia Sans Extra Condensed'] uppercase">
              {description}
            </p>

            {requirements && requirements.length > 0 && (
              <div>
                <h3 className="text-2xl font-extrabold font-['Sofia Sans Extra Condensed'] uppercase mb-2">
                  Requirements:
                </h3>
                <ul className="list-disc pl-5">
                  {requirements.map((req, i) => (
                    <li key={i} className="text-lg font-extrabold uppercase text-[#a9a9a9]">{req}</li>
                  ))}
                </ul>
              </div>
            )}

            {tips && tips.length > 0 && (
              <div>
                <h3 className="text-2xl font-bold font-['Sofia Sans Extra Condensed'] uppercase mb-2">
                  Tips:
                </h3>
                <ul className="list-disc pl-5">
                  {tips.map((tip, i) => (
                    <li key={i} className="text-lg font-extrabold uppercase text-[#a9a9a9]">{tip}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}