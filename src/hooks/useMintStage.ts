import { useMintStageContext } from '@/context/MintStageContext';
import { STAGE_CONFIGS } from '@/config/mint-stages';
import { MintStage } from '@/types/mint-stages';
import { useState, useEffect } from 'react';
import { useAppKitAccount } from '@reown/appkit/react';

const DEV_MODE = true;
const FORCED_STAGE = MintStage.WHITELIST_REGISTRATION;

export const useMintStage = () => {
  const { isWhitelisted, isLoading, checkWhitelistStatus, currentStage: contextStage } = useMintStageContext();
  const { address } = useAppKitAccount();
  const [position, setPosition] = useState<number | null>(null);

  const currentStage = DEV_MODE ? FORCED_STAGE : contextStage;

  // Получаем позицию в whitelist
  useEffect(() => {
    const fetchPosition = async () => {
      if (address && isWhitelisted) {
        try {
          const response = await fetch(`/api/whitelist/check?address=${address}`);
          const data = await response.json();
          if (data.address?.position) {
            setPosition(data.address.position);
          }
        } catch (error) {
          console.error('Failed to fetch whitelist position:', error);
        }
      } else {
        setPosition(null);
      }
    };

    fetchPosition();
  }, [address, isWhitelisted]);

  const canInteract = () => {
    if (isLoading) return false;

    const config = STAGE_CONFIGS[currentStage];
    if (config.isWhitelistOnly && !isWhitelisted) return false;

    return true;
  };

  return {
    currentStage,
    stageConfig: STAGE_CONFIGS[currentStage],
    canInteract: canInteract(),
    isWhitelisted,
    isLoading,
    checkWhitelistStatus,
    position, // Только позиция, без проверки на free mint
  };
};