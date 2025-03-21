'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useAppKitAccount } from '@reown/appkit/react'
import { ethers } from 'ethers'
import Header from '@/components/layout/Header'
import { CONTRACTS, ABIS } from '@/lib/web3/contracts'
import { Button } from '@/components/ui/button'
import { getPinataUrl } from '@/lib/pinata'

// Types for NFT
interface NFT {
  tokenId: number;
  image: string;
  hasActiveAuction?: boolean;
  price?: string;
  attributes?: {
    trait_type: string;
    value: string;
  }[];
}

export default function CollectionPage() {
  const [nfts, setNfts] = useState<NFT[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState('all');
  const [animalFilter, setAnimalFilter] = useState('all');
  const [materialFilter, setMaterialFilter] = useState('all');
  const [colorFilter, setColorFilter] = useState('all');
  const [bgColorFilter, setBgColorFilter] = useState('all');
  const [totalNFTs, setTotalNFTs] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(35); // 5x7 grid
  const [filteredNFTsCount, setFilteredNFTsCount] = useState(0);
  const { address } = useAppKitAccount();

  // Function to get NFT metadata
  async function fetchNFTMetadata(tokenId: number): Promise<any> {
    try {
      const baseURI = `/api/metadata/`;
      const response = await fetch(`${baseURI}${tokenId}`);
      if (!response.ok) {
        throw new Error(`Failed to fetch metadata for token ${tokenId}`);
      }
      return await response.json();
    } catch (error) {
      console.error(`Error fetching metadata for token ${tokenId}:`, error);
      return null;
    }
  }

  // Function to check for active auction
  async function checkAuction(tokenId: number, provider: ethers.Provider): Promise<{hasAuction: boolean, price?: string}> {
    try {
      const marketAddress = CONTRACTS.MAINNET.PrimarySaleMarket;
      const marketContract = new ethers.Contract(
        marketAddress,
        ABIS.PrimarySaleMarket,
        provider
      );
      
      // Get auction data directly from contract
      try {
        const auctionInfo = await marketContract.getAuction(tokenId);
        const isActive = auctionInfo[5]; // isActive is the 6th element (index 5)
        
        // If auction is active, check remaining time
        if (isActive) {
          // Get remaining time
          const remainingTime = await marketContract.getRemainingTime(tokenId);
          const isTimeExpired = remainingTime.toString() === "0";
          
          // Auction is considered active only if isActive=true AND remaining time > 0
          const isActuallyActive = isActive && !isTimeExpired;
          
          // Get current bid
          const currentBid = ethers.formatEther(auctionInfo[2]);
          
          return { 
            hasAuction: isActuallyActive,
            price: isActuallyActive ? currentBid : undefined
          };
        }
        
        // If isActive=false, just return false
        return { hasAuction: false };
      } catch (error) {
        // Auction not found, return false
        return { hasAuction: false };
      }
    } catch (error) {
      console.error(`Error checking auction for token ${tokenId}:`, error);
      return { hasAuction: false };
    }
  }    

  useEffect(() => {
    const checkAuctionsForNfts = async () => {
      if (!nfts.length) return;
      
      try {
        // Create provider for blockchain connection
        const provider = new ethers.JsonRpcProvider(
          process.env.NEXT_PUBLIC_BASE_MAINNET_RPC_URL || 'https://mainnet.base.org'
        );
        
        // Connect to auction contract
        const marketAddress = CONTRACTS.MAINNET.PrimarySaleMarket;
        const marketContract = new ethers.Contract(
          marketAddress, 
          ABIS.PrimarySaleMarket,
          provider
        );
        
        // Update auction status for each NFT
        const updatedNfts = await Promise.all(nfts.map(async (nft) => {
          try {
            // Get auction information directly from contract
            const auctionInfo = await marketContract.getAuction(nft.tokenId);
            const isActive = auctionInfo[5]; // isActive is the 6th element (index 5)
            
            if (isActive) {
              // If auction is active, check remaining time
              try {
                const remainingTime = await marketContract.getRemainingTime(nft.tokenId);
                const isTimeExpired = remainingTime.toString() === "0";
                
                // Auction is considered active only if isActive=true AND remaining time > 0
                const isActuallyActive = isActive && !isTimeExpired;
                
                return {
                  ...nft,
                  hasActiveAuction: isActuallyActive,
                  currentBid: isActuallyActive ? ethers.formatEther(auctionInfo[2]) : undefined
                };
              } catch (timeError) {
                console.error(`Error getting remaining time for NFT ${nft.tokenId}:`, timeError);
                return {
                  ...nft,
                  hasActiveAuction: false
                };
              }
            } else {
              // If isActive=false, just return false
              return {
                ...nft,
                hasActiveAuction: false
              };
            }
          } catch (error) {
            console.error(`Error checking auction for NFT ${nft.tokenId}:`, error);
            return {
              ...nft,
              hasActiveAuction: false
            }; // Return original NFT without active auction in case of error
          }
        }));
        
        // Update state with NFTs with current auction status
        setNfts(updatedNfts);
        
      } catch (error) {
        console.error('Failed to check auctions status:', error);
      }
    };
    
    checkAuctionsForNfts();
  }, [nfts.length]); // Execute when number of NFTs changes

  // Reset pagination page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [filter, animalFilter, materialFilter, colorFilter, bgColorFilter]);

  useEffect(() => {
    // Function to load NFTs from contract
    async function loadNFTs() {
      setIsLoading(true);
      setError(null);
      
      try {
        // Connect to provider
        const provider = new ethers.JsonRpcProvider(
          process.env.NEXT_PUBLIC_BASE_MAINNET_RPC_URL || 'https://mainnet.base.org'
        );
        
        // Create contract instance
        const contractAddress = CONTRACTS.MAINNET.DeWildClub;
        const contract = new ethers.Contract(
          contractAddress,
          ABIS.DeWildClub,
          provider
        );
        
        // Get total number of NFTs
        const totalSupply = await contract.totalSupply();
        setTotalNFTs(Number(totalSupply));
        
        // Get data for each token
        const nftPromises = [];
        const maxToShow = Math.min(Number(totalSupply), 50); // Limit for performance
        
        for (let i = 1; i <= maxToShow; i++) {
          nftPromises.push(
            (async () => {
              try {
                // Get token ID and owner
                const tokenId = await contract.tokenByIndex(i - 1);
                const owner = await contract.ownerOf(tokenId);
                
                // Get metadata from our API
                const metadata = await fetchNFTMetadata(Number(tokenId));
                
                if (!metadata) {
                  console.error(`No metadata found for token ${tokenId}`);
                  return null;
                }
                
                // Form image URL through Pinata if it's IPFS hash
                let imageUrl = metadata.image;
                if (imageUrl && imageUrl.startsWith('ipfs://') || (typeof imageUrl === 'string' && !imageUrl.startsWith('http'))) {
                  // Assume it's an IPFS hash
                  const ipfsHash = imageUrl.replace('ipfs://', '');
                  imageUrl = getPinataUrl(ipfsHash);
                }
                
                // Check for auction
                const { hasAuction, price } = await checkAuction(Number(tokenId), provider);
                
                return {
                  tokenId: Number(tokenId),
                  owner,
                  image: imageUrl,
                  attributes: metadata.attributes,
                  hasActiveAuction: hasAuction,
                  price
                };
              } catch (error) {
                console.error(`Error loading NFT ${i}:`, error);
                return null;
              }
            })()
          );
        }
        
        // Wait for all requests to complete
        const results = await Promise.all(nftPromises);
        const validNFTs = results.filter(nft => nft !== null) as NFT[];
        
        // Apply filters
        let filteredNFTs = validNFTs;
        
        // Filter by auction
        if (filter === 'current_auctions') {
          filteredNFTs = filteredNFTs.filter(nft => nft.hasActiveAuction);
        } else if (filter === 'my_nfts' && address) {
          // Filter by owner (your NFTs)
          const addressLower = address.toLowerCase();
          filteredNFTs = filteredNFTs.filter(
            nft => (nft as any).owner && (nft as any).owner.toLowerCase() === addressLower
          );
        }
        
        // Apply attribute filters
        if (animalFilter !== 'all') {
          filteredNFTs = filteredNFTs.filter(nft => {
            if (!nft.attributes) return false;
            const animalAttr = nft.attributes.find(attr => 
              attr.trait_type.toLowerCase() === 'animal' || 
              attr.trait_type.toLowerCase() === 'animal type'
            );
            return animalAttr && animalAttr.value.toLowerCase() === animalFilter.toLowerCase();
          });
        }
        
        if (materialFilter !== 'all') {
          filteredNFTs = filteredNFTs.filter(nft => {
            if (!nft.attributes) return false;
            const materialAttr = nft.attributes.find(attr => 
              attr.trait_type.toLowerCase() === 'material'
            );
            return materialAttr && materialAttr.value.toLowerCase() === materialFilter.toLowerCase();
          });
        }
        
        if (colorFilter !== 'all') {
          filteredNFTs = filteredNFTs.filter(nft => {
            if (!nft.attributes) return false;
            const colorAttr = nft.attributes.find(attr => 
              attr.trait_type.toLowerCase() === 'eyes color' || 
              attr.trait_type.toLowerCase() === 'color'
            );
            return colorAttr && colorAttr.value.toLowerCase() === colorFilter.toLowerCase();
          });
        }
        
        if (bgColorFilter !== 'all') {
          filteredNFTs = filteredNFTs.filter(nft => {
            if (!nft.attributes) return false;
            const bgColorAttr = nft.attributes.find(attr => 
              attr.trait_type.toLowerCase() === 'background' || 
              attr.trait_type.toLowerCase() === 'background color'
            );
            return bgColorAttr && bgColorAttr.value.toLowerCase() === bgColorFilter.toLowerCase();
          });
        }
        
        // Save total number of filtered NFTs for pagination
        setFilteredNFTsCount(filteredNFTs.length);
        
        // Apply pagination
        const startIndex = (currentPage - 1) * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;
        filteredNFTs = filteredNFTs.slice(startIndex, endIndex);
        
        setNfts(filteredNFTs);
        setIsLoading(false);
      } catch (error: any) {
        console.error('Failed to load NFTs:', error);
        setError(error.message || 'Failed to load NFTs');
        setIsLoading(false);
      }
    }

    loadNFTs();
  }, [filter, address, currentPage]);

  // Function to display price
  const formatPrice = (price?: string) => {
    if (!price) return '';
    return `${parseFloat(price).toFixed(3)} ETH`;
  };

  return (
    <div className="bg-white min-h-screen pb-16">
      <Header />
      
      <div className="w-full px-4 sm:px-6 pt-40">
        {/* Header */}
        <h1 className="text-5xl font-extrabold font-['Sofia Sans Extra Condensed'] uppercase text-center mb-[120px]">
          DEWILD CLUB NFT COLLECTION
        </h1>
        
        {/* Filters */}
        <div className="mb-20">
          {/* Main filter */}
          <div className="flex flex-wrap justify-between items-center border-b border-gray-300 pb-4 mb-6">
            <div className="flex items-center gap-4">
              <button 
                className={`font-extrabold uppercase text-lg ${filter === 'all' ? 'text-black' : 'text-gray-400 hover:text-gray-600'}`}
                onClick={() => setFilter('all')}
              >
                ALL NFTS
              </button>
              <button 
                className={`font-extrabold uppercase text-lg ${filter === 'current_auctions' ? 'text-black' : 'text-gray-400 hover:text-gray-600'}`}
                onClick={() => setFilter('current_auctions')}
              >
                CURRENT AUCTIONS
              </button>
              {address && (
                <button 
                  className={`font-extrabold uppercase text-lg ${filter === 'my_nfts' ? 'text-black' : 'text-gray-400 hover:text-gray-600'}`}
                  onClick={() => setFilter('my_nfts')}
                >
                  MY NFTS
                </button>
              )}
            </div>
            
            {/* Reset all filters */}
            {(animalFilter !== 'all' || materialFilter !== 'all' || colorFilter !== 'all' || bgColorFilter !== 'all') && (
              <button 
                className="text-xs font-bold text-gray-500 hover:text-black"
                onClick={() => {
                  setAnimalFilter('all');
                  setMaterialFilter('all');
                  setColorFilter('all');
                  setBgColorFilter('all');
                }}
              >
                RESET FILTERS
              </button>
            )}
          </div>
          
          {/* Attribute filters */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 hidden">
            {/* Animals */}
            <div className="relative">
              <label className="block text-xs font-bold text-gray-500 mb-2">ANIMAL TYPE</label>
              <select 
                className="w-full appearance-none font-extrabold uppercase text-base bg-transparent border rounded-lg p-2 pr-8"
                value={animalFilter}
                onChange={(e) => setAnimalFilter(e.target.value)}
              >
                <option value="all">ALL ANIMALS</option>
                <option value="tiger">TIGER</option>
                <option value="lion">LION</option>
                <option value="bear">BEAR</option>
                <option value="wolf">WOLF</option>
                <option value="owl">OWL</option>
                <option value="eagle">EAGLE</option>
                <option value="hippo">HIPPO</option>
              </select>
              <div className="pointer-events-none absolute bottom-3 right-2 text-gray-500">
                <svg width="16" height="9" viewBox="0 0 16 9" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M1 1L8 8L15 1" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
            </div>
            
            {/* Materials */}
            <div className="relative">
              <label className="block text-xs font-bold text-gray-500 mb-2">MATERIAL</label>
              <select 
                className="w-full appearance-none font-extrabold uppercase text-base bg-transparent border rounded-lg p-2 pr-8"
                value={materialFilter}
                onChange={(e) => setMaterialFilter(e.target.value)}
              >
                <option value="all">ALL MATERIALS</option>
                <option value="metal">METAL</option>
                <option value="silver">SILVER</option>
                <option value="gold">GOLD</option>
                <option value="diamond">DIAMOND</option>
                <option value="titanium">TITANIUM</option>
                <option value="metallic">METALLIC</option>
              </select>
              <div className="pointer-events-none absolute bottom-3 right-2 text-gray-500">
                <svg width="16" height="9" viewBox="0 0 16 9" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M1 1L8 8L15 1" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
            </div>
            
            {/* Eye colors */}
            <div className="relative">
              <label className="block text-xs font-bold text-gray-500 mb-2">EYES COLOR</label>
              <select 
                className="w-full appearance-none font-extrabold uppercase text-base bg-transparent border rounded-lg p-2 pr-8"
                value={colorFilter}
                onChange={(e) => setColorFilter(e.target.value)}
              >
                <option value="all">ALL COLORS</option>
                <option value="red">RED</option>
                <option value="blue">BLUE</option>
                <option value="green">GREEN</option>
                <option value="yellow">YELLOW</option>
                <option value="purple">PURPLE</option>
              </select>
              <div className="pointer-events-none absolute bottom-3 right-2 text-gray-500">
                <svg width="16" height="9" viewBox="0 0 16 9" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M1 1L8 8L15 1" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
            </div>
            
            {/* Background colors */}
            <div className="relative">
              <label className="block text-xs font-bold text-gray-500 mb-2">BACKGROUND</label>
              <select 
                className="w-full appearance-none font-extrabold uppercase text-base bg-transparent border rounded-lg p-2 pr-8"
                value={bgColorFilter}
                onChange={(e) => setBgColorFilter(e.target.value)}
              >
                <option value="all">ALL BG COLORS</option>
                <option value="black">BLACK</option>
                <option value="white">WHITE</option>
                <option value="blue">BLUE</option>
                <option value="green">GREEN</option>
                <option value="red">RED</option>
                <option value="purple">PURPLE</option>
              </select>
              <div className="pointer-events-none absolute bottom-3 right-2 text-gray-500">
                <svg width="16" height="9" viewBox="0 0 16 9" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M1 1L8 8L15 1" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
            </div>
          </div>
        </div>
        
        {/* Removed collection info block */}
        
        {/* NFT grid using Grid */}
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-[#202020]"></div>
          </div>
        ) : error ? (
          <div className="text-center py-10">
            <h3 className="text-xl font-bold text-red-500 mb-4">Error Loading NFTs</h3>
            <p className="text-gray-700 mb-6">{error}</p>
            <Button 
              onClick={() => window.location.reload()} 
              variant="primary"
            >
              Try Again
            </Button>
          </div>
        ) : nfts.length === 0 ? (
          <div className="text-center py-10">
            <h3 className="text-xl font-bold mb-4">No NFTs Found</h3>
            <p className="text-gray-700 mb-6">
              {filter === 'current_auctions' 
                ? 'There are no active auctions at the moment.' 
                : filter === 'my_nfts' 
                  ? 'You don\'t own any NFTs from this collection.' 
                  : 'No NFTs match your filter criteria.'}
            </p>
            {filter !== 'all' && (
              <Button 
                onClick={() => setFilter('all')} 
                variant="primary"
              >
                Show All NFTs
              </Button>
            )}
          </div>
        ) : (
          <div className="flex flex-wrap gap-6 justify-between">
            {nfts.map((nft) => (
              <Link href={`/collection/${nft.tokenId}`} key={nft.tokenId} className="mb-8">
                <div className="w-[132px] text-[#a9a9a9] hover:text-black">
                <div className="h-[132px] w-[132px] rounded-[16px] overflow-hidden relative">
                  <img 
                    src={nft.image} 
                    alt={`NFT #${nft.tokenId}`}
                    className="w-full h-full object-cover transition-transform duration-300 hover:scale-110" 
                  />
                  {Boolean(nft.hasActiveAuction) && (
                    <div className="absolute top-3 left-0 bg-[#202020] text-white px-1 text-xs font-bold rounded-tr-br-md z-10 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse"></span>
                      AUCTION
                    </div>
                  )}
                </div>
                  <div className="p-2 text-center">
                    <span className="font-extrabold uppercase text-lg">#{nft.tokenId}</span>
                    {nft.price && (
                      <div className="text-sm font-bold text-green-600">{formatPrice(nft.price)}</div>
                    )}
                  </div>
                </div>
              </Link>
            ))}
            {/* Add invisible elements for even distribution in the last row */}
            {nfts.length % 7 !== 0 && 
              Array.from({ length: 7 - (nfts.length % 7) }).map((_, index) => (
                <div key={`spacer-${index}`} className="w-[132px] h-0 m-0 p-0 invisible"></div>
              ))
            }
          </div>
        )}
        
        {/* Pagination */}
        {!isLoading && !error && nfts.length > 0 && 
          Math.ceil(filteredNFTsCount / itemsPerPage) > 1 && (
            <div className="flex justify-center items-center mt-10">
              <div className="inline-flex items-center gap-2">
                <Button
                  variant="default"
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  className="px-3"
                >
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M10 12L6 8L10 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </Button>
                
                <div className="px-4 py-2 font-bold">
                  {currentPage} / {Math.ceil(filteredNFTsCount / itemsPerPage) || 1}
                </div>
                
                <Button
                  variant="default"
                  disabled={currentPage >= Math.ceil(filteredNFTsCount / itemsPerPage) || filteredNFTsCount <= itemsPerPage}
                  onClick={() => setCurrentPage(p => p + 1)}
                  className="px-3"
                >
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M6 12L10 8L6 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </Button>
              </div>
            </div>
          )
        }
      </div>
    </div>
  );
}