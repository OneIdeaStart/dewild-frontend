// src/hooks/useAuction.ts
import { useState } from 'react';
import { ethers } from 'ethers';
import { useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { CONTRACTS, ABIS } from '@/lib/web3/contracts';
import { parseEther } from 'viem';
import { useAppKitAccount } from '@reown/appkit/react';

// Константы для конфигурации таймаутов и повторных попыток
const TRANSACTION_TIMEOUT = 60000; // 60 секунд
const MAX_RETRIES = 3;
const RETRY_DELAY = 3000; // 3 секунды между повторными попытками

export function useAuction() {
  const { address } = useAppKitAccount();
  const [txStatus, setTxStatus] = useState<'idle' | 'loading' | 'approving' | 'creating' | 'success' | 'error'>('idle');
  const [txError, setTxError] = useState<string>('');
  const [txHash, setTxHash] = useState<string>('');
  const [approvalTxHash, setApprovalTxHash] = useState<string>('');
  const [isTransactionInProgress, setIsTransactionInProgress] = useState<boolean>(false);
  
  // Используем хуки Wagmi
  const { writeContractAsync } = useWriteContract();
  
  // Отслеживаем статус транзакции создания аукциона
  const { isLoading: isConfirming, isSuccess: isConfirmed, isError: isFailedTx } = 
    useWaitForTransactionReceipt({ hash: txHash as `0x${string}` || undefined });
  
  // Отслеживаем статус транзакции одобрения
  const { isLoading: isApprovalConfirming, isSuccess: isApprovalConfirmed } = 
    useWaitForTransactionReceipt({ hash: approvalTxHash as `0x${string}` || undefined });
  
  // Получаем адреса контрактов для текущей сети
  const contractAddresses = CONTRACTS.MAINNET; // Для продакшна можно добавить переключение в зависимости от сети
  
  /**
   * Функция для создания транзакции с таймаутом и повторными попытками
   * @param executeTx Функция для выполнения транзакции
   * @param errorMessage Сообщение об ошибке
   * @returns Результат транзакции
   */
  const executeWithRetry = async (executeTx: () => Promise<any>, errorMessage: string) => {
    let retryCount = 0;
    
    const attemptTransaction = async (): Promise<any> => {
      try {
        // Устанавливаем таймаут
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error("Transaction timeout")), TRANSACTION_TIMEOUT)
        );
        
        // Оригинальный запрос транзакции
        const txPromise = executeTx();
        
        // Выполняем с таймаутом
        return await Promise.race([txPromise, timeoutPromise]);
      } catch (error: any) {
        // Проверяем, является ли ошибка таймаутом или связана с сетью
        const isTimeoutOrNetworkError = 
          error.message.includes("timeout") || 
          error.message.includes("network") || 
          error.message.includes("execution reverted");
          
        if (isTimeoutOrNetworkError && retryCount < MAX_RETRIES) {
          retryCount++;
          console.log(`Retry attempt ${retryCount} after ${RETRY_DELAY/1000}s delay`);
          
          // Ждем перед повторной попыткой
          await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
          
          // Рекурсивная повторная попытка
          return attemptTransaction();
        }
        
        // Если все повторные попытки исчерпаны или это не ошибка таймаута
        console.error('Transaction failed after retries:', error);
        
        // Форматируем сообщение об ошибке для пользователя
        let userErrorMessage = errorMessage;
        if (error.message.includes("User rejected")) {
          userErrorMessage = 'Transaction rejected by user';
        } else if (error.message.includes("Insufficient funds")) {
          userErrorMessage = 'Insufficient funds for transaction';
        } else if (error.message.includes("timeout")) {
          userErrorMessage = 'Transaction timed out. Network may be congested.';
        }
        
        throw new Error(userErrorMessage);
      }
    };
    
    return attemptTransaction();
  };

  /**
   * Создает аукцион для NFT с предварительным одобрением
   * @param tokenId ID токена
   * @returns Результат операции
   */
  const createAuction = async (tokenId: number) => {
    if (!address) {
      throw new Error('Please connect your wallet first');
    }
    
    // Проверяем, не выполняется ли уже транзакция
    if (isTransactionInProgress) {
      console.log('Transaction already in progress');
      return { success: false, error: 'Transaction already in progress' };
    }
  
    setTxStatus('approving');
    setTxError('');
    setTxHash('');
    setApprovalTxHash('');
    setIsTransactionInProgress(true);
  
    try {
      // Получаем адреса контрактов
      const nftContractAddress = contractAddresses.DeWildClub as `0x${string}`;
      const marketAddress = contractAddresses.PrimarySaleMarket as `0x${string}`;
      
      // Создаем провайдер и контракт для проверки апрува
      const provider = new ethers.JsonRpcProvider(
        process.env.NEXT_PUBLIC_BASE_MAINNET_RPC_URL || 'https://mainnet.base.org'
      );
      
      const nftContract = new ethers.Contract(
        nftContractAddress,
        ABIS.DeWildClub,
        provider
      );
      
      // Проверяем, есть ли уже апрув
      const isApproved = await nftContract.isApprovedForAll(address, marketAddress);
      
      if (!isApproved) {
        // Если нет апрува, выполняем транзакцию setApprovalForAll
        console.log('Approval needed. Approving NFT for marketplace...');
        
        const approveTxHash = await executeWithRetry(
          async () => {
            return writeContractAsync({
              abi: ABIS.DeWildClub,
              address: nftContractAddress,
              functionName: 'setApprovalForAll',
              args: [marketAddress, true],
              gas: BigInt(300000) // Увеличенный газовый лимит для предотвращения таймаутов
            });
          },
          'Failed to approve NFT'
        );
        
        console.log('Approval transaction submitted:', approveTxHash);
        setApprovalTxHash(approveTxHash);
        
        // Автоматическое создание аукциона произойдет через эффект, 
        // следящий за isApprovalConfirmed
        
        return {
          success: true,
          approvalHash: approveTxHash
        };
      } else {
        // Если уже есть апрув, создаем аукцион напрямую
        console.log('Approval already exists, creating auction directly');
        return await createAuctionAfterApproval(tokenId);
      }
    } catch (error: any) {
      console.error('Failed to process auction creation:', error);
      setTxStatus('error');
      
      // Улучшенное сообщение об ошибке
      let errorMessage = error.message || 'Failed to create auction';
      if (errorMessage.includes('User rejected')) {
        errorMessage = 'Transaction rejected by user';
      } else if (errorMessage.includes('Insufficient funds')) {
        errorMessage = 'Insufficient funds for transaction';
      } else if (errorMessage.includes('timeout')) {
        errorMessage = 'Transaction timed out. Please try again later.';
      }
      
      setTxError(errorMessage);
      setIsTransactionInProgress(false);
      
      return {
        success: false,
        error: errorMessage
      };
    }
  };  
  
  /**
   * Создает аукцион после успешного одобрения токена
   * @param tokenId ID токена
   * @returns Результат операции
   */
  const createAuctionAfterApproval = async (tokenId: number) => {
    // Проверяем, не выполняется ли уже транзакция создания аукциона
    if (txStatus === 'creating') {
      console.log('Auction creation already in progress');
      return { success: false, error: 'Auction creation already in progress' };
    }
    if (!address) {
      throw new Error('Please connect your wallet first');
    }

    setTxStatus('creating');
    setTxError('');
    setTxHash('');

    try {
      // Фиксированная стартовая цена (0.011 ETH)
      const startPrice = parseEther('0.011');
      
      // Получаем адрес контракта
      const marketAddress = contractAddresses.PrimarySaleMarket as `0x${string}`;
      
      console.log(`Creating auction for token ${tokenId} with starting price: ${parseFloat(startPrice.toString()) / 1e18} ETH`);
      
      const createTxHash = await executeWithRetry(
        async () => {
          return writeContractAsync({
            abi: ABIS.PrimarySaleMarket,
            address: marketAddress,
            functionName: 'createAuction',
            args: [tokenId, startPrice],
            gas: BigInt(400000) // Увеличенный газовый лимит
          });
        }, 
        'Failed to create auction'
      );
      
      console.log('Auction transaction submitted:', createTxHash);
      setTxHash(createTxHash);
      setTxStatus('success');
      
      return {
        success: true,
        hash: createTxHash
      };
    } catch (error: any) {
      console.error('Failed to create auction:', error);
      setTxStatus('error');
      
      // Более дружественное сообщение об ошибке
      let errorMessage = error.message || 'Failed to create auction';
      if (errorMessage.includes('User rejected')) {
        errorMessage = 'Transaction rejected by user';
      } else if (errorMessage.includes('Insufficient funds')) {
        errorMessage = 'Insufficient funds for transaction';
      } else if (errorMessage.includes('timeout')) {
        errorMessage = 'Transaction timed out. Please try again later.';
      }
      
      setTxError(errorMessage);
      setIsTransactionInProgress(false);
      
      return {
        success: false,
        error: errorMessage
      };
    }
  };
  
  /**
   * Отменяет аукцион для NFT
   * @param tokenId ID токена
   * @returns Результат операции
   */
  const cancelAuction = async (tokenId: number) => {
    if (!address) {
      throw new Error('Please connect your wallet first');
    }
    
    // Проверяем, не выполняется ли уже транзакция
    if (isTransactionInProgress) {
      console.log('Transaction already in progress');
      return { success: false, error: 'Transaction already in progress' };
    }

    setTxStatus('loading');
    setTxError('');
    setTxHash('');
    setIsTransactionInProgress(true);

    try {
      // Получаем адрес контракта
      const marketAddress = contractAddresses.PrimarySaleMarket as `0x${string}`;
      
      console.log(`Cancelling auction for token ${tokenId}`);
      
      const txHash = await executeWithRetry(
        async () => {
          return writeContractAsync({
            abi: ABIS.PrimarySaleMarket,
            address: marketAddress,
            functionName: 'cancelAuction',
            args: [tokenId],
            gas: BigInt(300000) // Увеличенный лимит газа
          });
        },
        'Failed to cancel auction'
      );
      
      console.log('Transaction hash:', txHash);
      setTxHash(txHash);
      setTxStatus('success');
      
      return {
        success: true,
        hash: txHash
      };
    } catch (error: any) {
      console.error('Failed to cancel auction:', error);
      setTxStatus('error');
      
      // Более дружественное сообщение об ошибке
      let errorMessage = error.message || 'Failed to cancel auction';
      if (errorMessage.includes('user rejected')) {
        errorMessage = 'Transaction rejected by user';
      }
      
      setTxError(errorMessage);
      setIsTransactionInProgress(false);
      
      return {
        success: false,
        error: errorMessage
      };
    }
  };
  
  /**
   * Размещает ставку на аукционе
   * @param tokenId ID токена
   * @param bidAmount Сумма ставки в ETH
   * @returns Результат операции
   */
  const placeBid = async (tokenId: number, bidAmount: string) => {
    if (!address) {
      throw new Error('Please connect your wallet first');
    }
    
    // Проверяем, не выполняется ли уже транзакция
    if (isTransactionInProgress) {
      console.log('Transaction already in progress');
      return { success: false, error: 'Transaction already in progress' };
    }

    setTxStatus('loading');
    setTxError('');
    setTxHash('');
    setIsTransactionInProgress(true);

    try {
      // Преобразуем сумму ставки в wei
      const bidAmountWei = parseEther(bidAmount);
      
      // Получаем адрес контракта
      const marketAddress = contractAddresses.PrimarySaleMarket as `0x${string}`;
      
      console.log(`Placing bid for token ${tokenId}: ${bidAmount} ETH`);
      
      const txHash = await executeWithRetry(
        async () => {
          return writeContractAsync({
            abi: ABIS.PrimarySaleMarket,
            address: marketAddress,
            functionName: 'placeBid',
            args: [tokenId],
            value: bidAmountWei,
            gas: BigInt(400000) // Увеличенный лимит газа
          });
        },
        'Failed to place bid'
      );
      
      console.log('Transaction hash:', txHash);
      setTxHash(txHash);
      setTxStatus('success');
      
      return {
        success: true,
        hash: txHash
      };
    } catch (error: any) {
      console.error('Failed to place bid:', error); // Полная ошибка в консоли для отладки
      setTxStatus('error');
      
      // Упрощенные пользовательские сообщения об ошибках
      let errorMessage = 'Failed to place bid';
      
      if (error.message?.includes('User rejected')) {
        errorMessage = 'Transaction rejected';
      } else if (error.message?.includes('Insufficient funds')) {
        errorMessage = 'Insufficient funds for bid';
      } else if (error.message?.includes('Bid too low')) {
        errorMessage = 'Bid is too low';
      } else if (error.message?.includes('timeout')) {
        errorMessage = 'Transaction timed out. Please try again.';
      }
      
      setTxError(errorMessage);
      setIsTransactionInProgress(false);
      
      return {
        success: false,
        error: errorMessage
      };
    } finally {
      setTimeout(() => {
        setIsTransactionInProgress(false);
      }, 5000); // Даем 5 секунд чтобы состояние обновилось до того, как разрешим новые транзакции
    }
  };
  
  /**
   * Проверяет наличие активного аукциона для NFT
   * @param tokenId ID токена
   * @param provider Провайдер Ethereum
   * @returns Информация об аукционе
   */
  const checkAuction = async (tokenId: number, provider: ethers.Provider): Promise<{
    hasAuction: boolean, 
    auctionDetails?: any
  }> => {
    try {
      // Создаем контракт для взаимодействия с аукционом
      const marketAddress = contractAddresses.PrimarySaleMarket;
      const marketContract = new ethers.Contract(
        marketAddress, 
        ABIS.PrimarySaleMarket,
        provider
      );
      
      // Пытаемся получить информацию об аукционе
      try {
        const auctionInfo = await marketContract.getAuction(tokenId);
        
        // Структура auctionInfo содержит:
        // [0]: artist (address)
        // [1]: startPrice (bigint)
        // [2]: currentBid (bigint)
        // [3]: highestBidder (address)
        // [4]: endTime (bigint) - timestamp в секундах
        // [5]: isActive (bool)
        
        const artist = auctionInfo[0];
        const startPrice = ethers.formatEther(auctionInfo[1]);
        const currentBid = ethers.formatEther(auctionInfo[2]);
        const highestBidder = auctionInfo[3];
        const endTime = Number(auctionInfo[4]) * 1000; // Преобразуем в миллисекунды
        const isActive = auctionInfo[5];
        
        console.log("Auction data for debugging:", {
          artist,
          startPrice,
          currentBid,
          highestBidder,
          endTime,
          isActive,
          currentTime: Date.now()
        });
        
        // ИЗМЕНЕНО: Проверяем только флаг isActive из контракта
        // Если аукцион неактивен по данным контракта - считаем аукцион неактивным
        if (!isActive) {
          return { hasAuction: false };
        }
        
        // Получаем оставшееся время из контракта
        const remainingTime = await marketContract.getRemainingTime(tokenId);
        const isTimeExpired = remainingTime.eq(0);
        
        // Определяем состояние timeLeft
        const now = Date.now();
        const timeLeft = endTime > now ? 
          `${Math.floor((endTime - now) / (1000 * 60 * 60))}h ${Math.floor(((endTime - now) % (1000 * 60 * 60)) / (1000 * 60))}m ${Math.floor(((endTime - now) % (1000 * 60)) / 1000)}s` : 
          'Auction ended';
        
        return { 
          hasAuction: true,
          auctionDetails: {
            isActive: true,
            startPrice,
            currentBid,
            highestBidder,
            endTime,
            artist,
            isTimeExpired, // Добавляем флаг истечения времени
            timeLeft       // Добавляем предрассчитанное timeLeft
          }
        };
      } catch (contractError) {
        console.log('No auction found or error accessing auction info:', contractError);
        return { hasAuction: false };
      }
    } catch (error) {
      console.error(`Error checking auction for token ${tokenId}:`, error);
      return { hasAuction: false };
    }
  };

  /**
   * Функция для завершения аукциона (если время истекло)
   * @param tokenId ID токена
   * @returns Результат операции
   */
  const endAuction = async (tokenId: number) => {
    if (!address) {
      throw new Error('Please connect your wallet first');
    }
    
    // Проверяем, не выполняется ли уже транзакция
    if (isTransactionInProgress) {
      console.log('Transaction already in progress');
      return { success: false, error: 'Transaction already in progress' };
    }

    setTxStatus('loading');
    setTxError('');
    setTxHash('');
    setIsTransactionInProgress(true);

    try {
      // Получаем адрес контракта
      const marketAddress = contractAddresses.PrimarySaleMarket as `0x${string}`;
      
      console.log(`Ending auction for token ${tokenId}`);
      
      const txHash = await executeWithRetry(
        async () => {
          return writeContractAsync({
            abi: ABIS.PrimarySaleMarket,
            address: marketAddress,
            functionName: 'endAuction',
            args: [tokenId],
            gas: BigInt(500000) // Увеличенный лимит газа для сложной операции завершения
          });
        },
        'Failed to end auction'
      );
      
      console.log('Transaction hash:', txHash);
      setTxHash(txHash);
      setTxStatus('success');
      
      return {
        success: true,
        hash: txHash
      };
    } catch (error: any) {
      console.error('Failed to end auction:', error);
      setTxStatus('error');
      
      // Более дружественное сообщение об ошибке
      let errorMessage = error.message || 'Failed to end auction';
      if (errorMessage.includes('User rejected')) {
        errorMessage = 'Transaction rejected by user';
      } else if (errorMessage.includes('timeout')) {
        errorMessage = 'Transaction timed out. Please try again.';
      }
      
      setTxError(errorMessage);
      setIsTransactionInProgress(false);
      
      return {
        success: false,
        error: errorMessage
      };
    } finally {
      setTimeout(() => {
        setIsTransactionInProgress(false);
      }, 5000); // Даем 5 секунд чтобы состояние обновилось
    }
  };

  // Сбросить состояние ошибки
  const resetError = () => {
    setTxError('');
    setTxStatus('idle');
  };

  return {
    createAuction,
    createAuctionAfterApproval,
    cancelAuction,
    placeBid,
    endAuction,
    checkAuction,
    resetError,
    txStatus,
    txError,
    txHash,
    approvalTxHash,
    isConfirming,
    isConfirmed,
    isApprovalConfirming,
    isApprovalConfirmed,
    isFailedTx,
    isTransactionInProgress
  };
}