// src/components/dialogs/MintSuccessDialog/index.tsx
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';

interface MintSuccessDialogProps {
  isOpen: boolean;
  onClose: () => void;
  nftNumber: string | number | null; // Change tokenId to nftNumber
}

export default function MintSuccessDialog({ isOpen, onClose, nftNumber }: MintSuccessDialogProps) {
  const router = useRouter();

  const handleAuctionClick = () => {
    onClose(); // Close dialog
    
    // Redirect to specific NFT page using nftNumber
    if (nftNumber) {
      router.push(`/collection/${nftNumber}`);
    } else {
      // If for some reason nftNumber is missing, redirect to collection page
      router.push('/collection');
    }
  };

  return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-[384px] bg-[#181818] rounded-[24px] p-0 overflow-hidden">
          <div className="flex flex-col items-center gap-10 px-8 py-10">
            {/* Status */}
            <div className="flex flex-col gap-2 text-center">
              <div className="text-green-400 text-[24px] font-extrabold uppercase leading-[24px]">
                🎉
              </div>
              <div className="text-green-400 text-[24px] font-extrabold uppercase leading-[24px]">
                YOUR NFT HAS BEEN MINTED!
              </div>
            </div>

            {/* Message */}
            <div className="flex flex-col items-center gap-2 text-center">
              <div className="text-white text-[48px] font-extrabold uppercase leading-[48px]">
                Congrats,<br/>Artist!
              </div>
              <div className="text-gray-400 text-[16px] font-extrabold uppercase leading-[16px]">
                Your NFT is now immortalized on-chain. It's ready for the world to see and collect.
                {nftNumber && <span className="block mt-2">NFT Number: {nftNumber}</span>}
              </div>
            </div>

            {/* Auction Button */}
            <div className="flex flex-col items-center gap-4">
              <div className="text-white text-[24px] font-extrabold uppercase leading-[24px]">
                GO TO YOUR NFT AUCTION
              </div>
              <Button 
                  onClick={handleAuctionClick}
                  className="bg-yellow-400 hover:bg-yellow-500 text-green-600 font-extrabold uppercase"
                  size="lg"
              >
                  {nftNumber ? "VIEW YOUR NFT" : "VIEW COLLECTION"}
              </Button>
            </div>

            {/* Close Button */}
            <button 
              onClick={onClose}
              className="text-gray-400 text-[24px] font-extrabold uppercase leading-[24px]"
            >
              Close
            </button>
          </div>
        </DialogContent>
      </Dialog>
  );
}


