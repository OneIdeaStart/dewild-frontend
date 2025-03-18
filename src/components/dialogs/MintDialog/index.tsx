// src/components/dialogs/MintDialog/index.tsx
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { useAppKitAccount } from '@reown/appkit/react';
import { useCollabStatus } from '@/hooks/useCollabStatus';
import { useWriteContract, useWaitForTransactionReceipt, useChainId } from 'wagmi';
import { CONTRACTS, ABIS } from '@/lib/web3/contracts';
import { parseEther } from 'viem';
import MintSuccessDialog from '../MintSuccessDialog';

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
    // State for expanding/collapsing traits block
    const [traitsExpanded, setTraitsExpanded] = useState(false);
    // Successful mint completion state for displaying MintSuccessDialog
    const [showMintSuccess, setShowMintSuccess] = useState(false);
    const [mintedNftNumber, setMintedNftNumber] = useState<string | number | null>(null);
        
    // Get chainId to check network
    const chainId = useChainId();
    
    // Base Mainnet chainId
    const BASE_MAINNET_CHAIN_ID = 8453;
    
    // Check if on correct network
    const isCorrectNetwork = chainId === BASE_MAINNET_CHAIN_ID;

    
    // Get contract addresses
    const contractAddresses = CONTRACTS.MAINNET;
    
    // Use wagmi hooks
    const { writeContractAsync } = useWriteContract();
    
    // Track transaction confirmation
    const { isLoading: isConfirming, isSuccess: isConfirmed, isError: isFailedTx } = 
        useWaitForTransactionReceipt({ hash: txHash as `0x${string}` || undefined });
    
    // Check if NFT is uploaded to IPFS when dialog opens
    useEffect(() => {
        const checkNftUploadStatus = async () => {
            if (!address) return;
            
            try {
                // Check for IPFS data in Redis storage for this wallet
                const response = await fetch(`/api/nft/details?wallet=${address}`);
                
                if (response.ok) {
                    const data = await response.json();
                    console.log("NFT details:", data);
                    
                    // Check if there's IPFS data in database
                    if (data && data.ipfsImage) {
                        // If there's IPFS data in database, it means NFT was already uploaded
                        setIpfsData({
                            ipfsImage: data.ipfsImage,
                            ipfsMetadata: data.ipfsMetadata,
                            ipfsImageUrl: data.ipfsImageUrl || `https://pink-quickest-bear-821.mypinata.cloud/ipfs/${data.ipfsImage}`,
                            ipfsMetadataUrl: data.ipfsMetadataUrl || `https://pink-quickest-bear-821.mypinata.cloud/ipfs/${data.ipfsMetadata}`
                        });
                        
                        setNftAlreadyUploaded(true);
                        console.log("NFT already uploaded to IPFS");
                    }
                }
            } catch (error) {
                console.error("Failed to check NFT upload status:", error);
            }
        };       
        
        checkNftUploadStatus();
    }, [address]);
    
    // Get signature when dialog loads
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
            const response = await fetch('/api/nft/minted', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    wallet: address,
                    txHash
                }),
            });
            
            const data = await response.json();
            
            // Set success status
            setStage('done');
            
            // Re-check status
            await checkCollabStatus();
            
            // Get nftNumber from API response or from current application data
            let nftNum: string | number | null = null;
            if (data && data.nftNumber) {
                nftNum = data.nftNumber.toString();
            } else if (applicationData?.nftNumber) {
                nftNum = applicationData.nftNumber.toString();
            }

            // Set nftNumber (instead of tokenId)
            setMintedNftNumber(nftNum);
            
            // Show successful mint dialog
            setShowMintSuccess(true);
        } catch (error) {
            console.error('Error updating DB status:', error);
            setMintError('NFT minted but failed to update status. Please contact support.');
      }
    };
    
    // Upload to IPFS
    const uploadToIPFS = async () => {
      if (!address) {
        setIpfsError("Wallet not connected");
        return false;
      }
      
      setIpfsLoading(true);
      setIpfsError(undefined);
      
      try {
        // Send request to upload to IPFS
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

    // Mint NFT
    const mintNFT = async () => {
      // Check network first
      if (!isCorrectNetwork) {
        setMintError(`Please switch to Base Mainnet network to mint your NFT.`);
        return;
      }
      
      if (!signature) {
        setMintError("Signature not provided. Please try again or contact support.");
        return;
      }
      
      setIsLoading(true);
      setMintError(undefined);
      
      try {
        // First upload to IPFS if not already uploaded
        if (!nftAlreadyUploaded && !ipfsData) {
          setStage('ipfs');
          const ipfsSuccess = await uploadToIPFS();
          if (!ipfsSuccess) {
            throw new Error('Failed to upload to IPFS');
          }
        }
        
        // Proceed to mint
        setStage('mint');
        
        // Use writeContractAsync to call contract
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
        
      } catch (error: any) {
        console.error('Mint error:', error);
        
        // Check if error is user rejection
        if (error.message && (
            error.message.includes('User rejected') || 
            error.message.includes('user rejected') || 
            error.message.includes('rejected the transaction') ||
            error.message.includes('User denied')
        )) {
          setMintError('Transaction rejected by user');
        } else {
          setMintError(error.message || 'Failed to mint NFT');
        }
        
        // In case of error return to initial stage
        setStage('init');
        setIsLoading(false);
      }
    };

    // Function to display current status
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
          return "Upload to IPFS & Mint NFT";
      }
    };

    // Function to update button text depending on status
    const renderButtonText = () => {
      if (isLoading || ipfsLoading || isConfirming) {
        return (
          <span className="flex items-center justify-center">
            <svg className="animate-spin h-5 w-5 mr-3" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            {renderStage()}
          </span>
        );
      }
      
      // If there's an IPFS upload error but no minting error, button should be "UPLOAD TO IPFS & MINT NFT"
      if (ipfsError && !mintError) {
        return "UPLOAD TO IPFS & MINT NFT";
      }
      
      // If there's a minting error but not an IPFS upload error, button should be "MINT NFT"
      if (mintError && !ipfsError && nftAlreadyUploaded) {
        return "MINT NFT";
      }
      
      // Default
      return renderStage();
    };

    return (
      <>
        <div className="relative flex flex-col items-center w-full h-full overflow-auto">
          <div className="relative z-10 flex flex-col items-center gap-8 px-3 mt-20 sm:mt-8 w-full max-w-[448px] pb-10">
            {/* Header */}
            <div className="flex justify-between items-center w-full">
              <h1 className="text-[48px] font-extrabold uppercase leading-[48px]">
                Mint NFT
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
                <span className="block sm:inline">Please connect to Base Mainnet network to mint your NFT.</span>
              </div>
            )}

            <div className="flex flex-col gap-3 w-full">
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
                      className="max-h-[416px] object-contain rounded-[8px]"
                    />
                  </div>
                )}
              </div>

              {/* NFT Traits with collapsing capability */}
              <div className="bg-[#FF92B9] p-4 rounded-[16px]">
                <div 
                  className="flex justify-between items-center cursor-pointer"
                  onClick={() => setTraitsExpanded(!traitsExpanded)}
                >
                  <div className="text-[#026551] text-[32px] leading-[32px] font-extrabold uppercase">
                    Check NFT Traits
                  </div>
                  <div className="text-[#026551]">
                    {traitsExpanded ? (
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M6 15L12 9L18 15" stroke="#026551" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    ) : (
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M6 9L12 15L18 9" stroke="#026551" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    )}
                  </div>
                </div>
                
                {traitsExpanded && applicationData?.metadata?.traits && (
                  <div className="mt-3">
                    <div className="grid grid-cols-2 gap-y-2 gap-x-4">
                      <div className="text-[#026551] text-[24px] leading-[24px] font-extrabold uppercase">Animal</div>
                      <div className="text-[#026551] text-[24px] leading-[24px] font-extrabold uppercase text-right">{applicationData.metadata.traits.animal}</div>
                      
                      <div className="text-[#026551] text-[24px] leading-[24px] font-extrabold uppercase">Material</div>
                      <div className="text-[#026551] text-[24px] leading-[24px] font-extrabold uppercase text-right">{applicationData.metadata.traits.material}</div>
                      
                      <div className="text-[#026551] text-[24px] leading-[24px] font-extrabold uppercase">Material Color</div>
                      <div className="text-[#026551] text-[24px] leading-[24px] font-extrabold uppercase text-right">{applicationData.metadata.traits.material_color}</div>
                      
                      <div className="text-[#026551] text-[24px] leading-[24px] font-extrabold uppercase">Background</div>
                      <div className="text-[#026551] text-[24px] leading-[24px] font-extrabold uppercase text-right">{applicationData.metadata.traits.background}</div>
                      
                      <div className="text-[#026551] text-[24px] leading-[24px] font-extrabold uppercase">Pattern Color</div>
                      <div className="text-[#026551] text-[24px] leading-[24px] font-extrabold uppercase text-right">{applicationData.metadata.traits.pattern_color}</div>
                      
                      <div className="text-[#026551] text-[24px] leading-[24px] font-extrabold uppercase">Eyes Color</div>
                      <div className="text-[#026551] text-[24px] leading-[24px] font-extrabold uppercase text-right">{applicationData.metadata.traits.eyes_color}</div>
                      
                      <div className="text-[#026551] text-[24px] leading-[24px] font-extrabold uppercase">Artist</div>
                      <div className="text-[#026551] text-[24px] leading-[24px] font-extrabold uppercase text-right">
                        @{applicationData?.twitter || 'unknown'}
                      </div>
                      
                      {/* Statement, if exists */}
                      {applicationData?.metadata?.statement && (
                        <>
                          <div className="text-[#026551] text-[24px] leading-[24px] font-extrabold uppercase">Statement</div>
                          <div className="text-[#026551] text-[24px] leading-[24px] font-extrabold uppercase text-right">{applicationData.metadata.statement}</div>
                        </>
                      )}
                    </div>
                  </div>
                )}
                
                {traitsExpanded && !applicationData?.metadata?.traits && (
                  <div className="text-[#026551] text-[18px] mt-3">
                    <p>No traits data available</p>
                    <p>Check application status or contact support.</p>
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
                      href={`https://basescan.org/tx/${txHash}`}
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

              {/* NFT Info */}
              <div className="bg-[#F9E52C] p-4 rounded-[16px]">
                <div className="text-[#48926D] text-[32px] leading-[32px] font-extrabold uppercase mb-3">
                  MINT & MAKE HISTORY
                </div>
                <p className="text-[#48926D] text-[24px] leading-[24px] font-extrabold uppercase">
                  Your art. Your message. Locked on-chain forever. Mint it, own it, and let the world take notice.
                </p>
              </div>
            </div>

            <div className="flex flex-col gap-4 w-full max-w-[448px] relative">
              {/* Error is shown above the button */}
              {(mintError || ipfsError) && (
                <div className="bg-[#D90004] rounded-[8px] px-4 py-2 text-white text-[16px] font-extrabold uppercase text-center">
                  {mintError || ipfsError}
                </div>
              )}
              
              <Button
                onClick={mintNFT}
                variant="primary"
                size="lg"
                className="w-full bg-black hover:bg-gray-700 text-white"
                disabled={isLoading || ipfsLoading || isSignatureLoading || !signature || stage === 'done' || isConfirming}
              >
                {renderButtonText()}
              </Button>
              <button
                onClick={onClose}
                className="text-black text-[24px] font-extrabold uppercase w-full text-center"
                disabled={isLoading || ipfsLoading || isConfirming}
              >
                CANCEL
              </button>
            </div>
          </div>
        </div>

        {/* Successful mint dialog */}
        {showMintSuccess && (
          <MintSuccessDialog 
            isOpen={showMintSuccess} 
            onClose={() => setShowMintSuccess(false)} 
            nftNumber={mintedNftNumber || null} // Use nftNumber instead of tokenId
          />
        )}
      </>
    );
}