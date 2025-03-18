// src/components/auctions/AuctionBidderBlock.tsx
'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { useAppKitAccount } from '@reown/appkit/react'

interface NFTDetails {
  tokenId: number;
  name: string;
  image: string;
  description: string;
  artist: string;
  artistAddress: string;
  attributes: {
    trait_type: string;
    value: string;
  }[];
  owner: string;
}

interface AuctionBidderBlockProps {
  nftDetails: NFTDetails;
  txStatus: string;
  txError: string;
  isConfirming: boolean;
  isConfirmed: boolean;
  placeBid: (tokenId: number, bidAmount: string) => Promise<any>;
  auctionDetails?: any;
  timeLeft?: string;
  refreshAuctionData: () => Promise<void>; // Add update function
  isRefreshing: boolean; // Add loading state
}

export default function AuctionBidderBlock({
  nftDetails,
  txStatus,
  txError,
  isConfirming,
  isConfirmed,
  placeBid,
  auctionDetails,
  timeLeft,
  refreshAuctionData, // Get update function
  isRefreshing // Get loading state
}: AuctionBidderBlockProps) {
  const { address } = useAppKitAccount();
  const [bidAmount, setBidAmount] = useState<string>('');
  const [debug, setDebug] = useState(false);


  // Handle bid placement
  const handlePlaceBid = async () => {
    if (!address || !nftDetails || !auctionDetails) return;
    
    try {
      // Check that bid is higher than minimum
      const currentBidValue = parseFloat(auctionDetails.currentBid);
      const minBid = currentBidValue > 0 ? currentBidValue * 1.11 : parseFloat(auctionDetails.startPrice); // Min bid is current bid + 11% or starting price
      
      if (parseFloat(bidAmount) < minBid) {
        throw new Error(`Bid must be at least ${minBid.toFixed(4)} ETH`);
      }
      
      await placeBid(nftDetails.tokenId, bidAmount);
    } catch (error: any) {
      console.error('Failed to place bid:', error);
    }
  };

    // Determine if user is leading auction participant
    const isHighestBidder = address && auctionDetails?.highestBidder && 
    address.toLowerCase() === auctionDetails.highestBidder.toLowerCase();

  // If auction time expired but auction is still active
    if (timeLeft === 'Auction ended' && auctionDetails?.isActive) {
        return (
        <div className="mb-4 p-6 bg-gray-800 rounded-xl text-white">
            <h2 className="text-2xl font-extrabold uppercase mb-4">
            AUCTION ENDED
            </h2>
            
            {/* Save information about current bid and leading participant */}
            <div className="space-y-2 mb-4">
            <div className="flex justify-between">
                <span className="font-extrabold uppercase">FINAL BID:</span>
                <span className="font-extrabold">{auctionDetails.currentBid} ETH</span>
            </div>
            
            <div className="flex justify-between">
                <span className="font-extrabold uppercase">WINNER:</span>
                <span className="font-extrabold">
                {auctionDetails.highestBidder === "0x0000000000000000000000000000000000000000" 
                    ? "No bids" 
                    : isHighestBidder 
                    ? "You" 
                    : `${auctionDetails.highestBidder.substring(0, 6)}...${auctionDetails.highestBidder.substring(38)}`}
                </span>
            </div>
            </div>

            <div className="p-4 bg-yellow-100 border border-yellow-300 text-yellow-800 rounded-lg">
            <p className="font-bold">
                This auction has ended and is awaiting finalization. The results will be available soon.
            </p>
            </div>
            
            <div className="mt-4 text-sm font-medium">
            <p>
                75% of the final sale price goes to the artist, 25% goes to the DeWild platform.
            </p>
            </div>
        </div>
        );
    }

  // Auction block for bidding participation
  return (
    <div className="mb-4 p-6 bg-black rounded-xl text-white">
      <div className="flex flex-row w-full justify-between items-center mb-4">
        <h2 className="text-2xl font-extrabold uppercase">
          CURRENT AUCTION
        </h2>
        
        {/* Button to update auction data */}
        <Button 
          onClick={refreshAuctionData} 
          variant="default"
          disabled={isRefreshing}
          className="flex items-center gap-1 px-2 pt-[5px] pb-[3px] bg-white text-black hover:bg-gray-100 border-0"
        >
          {isRefreshing ? (
            <>
              <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <span className="text-xs">REFRESHING...</span>
            </>
          ) : (
            <>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M8.00033 13.3346C6.51144 13.3346 5.25033 12.818 4.21699 11.7846C3.18366 10.7513 2.66699 9.49019 2.66699 8.0013C2.66699 6.51241 3.18366 5.2513 4.21699 4.21797C5.25033 3.18464 6.51144 2.66797 8.00033 2.66797C8.76699 2.66797 9.50033 2.8263 10.2003 3.14297C10.9003 3.45964 11.5003 3.91241 12.0003 4.5013V2.66797H13.3337V7.33464H8.66699V6.0013H11.467C11.1114 5.37908 10.6253 4.89019 10.0087 4.53464C9.39199 4.17908 8.72255 4.0013 8.00033 4.0013C6.88921 4.0013 5.94477 4.39019 5.16699 5.16797C4.38921 5.94575 4.00033 6.89019 4.00033 8.0013C4.00033 9.11241 4.38921 10.0569 5.16699 10.8346C5.94477 11.6124 6.88921 12.0013 8.00033 12.0013C8.85588 12.0013 9.6281 11.7569 10.317 11.268C11.0059 10.7791 11.4892 10.1346 11.767 9.33464H13.167C12.8559 10.5124 12.2225 11.4735 11.267 12.218C10.3114 12.9624 9.22255 13.3346 8.00033 13.3346Z" fill="currentColor"/>
              </svg>
              <span className="text-xs">REFRESH</span>
            </>
          )}
        </Button>
      </div>
      
      <div className="space-y-1">
        <div className="flex justify-between">
          <span className="font-extrabold uppercase">CURRENT BID:</span>
          <span className="font-extrabold">{auctionDetails.currentBid} ETH</span>
        </div>
        
        <div className="flex justify-between">
          <span className="font-extrabold uppercase">HIGHEST BIDDER:</span>
          <span className="font-extrabold">
            {auctionDetails.highestBidder === "0x0000000000000000000000000000000000000000" 
              ? "No bids yet" 
              : isHighestBidder 
                ? <span className="text-green-500 text-sm font-bold pb-[3px]">
                YOU'RE WINNING
                </span> 
                : `${auctionDetails.highestBidder.substring(0, 6)}...${auctionDetails.highestBidder.substring(38)}`}
          </span>
        </div>
        
        <div className="flex justify-between">
          <span className="font-extrabold uppercase">TIME LEFT:</span>
          <span className="font-extrabold">{timeLeft}</span>
        </div>
      </div>
      
      {/* Debug information */}
      {debug && (
        <div className="p-3 bg-gray-700 text-white text-xs mt-3 mb-3 rounded">
          <p>Debug Info:</p>
          <p>timeLeft: {timeLeft}</p>
          <p>auctionDetails.isActive: {String(auctionDetails?.isActive)}</p>
          <button 
            className="px-2 py-1 bg-blue-500 text-white rounded mt-2"
            onClick={() => console.log('Debug bid info:', { auctionDetails, timeLeft, bidAmount })}
          >
            Log Debug
          </button>
        </div>
      )}
      
      {/* Bid form */}
      <div className="mt-6">
        <div className="mb-4">
          <label className="block text-sm font-extrabold uppercase mb-2">YOUR BID (ETH)</label>
          <input
            type="number"
            placeholder={`Min bid: ${(parseFloat(auctionDetails.currentBid) > 0 ? parseFloat(auctionDetails.currentBid) * 1.11 : parseFloat(auctionDetails.startPrice)).toFixed(4)} ETH`}
            value={bidAmount}
            onChange={(e) => setBidAmount(e.target.value)}
            className="w-full px-4 py-2 rounded-lg border-2 border-white bg-transparent text-white placeholder-gray-400"
            min={(parseFloat(auctionDetails.currentBid) > 0 ? parseFloat(auctionDetails.currentBid) * 1.11 : parseFloat(auctionDetails.startPrice)).toFixed(4)}
            step="0.001"
            disabled={txStatus !== 'idle' && txStatus !== 'error'}
          />
        </div>
        
        {/* Display error if exists */}
        {txStatus === 'error' && txError && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
            <p className="font-bold">Error: {txError}</p>
          </div>
        )}
        
        {/* Display confirmation information if transaction is sent */}
        {(txStatus === 'loading' || txStatus === 'success') && isConfirming && (
          <div className="mb-4 p-3 bg-blue-100 border border-blue-400 text-blue-700 rounded">
            <p className="font-bold">Confirming transaction...</p>
          </div>
        )}
        
        {/* Display success message if transaction is confirmed */}
        {txStatus === 'success' && isConfirmed && (
          <div className="mb-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded">
            <p className="font-bold">Bid placed successfully!</p>
          </div>
        )}
        
        <Button 
          onClick={handlePlaceBid} 
          className="w-full bg-yellow-400 text-black hover:bg-yellow-500 font-extrabold"
          disabled={txStatus !== 'idle' && txStatus !== 'error' || !bidAmount}
          size="lg"
        >
          {txStatus === 'loading' || isConfirming ? (
            <span className="flex items-center justify-center">
              <svg className="animate-spin h-5 w-5 mr-2" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              {isConfirming ? 'CONFIRMING TRANSACTION...' : 'PLACING BID...'}
            </span>
          ) : 'PLACE BID'}
        </Button>
      </div>
      
      <div className="mt-4 text-sm font-medium">
        <p>
          75% of the final sale price goes to the artist, 25% goes to the DeWild platform.
        </p>
      </div>
    </div>
  );
}