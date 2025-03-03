// src/hooks/useCollabStatus.ts

import { useState, useEffect } from 'react';
import { useAppKitAccount } from '@reown/appkit/react';
import type { CollabCheckResponse } from '@/types/collab';
import { CollabApplication, CollabStats } from '@/types/collab';

// Определяем расширенный тип для поддержки всех статусов
type ApplicationStatus = 
 | 'pending' 
 | 'approved' 
 | 'rejected' 
 | 'nft_pending' 
 | 'nft_approved' 
 | 'nft_rejected' 
 | 'minted';

export const useCollabStatus = () => {
 const { address } = useAppKitAccount();
 const [isCollabApplied, setIsCollabApplied] = useState(false);
 const [isLoading, setIsLoading] = useState(true);
 const [position, setPosition] = useState<number | null>(null);
 const [isCollabFull, setIsCollabFull] = useState(false);
 const [status, setStatus] = useState<ApplicationStatus>('pending');
 const [applicationData, setApplicationData] = useState<CollabApplication | null>(null);

 const getMintSignature = async () => {
  if (!address) return null;
  
  try {
    const response = await fetch(`/api/nft/signature?wallet=${address}`);
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to get signature');
    }
    
    const data = await response.json();
    return data.signature;
  } catch (error) {
    console.error('Failed to get mint signature:', error);
    return null;
  }
 };

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
     
     // Явно приводим status к типу ApplicationStatus
     if (data.address?.status) {
       setStatus(data.address.status as ApplicationStatus);
     } else {
       setStatus('pending');
     }

     // Получаем полные данные заявки, если она существует
     if (data.address?.isApplied) {
       const appResponse = await fetch(`/api/collab/application?wallet=${address}`);
       if (appResponse.ok) {
         const appData = await appResponse.json();
         setApplicationData(appData);
       }
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
  status,
  applicationData,
  getMintSignature
 };
};