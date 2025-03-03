// src/hooks/useDeWildContracts.ts
import { useChainId, useAccount, useReadContract, useWriteContract } from 'wagmi';
import { CONTRACTS, ABIS } from '@/lib/web3/contracts';
import { parseEther } from 'viem';

export function useDeWildContracts() {
  const chainId = useChainId();
  const { address } = useAccount();
  
  // Определяем, какие адреса использовать (тестнет или мейннет)
  const isTestnet = chainId !== 8453; // 8453 - ID Base Mainnet
  const contractAddresses = isTestnet ? CONTRACTS.TESTNET : CONTRACTS.MAINNET;
  
  // Функция для минта NFT
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
  
  // Функция для создания аукциона
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
  
  // Функция для размещения ставки
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
  
  // Получение данных о токене
  const getTokenData = (tokenId: number) => {
    return useReadContract({
      abi: ABIS.DeWildClub,
      address: contractAddresses.DeWildClub as `0x${string}`,
      functionName: 'tokenURI',
      args: [tokenId]
    });
  };
  
  // Проверка, является ли пользователь одобренным артистом
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
    isTestnet,
    mintNFT,
    createAuction,
    placeBid,
    getTokenData,
    isApprovedArtist
  };
}