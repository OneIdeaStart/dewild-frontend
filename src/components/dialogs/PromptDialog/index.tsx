// src/components/dialogs/PromptDialog/index.tsx
interface PromptDialogProps {
    onClose: (success?: boolean) => void
  }
  
  export default function PromptDialog({ onClose }: PromptDialogProps) {
    return (
      <div className="relative flex flex-col items-center w-full h-full">
        <div className="relative z-10 flex flex-col items-center gap-8 px-3 mt-20 sm:mt-8 w-full max-w-[448px]">
          {/* Header */}
          <div className="flex justify-between items-center w-full">
            <h1 className="text-[48px] font-extrabold uppercase leading-[48px]">
              Generate PFP
            </h1>
            <svg
              onClick={() => onClose(false)}
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
  
          {/* Prompt Dialog Content */}
          <div className="flex flex-col gap-3 w-full">
            {/* Здесь будет контент для генерации */}
          </div>
        </div>
      </div>
    )
  }