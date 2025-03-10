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

// Типы для NFT и аукциона
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
  
  // Используем хук useAuction
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
  const [debug, setDebug] = useState(true); // Включаем отладку
  
  // Информация о результате аукциона для завершенных аукционов
  const [auctionResult, setAuctionResult] = useState<{
    finalPrice?: string;
    winner?: string;
    endedAt?: string;
    artist?: string;
  } | undefined>(undefined);

  // Функция для форматирования адреса кошелька
  const formatAddress = (address: string) => {
    if (!address) return '';
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
  };

  // Функция для обновления только данных аукциона
  const refreshAuctionData = async () => {
    if (!tokenId) return;
    
    // Устанавливаем флаг обновления
    setIsRefreshing(true);
    console.log("🔄 Refreshing auction data for token", tokenId);
    
    try {
      // Подключаемся к провайдеру
      const provider = new ethers.JsonRpcProvider(
        process.env.NEXT_PUBLIC_BASE_MAINNET_RPC_URL || 'https://mainnet.base.org'
      );
      
      // Создаем экземпляры контрактов
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
      
      // Получаем данные о владельце NFT
      const owner = await nftContract.ownerOf(tokenId);
      console.log("👤 NFT owner:", owner);
      
      // Проверяем, был ли NFT продан через аукцион
      const nftHasBeenSold = await nftContract.hasBeenSold(tokenId);
      console.log("📊 NFT has been sold:", nftHasBeenSold);
      setHasBeenSold(nftHasBeenSold);
      
      // Получаем данные аукциона напрямую из контракта
      try {
        console.log("🔍 Requesting auction data directly from contract");
        const auctionInfo = await marketContract.getAuction(tokenId);
        
        const artist = auctionInfo[0];
        const startPrice = ethers.formatEther(auctionInfo[1]);
        const currentBid = ethers.formatEther(auctionInfo[2]);
        const highestBidder = auctionInfo[3];
        const endTime = Number(auctionInfo[4]) * 1000; // в миллисекундах
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
        
        // Получаем оставшееся время из контракта
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
        
        // Определяем состояние timeLeft
        const now = Date.now();
        const timeLeft = endTime > now ? 
          `${Math.floor((endTime - now) / (1000 * 60 * 60))}h ${Math.floor(((endTime - now) % (1000 * 60 * 60)) / (1000 * 60))}m ${Math.floor(((endTime - now) % (1000 * 60)) / 1000)}s` : 
          'Auction ended';
        
        // Формируем объект с данными аукциона
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
        
        // Если есть адрес пользователя, проверяем его роль
        if (address) {
          // Проверяем, является ли текущий пользователь создателем аукциона
          const isCreator = artist.toLowerCase() === address.toLowerCase();
          console.log("👤 Is user the auction creator?", isCreator);
          setIsAuctionCreator(isCreator);
          
          // Проверяем, является ли пользователь владельцем NFT
          const isNftOwner = address.toLowerCase() === owner.toLowerCase();
          console.log("👤 Is user the NFT owner?", isNftOwner);
          setIsOwner(isNftOwner);
        }
        
        // Если NFT был продан, получаем информацию о результате аукциона
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
        // Если аукцион не найден, проверяем, является ли пользователь владельцем
        if (address) {
          const isNftOwner = address.toLowerCase() === owner.toLowerCase();
          setIsOwner(isNftOwner);
          setIsAuctionCreator(false);
        }
        
        // Сбрасываем данные аукциона
        setAuctionDetails(null);
        setTimeLeft('');
        setIsAuctionTimeExpired(false);
      }
    } catch (error) {
      console.error('❌ Failed to refresh auction data:', error);
    } finally {
      // Снимаем флаг обновления
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    // Если есть аукцион, проверяем его время
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
      
      // Получаем оставшееся время аукциона напрямую из контракта
      const remainingTime = await marketContract.getRemainingTime(tokenId);
      console.log("⏱️ Contract remaining time:", remainingTime.toString());
      
      const isExpired = remainingTime.toString() === "0";
      console.log("⏱️ Auction time expired:", isExpired);
      
      // Если время истекло, устанавливаем соответствующие состояния
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
  
  // Проверяем статус каждый раз при изменении timeLeft
  useEffect(() => {
    if (timeLeft === 'Auction ended' && auctionDetails?.isActive) {
      // Проверяем, действительно ли аукцион завершился в блокчейне
      console.log("🔄 Checking auction expiration due to time ended");
      checkAuctionTimeExpiration();
    }
  }, [timeLeft, auctionDetails]);
  
  // Проверяем статус при нажатии на кнопку обновления
  const handleRefresh = async () => {
    console.log("🔄 Manual refresh triggered");
    await refreshAuctionData();
  };

  // Функция для получения метаданных NFT
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

  // Функция для получения имени артиста из атрибутов
  function getArtistFromAttributes(attributes: any[] | undefined): string | null {
    if (!attributes || !Array.isArray(attributes)) return null;
    
    const artistAttr = attributes.find(attr => 
      attr.trait_type?.toLowerCase() === 'artist'
    );
    
    return artistAttr ? artistAttr.value : null;
  }
  
  // Обновляем функцию checkAuction, чтобы использовать наш хук
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
        
        // Подключаемся к провайдеру
        const provider = new ethers.JsonRpcProvider(
          process.env.NEXT_PUBLIC_BASE_MAINNET_RPC_URL || 'https://mainnet.base.org'
        );
        
        // Создаем экземпляр контракта NFT
        const contractAddress = CONTRACTS.MAINNET.DeWildClub;
        const contract = new ethers.Contract(
          contractAddress,
          ABIS.DeWildClub,
          provider
        );
        
        // Создаем экземпляр контракта маркетплейса
        const marketAddress = CONTRACTS.MAINNET.PrimarySaleMarket;
        const marketContract = new ethers.Contract(
          marketAddress, 
          ABIS.PrimarySaleMarket,
          provider
        );
        
        // Проверяем, был ли NFT продан через аукцион
        const nftHasBeenSold = await contract.hasBeenSold(tokenId);
        console.log("📊 NFT has been sold:", nftHasBeenSold);
        setHasBeenSold(nftHasBeenSold);
        
        // Проверяем существование токена
        try {
          const owner = await contract.ownerOf(tokenId);
          console.log("👤 NFT owner:", owner);
          
          // Получаем метаданные
          const metadata = await fetchNFTMetadata(tokenId);
          
          if (!metadata) {
            console.log("❌ No metadata found for token", tokenId);
            setIsLoading(false);
            return;
          }
          
          // Форматируем URL изображения
          let imageUrl = metadata.image;
          if (imageUrl && (imageUrl.startsWith('ipfs://') || (typeof imageUrl === 'string' && !imageUrl.startsWith('http')))) {
            // Предполагаем, что это IPFS хэш
            const ipfsHash = imageUrl.replace('ipfs://', '');
            imageUrl = getPinataUrl(ipfsHash);
          }
          
          // Получаем информацию о художнике
          let artistAddress;
          try {
            artistAddress = await contract.tokenArtists(tokenId);
          } catch (e) {
            console.warn("⚠️ Failed to get artist address:", e);
            artistAddress = "0x0000000000000000000000000000000000000000";
          }
          
          // Форматируем объект с данными NFT
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
          
          // ПРЯМОЕ ПОЛУЧЕНИЕ ДАННЫХ АУКЦИОНА ИЗ КОНТРАКТА
          try {
            console.log("🔍 Requesting auction data directly from contract for token:", tokenId);
            
            let auctionInfo;
            try {
              // Получаем данные аукциона напрямую из контракта
              auctionInfo = await marketContract.getAuction(tokenId);
            } catch (error) {
              console.log("❌ No auction found:", error);
              // Если аукцион не найден, проверяем, является ли пользователь владельцем
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
            const endTime = Number(auctionInfo[4]) * 1000; // в миллисекундах
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
            
            // Получаем оставшееся время из контракта
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
            
            // Определяем состояние timeLeft
            const now = Date.now();
            const timeLeft = endTime > now ? 
              `${Math.floor((endTime - now) / (1000 * 60 * 60))}h ${Math.floor(((endTime - now) % (1000 * 60 * 60)) / (1000 * 60))}m ${Math.floor(((endTime - now) % (1000 * 60)) / 1000)}s` : 
              'Auction ended';
            
            // Формируем объект с данными аукциона
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
            
            // Если есть адрес пользователя, проверяем его роль
            if (address) {
              // Проверяем, является ли текущий пользователь создателем аукциона
              const isCreator = artist.toLowerCase() === address.toLowerCase();
              console.log("👤 Is user the auction creator?", isCreator);
              setIsAuctionCreator(isCreator);
              
              // Проверяем, является ли пользователь владельцем NFT
              const isNftOwner = address.toLowerCase() === owner.toLowerCase();
              console.log("👤 Is user the NFT owner?", isNftOwner);
              setIsOwner(isNftOwner);
            }
            
            // Если NFT был продан, получаем информацию о результате аукциона
            if (nftHasBeenSold || (!isActive && highestBidder !== "0x0000000000000000000000000000000000000000")) {
              // Формируем данные о результате аукциона
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
            
            // Даже при ошибке определяем, является ли пользователь владельцем NFT
            if (address) {
              const isNftOwner = address.toLowerCase() === owner.toLowerCase();
              console.log("👤 Is user the NFT owner?", isNftOwner);
              setIsOwner(isNftOwner);
            }
          }
        } catch (error) {
          console.error("❌ Error checking token existence:", error);
          // Токен не существует или другая ошибка
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

  // Обновление времени до конца аукциона
  useEffect(() => {
    if (!auctionDetails?.isActive) return;
    
    console.log("⏱️ Setting up auction timer");
    const interval = setInterval(() => {
      const now = Date.now();
      const timeRemaining = auctionDetails.endTime - now;
      
      if (timeRemaining <= 0) {
        console.log("⏱️ Auction time ended in timer");
        setTimeLeft('Auction ended');
        
        // УДАЛЯЕМ автоматическое завершение аукциона
        // Просто обновляем UI для показа кнопки завершения
        setIsAuctionTimeExpired(true);
        
        // Останавливаем таймер
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

  // Эффект для автоматического создания аукциона после подтверждения одобрения
  useEffect(() => {
    // Если одобрение подтверждено, автоматически создаем аукцион
    if (isApprovalConfirmed && nftDetails && !isCreatingAuctionAfterApproval) {
      const runCreateAuction = async () => {
        try {
          setIsCreatingAuctionAfterApproval(true); // Устанавливаем флаг, что уже начали процесс
          
          // Добавляем задержку перед созданием аукциона
          console.log('✅ Approval confirmed, waiting 3 seconds before creating auction...');
          await new Promise(resolve => setTimeout(resolve, 3000)); // 3 секунды задержки
          
          console.log('🔄 Now creating auction after delay');
          await createAuctionAfterApproval(nftDetails.tokenId);
        } catch (error) {
          console.error('❌ Failed to create auction after approval:', error);
          setIsCreatingAuctionAfterApproval(false); // Сбрасываем флаг в случае ошибки
        }
      };
      
      runCreateAuction();
    }
  }, [isApprovalConfirmed, nftDetails, createAuctionAfterApproval, isCreatingAuctionAfterApproval]);

  // Эффект для обновления страницы после подтверждения транзакции
  useEffect(() => {
    if (isConfirmed) {
      // Обновляем всю страницу через 1 секунды после подтверждения транзакции
      console.log("✅ Transaction confirmed, reloading page in 1 second");
      const timer = setTimeout(() => {
        // Используем полную перезагрузку страницы вместо router.refresh()
        window.location.reload();
      }, 1000);
      
      return () => clearTimeout(timer);
    }
  }, [isConfirmed]);

  useEffect(() => {
    // Проверяем только если есть и аукцион, и адрес пользователя
    if (auctionDetails?.artist && address) {
      console.log("👤 Checking auction creator status:", {
        artistAddress: auctionDetails.artist.toLowerCase(),
        userAddress: address.toLowerCase(),
      });
      
      // Явно конвертируем адреса в нижний регистр и сравниваем
      const isCreator = auctionDetails.artist.toLowerCase() === address.toLowerCase();
      
      console.log("👤 Is user the auction creator?", isCreator);
      setIsAuctionCreator(isCreator);
    }
  }, [auctionDetails, address]);

  // Определяем, является ли пользователь лидирующим участником аукциона
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

  // Для отладки: вывод состояния перед отрисовкой
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
          {/* Левая колонка - изображение NFT */}
          <div className="overflow-hidden">
            <img 
              src={nftDetails.image} 
              alt={nftDetails.name}
              className="w-full h-auto rounded-xl" 
            />
          </div>

          {/* Правая колонка - информация об NFT и аукционе */}
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
            
            {/* Блок аукциона - используем компоненты */}
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
            
            {/* Ссылка на просмотр контракта */}
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

            {/* Атрибуты NFT */}
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