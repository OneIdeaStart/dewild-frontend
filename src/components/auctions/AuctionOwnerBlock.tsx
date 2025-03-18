// src/components/auctions/AuctionOwnerBlock.tsx
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

interface AuctionOwnerBlockProps {
  nftDetails: NFTDetails;
  txStatus: string;
  txError: string;
  isApprovalConfirmed: boolean;
  isApprovalConfirming: boolean;
  isConfirming: boolean;
  isConfirmed: boolean;
  createAuction: (tokenId: number) => Promise<any>;
  cancelAuction: (tokenId: number) => Promise<any>;
  endAuction: (tokenId: number) => Promise<any>;
  auctionDetails?: any;
  timeLeft?: string;
  isAuctionTimeExpired?: boolean;
  isEndingAuction: boolean;
  setIsEndingAuction: (value: boolean) => void;
  refreshAuctionData: () => Promise<void>; // Add update function
  isRefreshing: boolean; // Add loading state
}

export default function AuctionOwnerBlock({
  nftDetails,
  txStatus,
  txError,
  isApprovalConfirmed,
  isApprovalConfirming,
  isConfirming,
  isConfirmed,
  createAuction,
  cancelAuction,
  endAuction,
  auctionDetails,
  timeLeft,
  isAuctionTimeExpired,
  isEndingAuction,
  setIsEndingAuction,
  refreshAuctionData,
  isRefreshing
}: AuctionOwnerBlockProps) {
  const { address } = useAppKitAccount();
  
  // State for debugging (can be removed later)
  const [debug, setDebug] = useState(false);

  // Handle auction creation
  const handleCreateAuction = async () => {
    if (!address || !nftDetails) return;
    try {
      await createAuction(nftDetails.tokenId);
    } catch (error: any) {
      console.error('Failed to create auction:', error);
    }
  };

  // Handle auction cancellation
  const handleCancelAuction = async () => {
    if (!address || !nftDetails || !auctionDetails) return;
    try {
      await cancelAuction(nftDetails.tokenId);
    } catch (error: any) {
      console.error('Failed to cancel auction:', error);
    }
  };
  
  // Handle auction completion
  const handleEndAuction = async () => {
    if (!address || !nftDetails) return;
    try {
      setIsEndingAuction(true);
      await endAuction(nftDetails.tokenId);
    } catch (error: any) {
      console.error('Failed to end auction:', error);
      setIsEndingAuction(false);
    }
  };

  // Determine if auction can be cancelled (no bids)
  const canCancel = auctionDetails?.highestBidder === "0x0000000000000000000000000000000000000000" || 
                   parseFloat(auctionDetails?.currentBid || "0") === 0;

  // If auction is active, show auction management panel
    if (auctionDetails?.isActive) {
        return (
        <div className="mb-4 p-6 bg-black rounded-xl text-white">
            <div className="flex flex-row w-full justify-between items-center mb-4">
            <h2 className="text-2xl font-extrabold uppercase">
                YOUR ACTIVE AUCTION
            </h2>
            
            {/* Data update button */}
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
            
            <div className="space-y-1 mb-4">
            <div className="flex justify-between">
                <span className="font-extrabold uppercase">CURRENT BID:</span>
                <span className="font-extrabold">{auctionDetails.currentBid} ETH</span>
            </div>
            
            <div className="flex justify-between">
                <span className="font-extrabold uppercase">HIGHEST BIDDER:</span>
                <span className="font-extrabold">
                {auctionDetails.highestBidder === "0x0000000000000000000000000000000000000000" 
                    ? "No bids yet" 
                    : `${auctionDetails.highestBidder.substring(0, 6)}...${auctionDetails.highestBidder.substring(38)}`}
                </span>
            </div>
            
            <div className="flex justify-between">
                <span className="font-extrabold uppercase">TIME LEFT:</span>
                <span className="font-extrabold">{timeLeft}</span>
            </div>
            </div>
            
            {/* Show cancel button only if there are no bids */}
            {canCancel ? (
            <>
                {/* Display error if exists */}
                {txStatus === 'error' && txError && (
                <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
                    <p className="font-bold">Error: {txError}</p>
                </div>
                )}
                
                {/* Display confirmation information if transaction is sent */}
                {txStatus === 'loading' && isConfirming && (
                <div className="mb-4 p-3 bg-blue-100 border border-blue-400 text-blue-700 rounded">
                    <p className="font-bold">Confirming transaction...</p>
                </div>
                )}
                
                {/* Display success message if transaction is confirmed */}
                {txStatus === 'success' && isConfirmed && (
                <div className="mb-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded">
                    <p className="font-bold">Auction cancelled successfully!</p>
                </div>
                )}
                
                <Button 
                onClick={handleCancelAuction} 
                className="w-full bg-white text-red-600 hover:bg-gray-100 font-extrabold"
                disabled={txStatus !== 'idle' && txStatus !== 'error'}
                size="lg"
                >
                {txStatus === 'loading' || isConfirming ? (
                    <span className="flex items-center justify-center">
                    <svg className="animate-spin h-5 w-5 mr-2" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    {isConfirming ? 'CONFIRMING TRANSACTION...' : 'CANCELLING AUCTION...'}
                    </span>
                ) : 'CANCEL AUCTION'}
                </Button>
            </>
            ) : (
            // CHANGE: Remove message for auctions with bids, replace with empty area for possible notifications
            <div>
                {/* Transaction statuses will be displayed here */}
                {txStatus === 'error' && txError && (
                <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded mt-4">
                    <p className="font-bold">Error: {txError}</p>
                </div>
                )}
            </div>
            )}
            
            {/* Auction end button if time has expired */}
            {(isAuctionTimeExpired || timeLeft === 'Auction ended') && (
            <div className="mt-4">
                {/* Display error if exists */}
                {txStatus === 'error' && txError && (
                <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
                    <p className="font-bold">Error: {txError}</p>
                </div>
                )}
                
                {/* Display confirmation information if transaction is sent */}
                {txStatus === 'loading' && isConfirming && (
                <div className="mb-4 p-3 bg-blue-100 border border-blue-400 text-blue-700 rounded">
                    <p className="font-bold">Confirming transaction...</p>
                </div>
                )}
                
                {/* Display success message if transaction is confirmed */}
                {txStatus === 'success' && isConfirmed && (
                <div className="mb-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded">
                    <p className="font-bold">Auction ended successfully!</p>
                </div>
                )}
                
                <Button
                onClick={handleEndAuction}
                className="w-full bg-green-500 text-white hover:bg-green-600 font-extrabold"
                disabled={isEndingAuction}
                size="lg"
                >
                {isEndingAuction ? (
                    <span className="flex items-center justify-center">
                    <svg className="animate-spin h-5 w-5 mr-2" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    ENDING AUCTION...
                    </span>
                ) : 'END AUCTION'}
                </Button>
            </div>
            )}
            
            <div className="mt-4 text-sm font-medium">
            <p>
                75% of the final sale price goes to the artist, 25% goes to the DeWild platform.
            </p>
            </div>
        </div>
        );
    }

  // Default: NFT not in auction, show auction creation form
  return (
    <div className="mb-4 p-6 bg-yellow-400 rounded-xl">
    <h2 className="text-2xl font-extrabold uppercase text-black mb-2">
      CREATE AUCTION
    </h2>
    <p className="text-black font-extrabold uppercase mb-4">
      LIST YOUR NFT FOR AUCTION AND LET COLLECTORS BID FOR IT. YOU'LL RECEIVE 75% OF THE FINAL SALE PRICE. All auctions start at 0.011 ETH. The minimum bid increment is 11%.
    </p>
    
    {/* Display only error or success messages */}
    {txStatus === 'error' && txError && (
      <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
        <p className="font-bold">Error: {txError}</p>
      </div>
    )}
    
    {/* Display only success if transaction is confirmed */}
    {txStatus === 'success' && isConfirmed && (
      <div className="mb-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded">
        <p className="font-bold">Auction created successfully!</p>
      </div>
    )}
    
    <Button 
      onClick={handleCreateAuction} 
      className="w-full bg-black text-white hover:bg-gray-900 font-extrabold"
      disabled={(txStatus !== 'idle' && txStatus !== 'error') || isConfirming}
      size="lg"
    >
      {(txStatus === 'approving' || txStatus === 'creating' || isConfirming) ? (
        <span className="flex items-center justify-center">
          <svg className="animate-spin h-5 w-5 mr-2" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          {txStatus === 'approving' && !isApprovalConfirmed ? 'APPROVING NFT...' : 'CREATING AUCTION...'}
        </span>
      ) : 'CREATE AUCTION'}
    </Button>
  </div>
 );
}
