// src/components/dialogs/PromptDialog/index.tsx
import { useState } from 'react';
import { Button } from '@/components/ui/button';

interface PromptDialogProps {
  promptData: {
    text: string;
    [key: string]: any;
  };
  onClose: () => void;
}

export default function PromptDialog({ promptData, onClose }: PromptDialogProps) {
  const [copied, setCopied] = useState(false);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(promptData.text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const openDiscord = () => {
    window.open("https://discord.gg/dewild", "_blank");
  };

  const openReplicate = () => {
    window.open("https://replicate.com/black-forest-labs/flux-1.1-pro-ultra", "_blank");
  };

  // Функция для обрезания текста промпта
  const truncatePrompt = (text: string, maxLength = 120) => {
    return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
  };

  return (
    <div className="relative flex flex-col items-center w-full h-full overflow-auto">
      <div className="relative z-10 flex flex-col items-center gap-8 px-3 mt-20 sm:mt-8 w-full max-w-[448px] pb-10">
        {/* Header */}
        <div className="flex justify-between items-center w-full">
          <h1 className="text-[48px] font-extrabold uppercase leading-[48px]">
            Your Unique Prompt
          </h1>
          <svg
            onClick={onClose}
            width="48"
            height="48"
            viewBox="0 0 48 48"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="cursor-pointer"
          >
            <path d="M12.4501 37.6501L10.3501 35.5501L21.9001 24.0001L10.3501 12.4501L12.4501 10.3501L24.0001 21.9001L35.5501 10.3501L37.6501 12.4501L26.1001 24.0001L37.6501 35.5501L35.5501 37.6501L24.0001 26.1001L12.4501 37.6501Z" fill="black" />
          </svg>
        </div>

        <div className="flex flex-col gap-3 w-full">
          {/* Step 1: Read Discord */}
          <div className="bg-[#6A35FF] p-4 rounded-[16px]">
            <div className="flex justify-between items-center">
              <div className="text-white text-[32px] leading-[32px] font-extrabold uppercase">
                01. Read Discord
              </div>
              <Button
                onClick={openDiscord}
                variant="primary"
                size="sm"
                className="bg-black hover:bg-gray-800"
              >
                OPEN DISCORD
              </Button>
            </div>
            <div className="text-white text-[24px] leading-[24px] font-extrabold mt-2 uppercase">
              Make sure to check our guide on using your unique prompt correctly.
            </div>
          </div>

          {/* Step 2: Copy Unique Prompt */}
          <div className="bg-[#FF92B9] p-4 rounded-[16px]">
            <div className="flex justify-between items-center">
              <div className="text-[#202020] text-[32px] leading-[32px] font-extrabold uppercase">
                02. Copy Prompt Template
              </div>
              <Button
                onClick={copyToClipboard}
                variant="primary"
                size="sm"
                className="bg-black hover:bg-gray-800"
              >
                {copied ? 'COPIED!' : 'COPY'}
              </Button>
            </div>
            <div className="flex-1 bg-white text-black py-2 px-3 mt-2 rounded-[12px] border border-black font-mono h-[64px] overflow-y-auto">
                <div className="whitespace-pre-wrap">
                    {promptData.text}
                </div>
            </div>
          </div>

          {/* Step 3: Go to Replicate */}
          <div className="bg-[#8B1933] p-4 rounded-[16px]">
            <div className="flex justify-between items-center">
              <div className="text-[#FDC867] text-[32px] leading-[32px] font-extrabold uppercase">
                03. Go to Replicate
              </div>
              <Button
                onClick={openReplicate}
                variant="primary"
                size="sm"
                className="bg-black hover:bg-gray-800"
              >
                OPEN REPLICATE
              </Button>
            </div>
            <div className="text-[#FDC867] text-[24px] leading-[24px] font-extrabold mt-2 uppercase">
              Use BLACK-FOREST-LABS FLUX model to generate perfect image. COST: 0.06$ per image
            </div>
          </div>

          {/* Step 4: Generate Image */}
          <div className="bg-[#F9E52C] p-4 rounded-[16px]">
            <div className="text-[#48926D] text-[32px] leading-[32px] font-extrabold uppercase">
              04. Generate Image
            </div>
            <div className="text-[#48926D] text-[24px] leading-[24px] font-extrabold mt-2 uppercase">
              Upload it in step 3 and wait for approval
            </div>
          </div>
        </div>

        <div className="relative w-full max-w-[448px]">
          <div className="flex flex-col gap-4">
            <button
              onClick={onClose}
              className="text-black text-[24px] font-extrabold uppercase w-full"
            >
              CLOSE
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}