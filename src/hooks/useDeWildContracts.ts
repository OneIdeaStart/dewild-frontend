// src/hooks/useDeWildContracts.ts
import { useChainId, useAccount, useReadContract, useWriteContract } from 'wagmi';
import { CONTRACTS, ABIS } from '@/lib/web3/contracts';
import { parseEther } from 'viem';

export function useDeWildContracts() {
  const chainId = useChainId();
  const { address } = useAccount();
  
  // Always use mainnet addresses
  const contractAddresses = CONTRACTS.MAINNET;
  
  // Check that user is on correct network
  const isCorrectNetwork = chainId === 8453; // 8453 - ID Base Mainnet
  
  // Function for minting NFT
  const mintNFT = (signature: string) => {
    const { writeContractAsync } = useWriteContract();
    
    return async () => {
      return writeContractAsync({
        abi: ABIS.DeWildMinter,
        address: contractAddresses.DeWildMinter as `0x${string}`,
        functionName: 'mint',
        args: [signature]
      });
    };
  };
  
  // Function for creating auction
  const createAuction = (tokenId: number, startPrice: bigint) => {
    const { writeContractAsync } = useWriteContract();
    
    return async () => {
      return writeContractAsync({
        abi: ABIS.PrimarySaleMarket,
        address: contractAddresses.PrimarySaleMarket as `0x${string}`,
        functionName: 'createAuction',
        args: [tokenId, startPrice]
      });
    };
  };
  
  // Function for placing bid
  const placeBid = (tokenId: number, bidAmount: string) => {
    const { writeContractAsync } = useWriteContract();
    
    return async () => {
      return writeContractAsync({
        abi: ABIS.PrimarySaleMarket,
        address: contractAddresses.PrimarySaleMarket as `0x${string}`,
        functionName: 'placeBid',
        args: [tokenId],
        value: parseEther(bidAmount)
      });
    };
  };
  
  // Getting token data
  const getTokenData = (tokenId: number) => {
    return useReadContract({
      abi: ABIS.DeWildClub,
      address: contractAddresses.DeWildClub as `0x${string}`,
      functionName: 'tokenURI',
      args: [tokenId]
    });
  };
  
  // Check if user is approved artist
  const isApprovedArtist = () => {
    if (!address) return { data: false };
    
    return useReadContract({
      abi: ABIS.DeWildClub,
      address: contractAddresses.DeWildClub as `0x${string}`,
      functionName: 'isApprovedArtist',
      args: [address]
    });
  };
  
  return {
    addresses: contractAddresses,
    isCorrectNetwork,
    mintNFT,
    createAuction,
    placeBid,
    getTokenData,
    isApprovedArtist
  };
}