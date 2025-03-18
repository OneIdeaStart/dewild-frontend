// src/app/collection/[tokenId]/page.tsx
'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { useAppKitAccount } from '@reown/appkit/react'
import { ethers } from 'ethers'
import Header from '@/components/layout/Header'
import { CONTRACTS, ABIS } from '@/lib/web3/contracts'
import { getPinataUrl } from '@/lib/pinata'
import { useAuction } from '@/hooks/useAuction'
import AuctionOwnerBlock from '@/components/auctions/AuctionOwnerBlock'
import AuctionBidderBlock from '@/components/auctions/AuctionBidderBlock'
import AuctionCompletedBlock from '@/components/auctions/AuctionCompletedBlock'

// Types for NFT and auction
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

interface AuctionDetails {
  isActive: boolean;
  startPrice: string;
  currentBid: string;
  highestBidder: string;
  endTime: number;
  artist: string;
}

export default function NFTDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const { address } = useAppKitAccount();
  const tokenId = Number(params.tokenId);
  
  // Use useAuction hook
  const { 
    createAuction, 
    createAuctionAfterApproval,
    cancelAuction, 
    placeBid, 
    checkAuction: checkAuctionStatus,
    endAuction,
    txStatus, 
    txError, 
    isConfirming,
    isConfirmed,
    isApprovalConfirming,
    isApprovalConfirmed,
    isFailedTx 
  } = useAuction();
  
  const [nftDetails, setNftDetails] = useState<NFTDetails | null>(null);
  const [auctionDetails, setAuctionDetails] = useState<AuctionDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [bidAmount, setBidAmount] = useState<string>('');
  const [isOwner, setIsOwner] = useState(false);
  const [isAuctionCreator, setIsAuctionCreator] = useState(false);
  const [timeLeft, setTimeLeft] = useState<string>('');
  const [hasBeenSold, setHasBeenSold] = useState(false);
  const [isEndingAuction, setIsEndingAuction] = useState(false);
  const [isCreatingAuctionAfterApproval, setIsCreatingAuctionAfterApproval] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isAuctionTimeExpired, setIsAuctionTimeExpired] = useState(false);
  const [debug, setDebug] = useState(true); // Enable debugging
  
  // Auction result information for completed auctions
  const [auctionResult, setAuctionResult] = useState<{
    finalPrice?: string;
    winner?: string;
    endedAt?: string;
    artist?: string;
  } | undefined>(undefined);

  // Function to format wallet address
  const formatAddress = (address: string) => {
    if (!address) return '';
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
  };

  // Function to update only auction data
  const refreshAuctionData = async () => {
    if (!tokenId) return;
    
    // Set update flag
    setIsRefreshing(true);
    console.log("🔄 Refreshing auction data for token", tokenId);
    
    try {
      // Connect to provider
      const provider = new ethers.JsonRpcProvider(
        process.env.NEXT_PUBLIC_BASE_MAINNET_RPC_URL || 'https://mainnet.base.org'
      );
      
      // Create contract instances
      const nftAddress = CONTRACTS.MAINNET.DeWildClub;
      const nftContract = new ethers.Contract(
        nftAddress,
        ABIS.DeWildClub,
        provider
      );
      
      const marketAddress = CONTRACTS.MAINNET.PrimarySaleMarket;
      const marketContract = new ethers.Contract(
        marketAddress, 
        ABIS.PrimarySaleMarket,
        provider
      );
      
      // Get data about NFT owner
      const owner = await nftContract.ownerOf(tokenId);
      console.log("👤 NFT owner:", owner);
      
      // Check if NFT was sold through auction
      const nftHasBeenSold = await nftContract.hasBeenSold(tokenId);
      console.log("📊 NFT has been sold:", nftHasBeenSold);
      setHasBeenSold(nftHasBeenSold);
      
      // Get auction data directly from contract
      try {
        console.log("🔍 Requesting auction data directly from contract");
        const auctionInfo = await marketContract.getAuction(tokenId);
        
        const artist = auctionInfo[0];
        const startPrice = ethers.formatEther(auctionInfo[1]);
        const currentBid = ethers.formatEther(auctionInfo[2]);
        const highestBidder = auctionInfo[3];
        const endTime = Number(auctionInfo[4]) * 1000; // in milliseconds
        const isActive = auctionInfo[5];
        
        console.log("📊 Direct auction data from contract:", {
          artist, 
          startPrice, 
          currentBid, 
          highestBidder, 
          endTime, 
          isActive,
          currentTime: Date.now()
        });
        
        // Get remaining time from contract
        let remainingTime;
        let isTimeExpired = false;
        
        try {
          remainingTime = await marketContract.getRemainingTime(tokenId);
          isTimeExpired = remainingTime.toString() === "0";
          console.log("⏱️ Contract remaining time:", remainingTime.toString());
          console.log("⏱️ Is time expired:", isTimeExpired);
        } catch (timeError) {
          console.error("⏱️ Error getting remaining time:", timeError);
          remainingTime = ethers.getBigInt(0);
          isTimeExpired = true;
        }
        
        // Determine timeLeft state
        const now = Date.now();
        const timeLeft = endTime > now ? 
          `${Math.floor((endTime - now) / (1000 * 60 * 60))}h ${Math.floor(((endTime - now) % (1000 * 60 * 60)) / (1000 * 60))}m ${Math.floor(((endTime - now) % (1000 * 60)) / 1000)}s` : 
          'Auction ended';
        
        // Form object with auction data
        const auctionDetails = {
          isActive,
          startPrice,
          currentBid,
          highestBidder,
          endTime,
          artist,
          isTimeExpired
        };
        
        console.log("✅ Setting auction details:", auctionDetails);
        setAuctionDetails(auctionDetails);
        setTimeLeft(timeLeft);
        setIsAuctionTimeExpired(isTimeExpired);
        
        // If there's a user address, check their role
        if (address) {
          // Check if current user is auction creator
          const isCreator = artist.toLowerCase() === address.toLowerCase();
          console.log("👤 Is user the auction creator?", isCreator);
          setIsAuctionCreator(isCreator);
          
          // Check if user is NFT owner
          const isNftOwner = address.toLowerCase() === owner.toLowerCase();
          console.log("👤 Is user the NFT owner?", isNftOwner);
          setIsOwner(isNftOwner);
        }
        
        // If NFT was sold, get information about auction result
        if (nftHasBeenSold || (!isActive && highestBidder !== "0x0000000000000000000000000000000000000000")) {
          const auctionResultData = {
            finalPrice: currentBid,
            winner: highestBidder !== "0x0000000000000000000000000000000000000000" ? highestBidder : owner,
            endedAt: endTime > 0 ? new Date(endTime).toISOString() : new Date().toISOString(),
            artist: artist !== "0x0000000000000000000000000000000000000000" ? artist : ""
          };
          
          console.log("📊 Setting auction result:", auctionResultData);
          setAuctionResult(auctionResultData);
        }
      } catch (auctionError) {
        console.log("❌ No auction found or error getting auction:", auctionError);
        // If auction not found, check if user is owner
        if (address) {
          const isNftOwner = address.toLowerCase() === owner.toLowerCase();
          setIsOwner(isNftOwner);
          setIsAuctionCreator(false);
        }
        
        // Reset auction data
        setAuctionDetails(null);
        setTimeLeft('');
        setIsAuctionTimeExpired(false);
      }
    } catch (error) {
      console.error('❌ Failed to refresh auction data:', error);
    } finally {
      // Remove update flag
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    // If there's an auction, check its time
    if (auctionDetails?.isActive) {
      console.log("🔄 Checking auction expiration due to active auction");
      checkAuctionTimeExpiration();
    }
  }, [auctionDetails?.isActive]);

  const checkAuctionTimeExpiration = async () => {
    try {
      const provider = new ethers.JsonRpcProvider(
        process.env.NEXT_PUBLIC_BASE_MAINNET_RPC_URL || 'https://mainnet.base.org'
      );
      
      const marketAddress = CONTRACTS.MAINNET.PrimarySaleMarket;
      const marketContract = new ethers.Contract(
        marketAddress, 
        ABIS.PrimarySaleMarket,
        provider
      );
      
      // Get remaining time from contract
      const remainingTime = await marketContract.getRemainingTime(tokenId);
      console.log("⏱️ Contract remaining time:", remainingTime.toString());
      
      const isExpired = remainingTime.toString() === "0";
      console.log("⏱️ Auction time expired:", isExpired);
      
      // If time expired, set appropriate states
      if (isExpired) {
        setTimeLeft('Auction ended');
        setIsAuctionTimeExpired(true);
      }
      
      return isExpired;
    } catch (error) {
      console.error("❌ Error checking auction time expiration:", error);
      return false;
    }
  };
  
  // Check status each time timeLeft changes
  useEffect(() => {
    if (timeLeft === 'Auction ended' && auctionDetails?.isActive) {
      // Check if auction has actually ended in blockchain
      console.log("🔄 Checking auction expiration due to time ended");
      checkAuctionTimeExpiration();
    }
  }, [timeLeft, auctionDetails]);
  
  // Check status when refresh button is pressed
  const handleRefresh = async () => {
    console.log("🔄 Manual refresh triggered");
    await refreshAuctionData();
  };

  // Function to get NFT metadata
  async function fetchNFTMetadata(tokenId: number): Promise<any> {
    try {
      const response = await fetch(`/api/metadata/${tokenId}`);
      if (!response.ok) {
        throw new Error(`Failed to fetch metadata for token ${tokenId}`);
      }
      return await response.json();
    } catch (error) {
      console.error(`❌ Error fetching metadata for token ${tokenId}:`, error);
      return null;
    }
  }

  // Function to get artist name from attributes
  function getArtistFromAttributes(attributes: any[] | undefined): string | null {
    if (!attributes || !Array.isArray(attributes)) return null;
    
    const artistAttr = attributes.find(attr => 
      attr.trait_type?.toLowerCase() === 'artist'
    );
    
    return artistAttr ? artistAttr.value : null;
  }
  
  // Update checkAuction function to use our hook
  async function checkAuction(tokenId: number, provider: ethers.Provider): Promise<{hasAuction: boolean, auctionDetails?: any}> {
    try {
      const result = await checkAuctionStatus(tokenId, provider);
      console.log("📊 checkAuction result:", result);
      return result;
    } catch (error) {
      console.error(`❌ Error checking auction for token ${tokenId}:`, error);
      return { hasAuction: false };
    }
  }

  useEffect(() => {
    async function loadNFTDetails() {
      try {
        setIsLoading(true);
        console.log("🔄 Loading NFT details for token", tokenId);
        
        // Connect to provider
        const provider = new ethers.JsonRpcProvider(
          process.env.NEXT_PUBLIC_BASE_MAINNET_RPC_URL || 'https://mainnet.base.org'
        );
        
        // Create contract instance NFT
        const contractAddress = CONTRACTS.MAINNET.DeWildClub;
        const contract = new ethers.Contract(
          contractAddress,
          ABIS.DeWildClub,
          provider
        );
        
        // Create marketplace contract instance
        const marketAddress = CONTRACTS.MAINNET.PrimarySaleMarket;
        const marketContract = new ethers.Contract(
          marketAddress, 
          ABIS.PrimarySaleMarket,
          provider
        );
        
        // Check if NFT was sold through auction
        const nftHasBeenSold = await contract.hasBeenSold(tokenId);
        console.log("📊 NFT has been sold:", nftHasBeenSold);
        setHasBeenSold(nftHasBeenSold);
        
        // Check if token exists
        try {
          const owner = await contract.ownerOf(tokenId);
          console.log("👤 NFT owner:", owner);
          
          // Get metadata
          const metadata = await fetchNFTMetadata(tokenId);
          
          if (!metadata) {
            console.log("❌ No metadata found for token", tokenId);
            setIsLoading(false);
            return;
          }
          
          // Format image URL
          let imageUrl = metadata.image;
          if (imageUrl && (imageUrl.startsWith('ipfs://') || (typeof imageUrl === 'string' && !imageUrl.startsWith('http')))) {
            // Assume it's an IPFS hash
            const ipfsHash = imageUrl.replace('ipfs://', '');
            imageUrl = getPinataUrl(ipfsHash);
          }
          
          // Get artist information
          let artistAddress;
          try {
            artistAddress = await contract.tokenArtists(tokenId);
          } catch (e) {
            console.warn("⚠️ Failed to get artist address:", e);
            artistAddress = "0x0000000000000000000000000000000000000000";
          }
          
          // Format object with NFT data
          const artistName = getArtistFromAttributes(metadata.attributes) || metadata.artist || "DeWild Artist";
          
          const nftData: NFTDetails = {
            tokenId,
            name: metadata.name || `DeWild #${tokenId}`,
            image: imageUrl,
            description: metadata.description || "DeWild NFT Collection",
            artist: artistName,
            artistAddress,
            attributes: metadata.attributes || [],
            owner
          };
          
          console.log("📊 Setting NFT details:", nftData);
          setNftDetails(nftData);
          
          // DIRECT AUCTION DATA RETRIEVAL FROM CONTRACT
          try {
            console.log("🔍 Requesting auction data directly from contract for token:", tokenId);
            
            let auctionInfo;
            try {
              // Get auction data directly from contract
              auctionInfo = await marketContract.getAuction(tokenId);
            } catch (error) {
              console.log("❌ No auction found:", error);
              // If auction not found, check if user is owner
              if (address) {
                const isNftOwner = address.toLowerCase() === owner.toLowerCase();
                setIsOwner(isNftOwner);
                setIsAuctionCreator(false);
              }
              setAuctionDetails(null);
              setIsLoading(false);
              return;
            }
            
            const artist = auctionInfo[0];
            const startPrice = ethers.formatEther(auctionInfo[1]);
            const currentBid = ethers.formatEther(auctionInfo[2]);
            const highestBidder = auctionInfo[3];
            const endTime = Number(auctionInfo[4]) * 1000; // in milliseconds
            const isActive = auctionInfo[5];
            
            console.log("📊 Direct auction data from contract:", {
              artist, 
              startPrice, 
              currentBid, 
              highestBidder, 
              endTime, 
              isActive,
              currentTime: Date.now()
            });
            
            // Get remaining time from contract
            let remainingTime;
            let isTimeExpired = false;
            
            try {
              remainingTime = await marketContract.getRemainingTime(tokenId);
              isTimeExpired = remainingTime.toString() === "0";
              console.log("⏱️ Contract remaining time:", remainingTime.toString());
              console.log("⏱️ Is time expired:", isTimeExpired);
            } catch (timeError) {
              console.error("⏱️ Error getting remaining time:", timeError);
              remainingTime = ethers.getBigInt(0);
              isTimeExpired = true;
            }
            
            // Determine timeLeft state
            const now = Date.now();
            const timeLeft = endTime > now ? 
              `${Math.floor((endTime - now) / (1000 * 60 * 60))}h ${Math.floor(((endTime - now) % (1000 * 60 * 60)) / (1000 * 60))}m ${Math.floor(((endTime - now) % (1000 * 60)) / 1000)}s` : 
              'Auction ended';
            
            // Form object with auction data
            const auctionDetails = {
              isActive,
              startPrice,
              currentBid,
              highestBidder,
              endTime,
              artist,
              isTimeExpired
            };
            
            console.log("✅ Setting auction details:", auctionDetails);
            setAuctionDetails(auctionDetails);
            setTimeLeft(timeLeft);
            setIsAuctionTimeExpired(isTimeExpired);
            
            // If there's a user address, check their role
            if (address) {
              // Check if current user is auction creator
              const isCreator = artist.toLowerCase() === address.toLowerCase();
              console.log("👤 Is user the auction creator?", isCreator);
              setIsAuctionCreator(isCreator);
              
              // Check if user is NFT owner
              const isNftOwner = address.toLowerCase() === owner.toLowerCase();
              console.log("👤 Is user the NFT owner?", isNftOwner);
              setIsOwner(isNftOwner);
            }
            
            // If NFT was sold, get information about auction result
            if (nftHasBeenSold || (!isActive && highestBidder !== "0x0000000000000000000000000000000000000000")) {
              // Form data about auction result
              const auctionResultData = {
                finalPrice: currentBid,
                winner: highestBidder !== "0x0000000000000000000000000000000000000000" ? highestBidder : owner,
                endedAt: endTime > 0 ? new Date(endTime).toISOString() : new Date().toISOString(),
                artist: artist !== "0x0000000000000000000000000000000000000000" ? artist : artistName
              };
              
              console.log("📊 Setting auction result:", auctionResultData);
              setAuctionResult(auctionResultData);
            }
          } catch (contractError) {
            console.error("❌ Error interacting with market contract:", contractError);
            
            // Even with error, determine if user is NFT owner
            if (address) {
              const isNftOwner = address.toLowerCase() === owner.toLowerCase();
              console.log("👤 Is user the NFT owner?", isNftOwner);
              setIsOwner(isNftOwner);
            }
          }
        } catch (error) {
          console.error("❌ Error checking token existence:", error);
          // Token doesn't exist or other error
        }
        
        setIsLoading(false);
      } catch (error: any) {
        console.error('❌ Failed to load NFT details:', error);
        setIsLoading(false);
      }
    }
    
    if (tokenId) {
      loadNFTDetails();
    }
  }, [tokenId, address]);

  // Update time until end of auction
  useEffect(() => {
    if (!auctionDetails?.isActive) return;
    
    console.log("⏱️ Setting up auction timer");
    const interval = setInterval(() => {
      const now = Date.now();
      const timeRemaining = auctionDetails.endTime - now;
      
      if (timeRemaining <= 0) {
        console.log("⏱️ Auction time ended in timer");
        setTimeLeft('Auction ended');
        
        // REMOVE automatic auction completion
        // Just update UI to show completion button
        setIsAuctionTimeExpired(true);
        
        // Stop timer
        clearInterval(interval);
        return;
      }
      
      const hours = Math.floor(timeRemaining / (1000 * 60 * 60));
      const minutes = Math.floor((timeRemaining % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((timeRemaining % (1000 * 60)) / 1000);
      
      setTimeLeft(`${hours}h ${minutes}m ${seconds}s`);
    }, 1000);
    
    return () => clearInterval(interval);
  }, [auctionDetails, tokenId]);

  // Effect for automatic auction creation after approval confirmation
  useEffect(() => {
    // If approval confirmed, automatically create auction
    if (isApprovalConfirmed && nftDetails && !isCreatingAuctionAfterApproval) {
      const runCreateAuction = async () => {
        try {
          setIsCreatingAuctionAfterApproval(true); // Set flag that process has already started
          
          // Add delay before creating auction
          console.log('✅ Approval confirmed, waiting 3 seconds before creating auction...');
          await new Promise(resolve => setTimeout(resolve, 3000)); // 3 seconds delay
          
          console.log('🔄 Now creating auction after delay');
          await createAuctionAfterApproval(nftDetails.tokenId);
        } catch (error) {
          console.error('❌ Failed to create auction after approval:', error);
          setIsCreatingAuctionAfterApproval(false); // Reset flag in case of error
        }
      };
      
      runCreateAuction();
    }
  }, [isApprovalConfirmed, nftDetails, createAuctionAfterApproval, isCreatingAuctionAfterApproval]);

  // Effect to update page after transaction confirmation
  useEffect(() => {
    if (isConfirmed) {
      // Update whole page 1 second after transaction confirmation
      console.log("✅ Transaction confirmed, reloading page in 1 second");
      const timer = setTimeout(() => {
        // Use complete page reload instead of router.refresh()
        window.location.reload();
      }, 1000);
      
      return () => clearTimeout(timer);
    }
  }, [isConfirmed]);

  useEffect(() => {
    // Check only if there's both an auction and user address
    if (auctionDetails?.artist && address) {
      console.log("👤 Checking auction creator status:", {
        artistAddress: auctionDetails.artist.toLowerCase(),
        userAddress: address.toLowerCase(),
      });
      
      // Explicitly convert addresses to lowercase and compare
      const isCreator = auctionDetails.artist.toLowerCase() === address.toLowerCase();
      
      console.log("👤 Is user the auction creator?", isCreator);
      setIsAuctionCreator(isCreator);
    }
  }, [auctionDetails, address]);

  // Determine if user is leading auction participant
  const isHighestBidder: boolean | undefined = address && auctionDetails?.highestBidder ? 
    address.toLowerCase() === auctionDetails.highestBidder.toLowerCase() : 
    false;

  if (isLoading) {
    return (
      <div className="bg-white min-h-screen">
        <Header />
        <div className="container mx-auto px-4 pt-24">
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-[#202020]"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!nftDetails) {
    return (
      <div className="bg-white min-h-screen">
        <Header />
        <div className="container mx-auto px-4 pt-24">
          <div className="text-center py-12">
            <h1 className="text-3xl font-extrabold uppercase mb-4">NFT NOT FOUND</h1>
            <p className="text-xl text-[#a8a8a8] mb-8">The NFT you're looking for doesn't exist or has been removed.</p>
            <Link href="/collection">
              <Button variant="primary" size="lg" className="font-extrabold uppercase">
                BACK TO COLLECTION
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // For debugging: output state before rendering
  console.log("🔄 Render state:", {
    hasBeenSold,
    isActive: auctionDetails?.isActive,
    endTime: auctionDetails?.endTime,
    isOwner,
    address,
    artist: auctionDetails?.artist,
    isAuctionCreator,
    tokenId
  });

  return (
    <div className="bg-white min-h-screen pb-16">
      <Header />
      
      <div className="w-full px-4 sm:px-6 pt-24">
        <div className="mb-6">
          <Link href="/collection" className="text-[#a0a0a0] hover:text-black font-extrabold uppercase flex items-center">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="mr-2">
              <path d="M19 12H5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M12 19L5 12L12 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            BACK TO COLLECTION
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 w-full">
          {/* Left column - NFT image */}
          <div className="overflow-hidden">
            <img 
              src={nftDetails.image} 
              alt={nftDetails.name}
              className="w-full h-auto rounded-xl" 
            />
          </div>

          {/* Right column - NFT and auction information */}
          <div>
            <h1 className="text-6xl font-extrabold uppercase">
              {nftDetails.name}
            </h1>
            <p className="text-xl text-[#a9a9a9] font-extrabold uppercase mb-4">
              CREATED BY <a 
                href={`https://x.com/${nftDetails.artist}`} 
                target="_blank" 
                rel="noopener noreferrer"
                className="hover:underline text-blue-600"
              >
                @{nftDetails.artist}
              </a>
            </p>
            
            {nftDetails.description && (
              <div className="mb-4 p-6 bg-gray-100 rounded-lg">
                <p className="text-black text-xl font-extrabold uppercase">{nftDetails.description}</p>
              </div>
            )}
            
            {/* Auction block - using components */}
            {hasBeenSold || (!auctionDetails?.isActive && auctionDetails?.highestBidder && auctionDetails.highestBidder !== "0x0000000000000000000000000000000000000000") ? (
              <AuctionCompletedBlock 
                nftDetails={nftDetails}
                hasBeenSold={hasBeenSold}
                auctionResult={auctionResult || {
                  finalPrice: auctionDetails?.currentBid || '0',
                  winner: auctionDetails?.highestBidder || nftDetails.owner,
                  endedAt: auctionDetails?.endTime ? new Date(auctionDetails.endTime).toISOString() : new Date().toISOString(),
                  artist: auctionDetails?.artist || nftDetails.artistAddress
                }}
              />
            ) : isOwner || isAuctionCreator ? (
              <AuctionOwnerBlock
                nftDetails={nftDetails}
                txStatus={txStatus}
                txError={txError}
                isApprovalConfirmed={isApprovalConfirmed}
                isApprovalConfirming={isApprovalConfirming}
                isConfirming={isConfirming}
                isConfirmed={isConfirmed}
                createAuction={createAuction}
                cancelAuction={cancelAuction}
                endAuction={endAuction}
                auctionDetails={auctionDetails}
                timeLeft={timeLeft}
                isAuctionTimeExpired={isAuctionTimeExpired}
                isEndingAuction={isEndingAuction}
                setIsEndingAuction={setIsEndingAuction}
                refreshAuctionData={refreshAuctionData}
                isRefreshing={isRefreshing}
              />
            ) : auctionDetails?.isActive ? (
              <AuctionBidderBlock
                nftDetails={nftDetails}
                txStatus={txStatus}
                txError={txError}
                isConfirming={isConfirming}
                isConfirmed={isConfirmed}
                placeBid={placeBid}
                auctionDetails={auctionDetails}
                timeLeft={timeLeft}
                refreshAuctionData={refreshAuctionData}
                isRefreshing={isRefreshing}
              />
            ) : (
              <AuctionCompletedBlock 
                nftDetails={nftDetails}
                hasBeenSold={false}
                auctionResult={undefined}
              />
            )}
            
            {/* Link to view contract */}
            <div className="mt-4">
              <h3 className="text-2xl font-extrabold uppercase mb-2">TOKEN INFO:</h3>
              <div className="bg-gray-100 p-6 rounded-lg">
                <div className="flex flex-col space-y-1">
                  <div className="flex flex-raw gap-1">
                    <span className="text-[#a9a9a9] font-extrabold uppercase mb-1">TOKEN ID:</span>
                    <span className="font-extrabold">{nftDetails.tokenId}</span>
                  </div>
                  
                  <div className="flex flex-raw gap-1">
                    <span className="text-[#a9a9a9] font-extrabold uppercase mb-1">CONTRACT ADDRESS:</span>
                    <a 
                      href={`https://basescan.org/token/${CONTRACTS.MAINNET.DeWildClub}`} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline font-extrabold"
                    >
                      {formatAddress(CONTRACTS.MAINNET.DeWildClub)}
                    </a>
                  </div>
                  
                  {!auctionDetails?.isActive && (
                    <div className="flex flex-raw gap-1">
                      <span className="text-[#a9a9a9] font-extrabold uppercase mb-1">OWNED BY:</span>
                      <span className="font-extrabold text-black">{formatAddress(nftDetails.owner)}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* NFT attributes */}
            <div className="mt-4">
              <h2 className="text-2xl font-extrabold uppercase mb-2">
                ATTRIBUTES
              </h2>
              <div className="grid grid-cols-2 gap-4">
                {nftDetails.attributes.map((attr, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-3">
                    <p className="text-[#a9a9a9] font-extrabold uppercase">{attr.trait_type}</p>
                    <p className="font-extrabold uppercase">{attr.value}</p>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}