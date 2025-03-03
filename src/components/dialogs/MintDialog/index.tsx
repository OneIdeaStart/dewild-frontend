// src/components/dialogs/MintDialog/index.tsx
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { useAppKitAccount } from '@reown/appkit/react';
import { useCollabStatus } from '@/hooks/useCollabStatus';
import { useWriteContract, useWaitForTransactionReceipt, useChainId } from 'wagmi';
import { CONTRACTS, ABIS } from '@/lib/web3/contracts';
import { parseEther } from 'viem';

interface MintDialogProps {
  onClose: () => void;
}

export default function MintDialog({ onClose }: MintDialogProps) {
    const { address } = useAppKitAccount();
    const { applicationData, checkCollabStatus } = useCollabStatus();
    const [isLoading, setIsLoading] = useState(false);
    const [ipfsLoading, setIpfsLoading] = useState(false);
    const [ipfsData, setIpfsData] = useState<any>(null);
    const [mintError, setMintError] = useState<string | undefined>(undefined);
    const [ipfsError, setIpfsError] = useState<string | undefined>(undefined);
    const [signature, setSignature] = useState<string | undefined>(undefined);
    const [isSignatureLoading, setIsSignatureLoading] = useState(false);
    const [stage, setStage] = useState<'init' | 'ipfs' | 'mint' | 'done'>('init');
    const [txHash, setTxHash] = useState<string | undefined>(undefined);
    const [nftAlreadyUploaded, setNftAlreadyUploaded] = useState(false);
    
    // Добавляем режим тестирования IPFS
    const [testMode, setTestMode] = useState(true);
    
    // Get chainId to check network
    const chainId = useChainId();
    
    // Base Sepolia chainId
    const BASE_SEPOLIA_CHAIN_ID = 84532;
    
    // Check if on correct network
    const isCorrectNetwork = chainId === BASE_SEPOLIA_CHAIN_ID;
    
    // Get contract addresses
    const contractAddresses = CONTRACTS.TESTNET;
    
    // Use wagmi hooks
    const { writeContractAsync } = useWriteContract();
    
    // Track transaction confirmation
    const { isLoading: isConfirming, isSuccess: isConfirmed, isError: isFailedTx } = 
        useWaitForTransactionReceipt({ hash: txHash as `0x${string}` || undefined });
    
    // Проверка, загружена ли NFT в IPFS при открытии диалога
    useEffect(() => {
        const checkNftUploadStatus = async () => {
            if (!address) return;
            
            try {
                // Проверяем наличие данных IPFS в хранилище Redis для этого кошелька
                const response = await fetch(`/api/nft/details?wallet=${address}`);
                
                if (response.ok) {
                    const data = await response.json();
                    console.log("NFT details:", data);
                    
                    // Проверяем, есть ли данные об IPFS в базе
                    if (data && data.ipfsImage) {
                        // Если в базе есть данные IPFS, значит NFT уже был загружен
                        setIpfsData({
                            ipfsImage: data.ipfsImage,
                            ipfsMetadata: data.ipfsMetadata,
                            ipfsImageUrl: data.ipfsImageUrl || `https://pink-quickest-bear-821.mypinata.cloud/ipfs/${data.ipfsImage}`,
                            ipfsMetadataUrl: data.ipfsMetadataUrl || `https://pink-quickest-bear-821.mypinata.cloud/ipfs/${data.ipfsMetadata}`
                        });
                        
                        setNftAlreadyUploaded(true);
                        setTestMode(false); // Важно! Отключаем тестовый режим
                        console.log("NFT already uploaded, disabling test mode");
                    }
                }
            } catch (error) {
                console.error("Failed to check NFT upload status:", error);
            }
        };       
        
        checkNftUploadStatus();
    }, [address]);
    
    // Получение подписи при загрузке диалога
    useEffect(() => {
        const getSignature = async () => {
          if (!address) return;
          
          setIsSignatureLoading(true);
          try {
            const response = await fetch(`/api/nft/signature?wallet=${address}`);
            
            if (!response.ok) {
              const errorData = await response.json();
              throw new Error(errorData.error || 'Failed to get signature');
            }
            
            const data = await response.json();
            setSignature(data.signature);
          } catch (error: any) {
            console.error('Failed to get signature:', error);
            setMintError(error.message || 'Failed to get signature for minting');
          } finally {
            setIsSignatureLoading(false);
          }
        };
        
        getSignature();
    }, [address]);
    
    // Effect to handle transaction confirmation
    useEffect(() => {
        if (isConfirmed && txHash) {
            // Update DB status
            updateDBStatus(txHash);
        }
        
        if (isFailedTx) {
            setMintError("Transaction failed. Please try again.");
            setStage('init');
        }
    }, [isConfirmed, isFailedTx, txHash]);
    
    // Function to update DB status after confirmed transaction
    const updateDBStatus = async (txHash: string) => {
        if (!address) return;
        
        try {
            await fetch('/api/nft/minted', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    wallet: address,
                    txHash
                }),
            });
            
            // Set success status
            setStage('done');
            
            // Re-check status
            await checkCollabStatus();
            
            // Close dialog after delay
            setTimeout(() => {
                onClose();
            }, 3000);
        } catch (error) {
            console.error('Error updating DB status:', error);
            setMintError('NFT minted but failed to update status. Please contact support.');
        }
    };

    // Загрузка в IPFS
    const uploadToIPFS = async () => {
      if (!address) {
        setIpfsError("Wallet not connected");
        return false;
      }
      
      setIpfsLoading(true);
      setIpfsError(undefined);
      
      try {
        // Отправляем запрос на загрузку в IPFS
        const response = await fetch('/api/nft/ipfs-upload', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            wallet: address
          }),
        });
        
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to upload to IPFS');
        }
        
        const data = await response.json();
        console.log('IPFS upload successful:', data);
        setIpfsData(data);
        setNftAlreadyUploaded(true);
        return true;
      } catch (error: any) {
        console.error('IPFS upload error:', error);
        setIpfsError(error.message || 'Failed to upload to IPFS');
        return false;
      } finally {
        setIpfsLoading(false);
      }
    };

    // Минт NFT
    const mintNFT = async () => {
      // Check network first
      if (!isCorrectNetwork) {
        setMintError(`Please switch to Base Sepolia network to mint your NFT.`);
        return;
      }
      
      if (!signature) {
        setMintError("Signature not provided. Please try again or contact support.");
        return;
      }
      
      // В тестовом режиме останавливаемся после загрузки в IPFS
      if (testMode) {
        await uploadToIPFS();
        return;
      }
      
      setIsLoading(true);
      setMintError(undefined);
      
      try {
        // Сначала загружаем в IPFS, если еще не загружено
        if (!nftAlreadyUploaded && !ipfsData && stage === 'init') {
          setStage('ipfs');
          const ipfsSuccess = await uploadToIPFS();
          if (!ipfsSuccess) {
            throw new Error('Failed to upload to IPFS');
          }
        }
        
        // Переходим к минту
        setStage('mint');
        
        // Используем writeContractAsync для вызова контракта
        console.log('Contract addresses:', contractAddresses);
        console.log('DeWildMinter address:', contractAddresses.DeWildMinter);
        console.log('Using ABI:', ABIS.DeWildMinter);
        console.log('Signature:', signature);

        const hash = await writeContractAsync({
          abi: ABIS.DeWildMinter,
          address: contractAddresses.DeWildMinter as `0x${string}`,
          functionName: 'mint',
          args: [signature],
          value: parseEther("0.0011")
        });
        
        // Store tx hash for tracking
        setTxHash(hash);
        
        // Don't set 'done' status immediately - wait for confirmation
        
      } catch (error: any) {
        console.error('Mint error:', error);
        setMintError(error.message || 'Failed to mint NFT');
        
        // В случае ошибки возвращаемся на начальную стадию
        setStage('init');
        setIsLoading(false);
      }
    };

    // Функция для отображения текущего статуса
    const renderStage = () => {
      if (isConfirming) return "Confirming Transaction...";
      
      switch(stage) {
        case 'ipfs':
          return "Uploading to IPFS...";
        case 'mint':
          return "Minting NFT...";
        case 'done':
          return "NFT Minted Successfully!";
        default:
          return testMode ? "Upload to IPFS" : "Mint NFT";
      }
    };

    return (
      <div className="relative flex flex-col items-center w-full h-full overflow-auto">
        <div className="relative z-10 flex flex-col items-center gap-8 px-3 mt-20 sm:mt-8 w-full max-w-[448px] pb-10">
          {/* Header */}
          <div className="flex justify-between items-center w-full">
            <h1 className="text-[48px] font-extrabold uppercase leading-[48px]">
              {testMode ? "Test IPFS Upload" : "Mint NFT"}
            </h1>
            <svg
              onClick={onClose}
              width="48"
              height="48"
              viewBox="0 0 48 48"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="cursor-pointer"
            >
              <path d="M12.4501 37.6501L10.3501 35.5501L21.9001 24.0001L10.3501 12.4501L12.4501 10.3501L24.0001 21.9001L35.5501 10.3501L37.6501 12.4501L26.1001 24.0001L37.6501 35.5501L35.5501 37.6501L24.0001 26.1001L12.4501 37.6501Z" fill="black" />
            </svg>
          </div>

          {/* Network Warning */}
          {!isCorrectNetwork && (
            <div className="w-full bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
              <strong className="font-bold">Wrong Network! </strong>
              <span className="block sm:inline">Please connect to Base Sepolia network to mint your NFT.</span>
            </div>
          )}

          <div className="flex flex-col gap-3 w-full">
            {/* Test Mode Toggle - Hide if NFT already uploaded */}
            {!nftAlreadyUploaded && (
              <div className="bg-[#8B1933] p-4 rounded-[16px]">
                <div className="flex justify-between items-center">
                  <div className="text-white text-[24px] leading-[24px] font-extrabold">
                    Test Mode (IPFS Only)
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox"
                      checked={testMode}
                      onChange={() => setTestMode(!testMode)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>
              </div>
            )}

            {/* NFT Preview */}
            <div className="bg-[#6A35FF] p-4 rounded-[16px]">
              <div className="text-[#7EF3E1] text-[32px] leading-[32px] font-extrabold uppercase mb-4">
                Your DeWild NFT
              </div>
              
              {applicationData?.imageUrl && (
                <div className="mt-4 flex justify-center">
                  <img 
                    src={applicationData.imageUrl} 
                    alt="Your NFT" 
                    className="max-h-[416px] object-contain"
                  />
                </div>
              )}
            </div>

            {/* IPFS Status */}
            <div className="bg-[#FF92B9] p-4 rounded-[16px]">
              <div className="text-[#026551] text-[32px] leading-[32px] font-extrabold uppercase mb-3">
                IPFS STATUS
              </div>
              
              {ipfsLoading ? (
                <div className="text-[#026551] text-[24px] font-bold flex items-center">
                  <svg className="animate-spin h-5 w-5 mr-3" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Uploading to IPFS...
                </div>
              ) : ipfsData ? (
                <div className="text-[#026551] text-[18px] leading-[24px] font-bold">
                  <p>✅ Image uploaded to IPFS</p>
                  <p>✅ Metadata uploaded to IPFS</p>
                  <p className="mt-2 font-normal">Image CID: {ipfsData.ipfsImage.substring(0, 20)}...</p>
                  <p className="font-normal">Metadata CID: {ipfsData.ipfsMetadata.substring(0, 20)}...</p>
                  
                  {/* Добавляем ссылки для просмотра в IPFS */}
                  <div className="mt-3">
                    <a 
                      href={ipfsData.ipfsImageUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="block text-blue-600 underline"
                    >
                      View Image in IPFS
                    </a>
                    <a 
                      href={ipfsData.ipfsMetadataUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="block text-blue-600 underline"
                    >
                      View Metadata in IPFS
                    </a>
                  </div>
                  
                  {/* В тестовом режиме добавляем кнопку для продолжения к минту */}
                  {testMode && ipfsData && (
                    <div className="mt-4">
                      <Button
                        onClick={() => setTestMode(false)}
                        variant="primary"
                        size="sm"
                        className="bg-black hover:bg-gray-700 text-white"
                      >
                        Continue to Mint
                      </Button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-[#026551] text-[18px] leading-[24px] font-bold">
                  {ipfsError ? (
                    <p className="text-red-600">Error: {ipfsError}</p>
                  ) : (
                    <p>Your NFT will be uploaded to IPFS before minting</p>
                  )}
                </div>
              )}
            </div>

            {/* Transaction Status - show when minting */}
            {(stage === 'mint' || isConfirming) && txHash && (
              <div className="bg-[#6A35FF] p-4 rounded-[16px]">
                <div className="text-white text-[24px] leading-[24px] font-extrabold mb-2">
                  Transaction Status
                </div>
                <p className="text-white text-sm break-all">
                  Hash: {txHash}
                </p>
                <div className="mt-2">
                  <a 
                    href={`https://sepolia.basescan.org/tx/${txHash}`}
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-[#7EF3E1] underline"
                  >
                    View on BaseScan
                  </a>
                </div>
                <div className="mt-2 flex items-center text-white">
                  {isConfirming ? (
                    <>
                      <svg className="animate-spin h-5 w-5 mr-2" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Waiting for confirmation...
                    </>
                  ) : (
                    'Transaction submitted'
                  )}
                </div>
              </div>
            )}

            {/* NFT Info - показываем только в режиме минта */}
            {!testMode && (
              <div className="bg-[#F9E52C] p-4 rounded-[16px]">
                <div className="text-[#48926D] text-[32px] leading-[32px] font-extrabold uppercase mb-3">
                  MINT & MAKE HISTORY
                </div>
                <p className="text-[#48926D] text-[24px] leading-[24px] font-extrabold uppercase">
                Your art. Your message. Locked on-chain forever. Mint it, own it, and let the world take notice.
                </p>
              </div>
            )}
          </div>

          <div className="relative w-full max-w-[448px] flex justify-between">
            <button
              onClick={onClose}
              className="text-black text-[24px] font-extrabold uppercase"
              disabled={isLoading || ipfsLoading || isConfirming}
            >
              CANCEL
            </button>
            <Button
              onClick={mintNFT}
              variant="primary"
              size="lg"
              className="bg-black hover:bg-gray-700 text-white"
              disabled={isLoading || ipfsLoading || isSignatureLoading || !signature || stage === 'done' || (testMode && ipfsData) || isConfirming}
            >
              {isLoading || ipfsLoading || isConfirming ? (
                <span className="flex items-center">
                  <svg className="animate-spin h-5 w-5 mr-3" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  {renderStage()}
                </span>
              ) : (
                renderStage()
              )}
            </Button>
          </div>
          
          {mintError && (
            <p className="text-red-500 text-sm mt-2">{mintError}</p>
          )}
        </div>
      </div>
    );
}