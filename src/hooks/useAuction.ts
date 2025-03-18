// src/hooks/useAuction.ts
import { useState } from 'react';
import { ethers } from 'ethers';
import { useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { CONTRACTS, ABIS } from '@/lib/web3/contracts';
import { parseEther } from 'viem';
import { useAppKitAccount } from '@reown/appkit/react';

// Constants for timeout configuration and retries
const TRANSACTION_TIMEOUT = 60000; // 60 seconds
const MAX_RETRIES = 3;
const RETRY_DELAY = 3000; // 3 seconds between retry attempts

export function useAuction() {
  const { address } = useAppKitAccount();
  const [txStatus, setTxStatus] = useState<'idle' | 'loading' | 'approving' | 'creating' | 'success' | 'error'>('idle');
  const [txError, setTxError] = useState<string>('');
  const [txHash, setTxHash] = useState<string>('');
  const [approvalTxHash, setApprovalTxHash] = useState<string>('');
  const [isTransactionInProgress, setIsTransactionInProgress] = useState<boolean>(false);
  
  // Use Wagmi hooks
  const { writeContractAsync } = useWriteContract();
  
  // Track auction creation transaction status
  const { isLoading: isConfirming, isSuccess: isConfirmed, isError: isFailedTx } = 
    useWaitForTransactionReceipt({ hash: txHash as `0x${string}` || undefined });
  
  // Track approval transaction status
  const { isLoading: isApprovalConfirming, isSuccess: isApprovalConfirmed } = 
    useWaitForTransactionReceipt({ hash: approvalTxHash as `0x${string}` || undefined });
  
  // Get contract addresses for current network
  const contractAddresses = CONTRACTS.MAINNET; // For production can add switching depending on network
  
  /**
   * Function for creating transaction with timeout and retries
   * @param executeTx Function to execute transaction
   * @param errorMessage Error message
   * @returns Transaction result
   */
  const executeWithRetry = async (executeTx: () => Promise<any>, errorMessage: string) => {
    let retryCount = 0;
    
    const attemptTransaction = async (): Promise<any> => {
      try {
        // Set timeout
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error("Transaction timeout")), TRANSACTION_TIMEOUT)
        );
        
        // Original transaction request
        const txPromise = executeTx();
        
        // Execute with timeout
        return await Promise.race([txPromise, timeoutPromise]);
      } catch (error: any) {
        // Check if error is timeout or network related
        const isTimeoutOrNetworkError = 
          error.message.includes("timeout") || 
          error.message.includes("network") || 
          error.message.includes("execution reverted");
          
        if (isTimeoutOrNetworkError && retryCount < MAX_RETRIES) {
          retryCount++;
          console.log(`Retry attempt ${retryCount} after ${RETRY_DELAY/1000}s delay`);
          
          // Wait before retry
          await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
          
          // Recursive retry
          return attemptTransaction();
        }
        
        // If all retries exhausted or not a timeout error
        console.error('Transaction failed after retries:', error);
        
        // Format error message for user
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
   * Creates auction for NFT with preliminary approval
   * @param tokenId Token ID
   * @returns Operation result
   */
  const createAuction = async (tokenId: number) => {
    if (!address) {
      throw new Error('Please connect your wallet first');
    }
    
    // Check if transaction is already in progress
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
      // Get contract addresses
      const nftContractAddress = contractAddresses.DeWildClub as `0x${string}`;
      const marketAddress = contractAddresses.PrimarySaleMarket as `0x${string}`;
      
      // Create provider and contract to check approval
      const provider = new ethers.JsonRpcProvider(
        process.env.NEXT_PUBLIC_BASE_MAINNET_RPC_URL || 'https://mainnet.base.org'
      );
      
      const nftContract = new ethers.Contract(
        nftContractAddress,
        ABIS.DeWildClub,
        provider
      );
      
      // Check if there's already approval
      const isApproved = await nftContract.isApprovedForAll(address, marketAddress);
      
      if (!isApproved) {
        // If no approval, execute setApprovalForAll transaction
        console.log('Approval needed. Approving NFT for marketplace...');
        
        const approveTxHash = await executeWithRetry(
          async () => {
            return writeContractAsync({
              abi: ABIS.DeWildClub,
              address: nftContractAddress,
              functionName: 'setApprovalForAll',
              args: [marketAddress, true],
              gas: BigInt(300000) // Increased gas limit to prevent timeouts
            });
          },
          'Failed to approve NFT'
        );
        
        console.log('Approval transaction submitted:', approveTxHash);
        setApprovalTxHash(approveTxHash);
        
        // Automatic auction creation will happen through effect, 
        // watching for isApprovalConfirmed
        
        return {
          success: true,
          approvalHash: approveTxHash
        };
      } else {
        // If approval already exists, create auction directly
        console.log('Approval already exists, creating auction directly');
        return await createAuctionAfterApproval(tokenId);
      }
    } catch (error: any) {
      console.error('Failed to process auction creation:', error);
      setTxStatus('error');
      
      // Enhanced error message
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
   * Creates auction after successful token approval
   * @param tokenId Token ID
   * @returns Operation result
   */
  const createAuctionAfterApproval = async (tokenId: number) => {
    // Check if auction creation transaction is already in progress
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
      // Fixed starting price (0.011 ETH)
      const startPrice = parseEther('0.011');
      
      // Get contract address
      const marketAddress = contractAddresses.PrimarySaleMarket as `0x${string}`;
      
      console.log(`Creating auction for token ${tokenId} with starting price: ${parseFloat(startPrice.toString()) / 1e18} ETH`);
      
      const createTxHash = await executeWithRetry(
        async () => {
          return writeContractAsync({
            abi: ABIS.PrimarySaleMarket,
            address: marketAddress,
            functionName: 'createAuction',
            args: [tokenId, startPrice],
            gas: BigInt(400000) // Increased gas limit
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
      
      // More user-friendly error message
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
   * Cancels auction for NFT
   * @param tokenId Token ID
   * @returns Operation result
   */
  const cancelAuction = async (tokenId: number) => {
    if (!address) {
      throw new Error('Please connect your wallet first');
    }
    
    // Check if transaction is already in progress
    if (isTransactionInProgress) {
      console.log('Transaction already in progress');
      return { success: false, error: 'Transaction already in progress' };
    }

    setTxStatus('loading');
    setTxError('');
    setTxHash('');
    setIsTransactionInProgress(true);

    try {
      // Get contract address
      const marketAddress = contractAddresses.PrimarySaleMarket as `0x${string}`;
      
      console.log(`Cancelling auction for token ${tokenId}`);
      
      const txHash = await executeWithRetry(
        async () => {
          return writeContractAsync({
            abi: ABIS.PrimarySaleMarket,
            address: marketAddress,
            functionName: 'cancelAuction',
            args: [tokenId],
            gas: BigInt(300000) // Increased gas limit
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
      
      // More user-friendly error message
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
   * Places bid in auction
   * @param tokenId Token ID
   * @param bidAmount Bid amount in ETH
   * @returns Operation result
   */
  const placeBid = async (tokenId: number, bidAmount: string) => {
    if (!address) {
      throw new Error('Please connect your wallet first');
    }
    
    // Check if transaction is already in progress
    if (isTransactionInProgress) {
      console.log('Transaction already in progress');
      return { success: false, error: 'Transaction already in progress' };
    }

    setTxStatus('loading');
    setTxError('');
    setTxHash('');
    setIsTransactionInProgress(true);

    try {
      // Convert bid amount to wei
      const bidAmountWei = parseEther(bidAmount);
      
      // Get contract address
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
            gas: BigInt(400000) // Increased gas limit
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
      console.error('Failed to place bid:', error); // Full error in console for debugging
      setTxStatus('error');
      
      // Simplified user error messages
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
      }, 5000); // Give 5 seconds for state to update before allowing new transactions
    }
  };
  
  /**
   * Checks for active auction for NFT
   * @param tokenId Token ID
   * @param provider Ethereum provider
   * @returns Auction information
   */
  const checkAuction = async (tokenId: number, provider: ethers.Provider): Promise<{
    hasAuction: boolean, 
    auctionDetails?: any
  }> => {
    try {
      // Create contract for auction interaction
      const marketAddress = contractAddresses.PrimarySaleMarket;
      const marketContract = new ethers.Contract(
        marketAddress, 
        ABIS.PrimarySaleMarket,
        provider
      );
      
      // Try to get auction information
      try {
        const auctionInfo = await marketContract.getAuction(tokenId);
        
        // auctionInfo structure contains:
        // [0]: artist (address)
        // [1]: startPrice (bigint)
        // [2]: currentBid (bigint)
        // [3]: highestBidder (address)
        // [4]: endTime (bigint) - timestamp in seconds
        // [5]: isActive (bool)
        
        const artist = auctionInfo[0];
        const startPrice = ethers.formatEther(auctionInfo[1]);
        const currentBid = ethers.formatEther(auctionInfo[2]);
        const highestBidder = auctionInfo[3];
        const endTime = Number(auctionInfo[4]) * 1000; // Convert to milliseconds
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
        
        // CHANGED: Check only isActive flag from contract
        // If auction is inactive according to contract data - consider auction inactive
        if (!isActive) {
          return { hasAuction: false };
        }
        
        // Get remaining time from contract
        const remainingTime = await marketContract.getRemainingTime(tokenId);
        const isTimeExpired = remainingTime.eq(0);
        
        // Determine timeLeft state
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
            isTimeExpired, // Add time expiration flag
            timeLeft       // Add pre-calculated timeLeft
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
   * Function for ending auction (if time expired)
   * @param tokenId Token ID
   * @returns Operation result
   */
  const endAuction = async (tokenId: number) => {
    if (!address) {
      throw new Error('Please connect your wallet first');
    }
    
    // Check if transaction is already in progress
    if (isTransactionInProgress) {
      console.log('Transaction already in progress');
      return { success: false, error: 'Transaction already in progress' };
    }

    setTxStatus('loading');
    setTxError('');
    setTxHash('');
    setIsTransactionInProgress(true);

    try {
      // Get contract address
      const marketAddress = contractAddresses.PrimarySaleMarket as `0x${string}`;
      
      console.log(`Ending auction for token ${tokenId}`);
      
      const txHash = await executeWithRetry(
        async () => {
          return writeContractAsync({
            abi: ABIS.PrimarySaleMarket,
            address: marketAddress,
            functionName: 'endAuction',
            args: [tokenId],
            gas: BigInt(500000) // Increased gas limit for complex operation of completion
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
      
      // More user-friendly error message
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
      }, 5000); // Give 5 seconds for state to update
    }
  };

  // Reset error state
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