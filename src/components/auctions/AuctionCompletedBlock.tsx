// src/components/auctions/AuctionCompletedBlock.tsx
'use client'

import Link from 'next/link'
import { CONTRACTS } from '@/lib/web3/contracts'

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

interface AuctionCompletedBlockProps {
  nftDetails: NFTDetails;
  hasBeenSold: boolean;
  auctionResult?: {
    finalPrice?: string;
    winner?: string;
    endedAt?: string;
    artist?: string;
  };
}

export default function AuctionCompletedBlock({
  nftDetails,
  hasBeenSold,
  auctionResult
}: AuctionCompletedBlockProps) {
  // Форматирование адреса кошелька
  const formatAddress = (address: string) => {
    if (!address) return '';
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
  };

  // Форматирование даты
  const formatDate = (timestamp?: string) => {
    if (!timestamp) return 'Unknown';
    const date = new Date(timestamp);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
  };

  // Если NFT не был продан через аукцион, показываем соответствующее сообщение
  if (!hasBeenSold) {
    return (
      <div className="mb-4 p-6 bg-orange-100 rounded-xl">
        <p className="text-[#a9a9a9] font-extrabold uppercase mb-4">
          This NFT is currently not on auction. Check current auctions or browse the secondary market on OpenSea.
        </p>
        
        <div className="flex flex-wrap gap-4">
          <Link 
            href="/collection?filter=current_auctions"
            className="text-blue-600 hover:underline font-extrabold uppercase"
          >
            VIEW CURRENT AUCTIONS
          </Link>
          
          <a 
            href={`https://opensea.io/assets/base/${CONTRACTS.MAINNET.DeWildClub}/${nftDetails.tokenId}`}
            target="_blank" 
            rel="noopener noreferrer"
            className="text-blue-600 hover:underline font-extrabold uppercase"
          >
            VIEW ON OPENSEA
          </a>
        </div>
      </div>
    );
  }

  // Показываем информацию о завершенном аукционе
  return (
    <div className="mb-4 p-6 bg-black rounded-xl text-white">
      <div className="flex flex-row w-full gap-4 justify-between items-center mb-4">
        <h2 className="text-2xl font-extrabold uppercase">
          AUCTION COMPLETED
        </h2>
      </div>
      
      <div className="space-y-1">
        <div className="flex justify-between">
          <span className="font-extrabold uppercase">FINAL PRICE:</span>
          <span className="font-extrabold text-green-400">{auctionResult?.finalPrice || 'Unknown'} ETH</span>
        </div>
        
        <div className="flex justify-between">
          <span className="font-extrabold uppercase">WINNER:</span>
          <span className="font-extrabold">
            {auctionResult?.winner 
              ? formatAddress(auctionResult.winner)
              : formatAddress(nftDetails.owner)}
          </span>
        </div>
        
        <div className="flex justify-between">
          <span className="font-extrabold uppercase">SOLD ON:</span>
          <span className="font-extrabold">
            {formatDate(auctionResult?.endedAt)}
          </span>
        </div>
      </div>

      <div className="flex flex-raw gap-4 mt-6">
          <a 
            href={`https://opensea.io/assets/base/${CONTRACTS.MAINNET.DeWildClub}/${nftDetails.tokenId}`}
            target="_blank" 
            rel="noopener noreferrer"
            className="text-blue-400 hover:underline font-extrabold"
          >
            VIEW ON OPENSEA
          </a>
          
          <a 
            href={`https://basescan.org/token/${CONTRACTS.MAINNET.DeWildClub}?a=${nftDetails.tokenId}`}
            target="_blank" 
            rel="noopener noreferrer"
            className="text-blue-400 hover:underline font-extrabold"
          >
            VIEW ON BASESCAN
          </a>
        </div>
      
      <div className="mt-6 pt-6 border-t border-gray-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <svg className="h-5 w-5 text-yellow-500 mr-2" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <p className="text-sm text-gray-300 font-medium">
              Verified sale on DeWild marketplace
            </p>
          </div>
          <div className="text-sm text-gray-400">
            <span className="font-medium">Artist earned:</span> {auctionResult?.finalPrice ? (parseFloat(auctionResult.finalPrice) * 0.75).toFixed(4) : '0'} ETH (75%)
          </div>
        </div>
      </div>
    </div>
  );
}