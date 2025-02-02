import { useState, useEffect } from 'react';
import { useAppKitAccount } from '@reown/appkit/react';

export const useCollabStatus = () => {
  const { address } = useAppKitAccount();
  const [isCollabApplied, setIsCollabApplied] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [position, setPosition] = useState<number | null>(null);
  const [isCollabFull, setIsCollabFull] = useState(false);

  const checkCollabStatus = async () => {
    // Проверяем только адрес
    if (!address || address === '0x0') {
      setIsCollabApplied(false);
      setPosition(null);
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch(`/api/collab/check?address=${address}`);
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      
      const data = await response.json();
      
      setIsCollabApplied(data.address?.isApplied || false);
      setIsCollabFull(data.stats?.isFull || false);
      
      if (data.address?.position) {
        setPosition(data.address.position);
      } else {
        setPosition(null);
      }
    } catch (error) {
      console.error('Failed to fetch collab status:', error);
      setIsCollabApplied(false);
      setPosition(null);
      setIsCollabFull(false);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (address) {
      checkCollabStatus();
    } else {
      setIsCollabApplied(false);
      setPosition(null);
    }
  }, [address]);

  return {
    isCollabApplied,
    isLoading,
    checkCollabStatus,
    position,
    isCollabFull
  };
};