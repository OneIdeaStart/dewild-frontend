import { useState, useEffect } from 'react';
import { useAppKitAccount } from '@reown/appkit/react';
import type { CollabCheckResponse } from '@/types/collab';

type ApplicationStatus = NonNullable<CollabCheckResponse['address']>['status'];

export const useCollabStatus = () => {
  const { address } = useAppKitAccount();
  const [isCollabApplied, setIsCollabApplied] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [position, setPosition] = useState<number | null>(null);
  const [isCollabFull, setIsCollabFull] = useState(false);
  const [status, setStatus] = useState<'pending' | 'approved' | 'rejected'>('pending');

  const checkCollabStatus = async () => {
    if (!address || address === '0x0') {
      setIsCollabApplied(false);
      setPosition(null);
      setStatus('pending');
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
      
      // Проверяем наличие статуса и устанавливаем значение по умолчанию
      if (data.address?.status) {
        setStatus(data.address.status);
      } else {
        setStatus('pending');
      }
      
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
      setStatus('pending');
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
      setStatus('pending');
      setIsLoading(false);
    }
  }, [address]);

  return {
    isCollabApplied,
    isLoading,
    checkCollabStatus,
    position,
    isCollabFull,
    status
  };
};