// hooks/useWhitelistConditions.ts
import { useState, useEffect } from 'react'
import { useAppKitAccount } from '@reown/appkit/react'

interface WhitelistConditions {
    isWalletConnected: boolean
    isTwitterFollowed: boolean
    isDiscordJoined: boolean
    hasTwitterHandle: boolean
    discordUsername: string
    discordId: string
}

export const useWhitelistConditions = () => {
    const { isConnected } = useAppKitAccount();
   
    // Упрощаем начальное состояние
    const [conditions, setConditions] = useState<WhitelistConditions>({
      isWalletConnected: false,
      isTwitterFollowed: false,
      isDiscordJoined: false,
      hasTwitterHandle: false,
      discordUsername: '',
      discordId: ''
    });
  
    const [twitterHandle, setTwitterHandle] = useState('');
  
    // Простой эффект для сброса при отключении
    useEffect(() => {
      if (!isConnected) {
        // Сброс всех состояний
        setConditions({
          isWalletConnected: false,
          isTwitterFollowed: false,
          isDiscordJoined: false,
          hasTwitterHandle: false,
          discordUsername: '',
          discordId: ''
        });
        
        setTwitterHandle('');
        
        // Очистка sessionStorage
        sessionStorage.removeItem('whitelistConditions');
        sessionStorage.removeItem('twitterHandle');
        
        // Очищаем также localStorage при отключении
        if (typeof window !== 'undefined') {
          window.localStorage.removeItem('wagmi.wallet');
          window.localStorage.removeItem('wagmi.connected');
        }
      }
    }, [isConnected]);
  
    // Просто обновляем состояние подключения кошелька
    useEffect(() => {
      setConditions(prev => ({
        ...prev,
        isWalletConnected: isConnected
      }));
    }, [isConnected]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('whitelistConditions', JSON.stringify(conditions))
    }
  }, [conditions]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('twitterHandle', twitterHandle)
    }
  }, [twitterHandle]);

  const handleTwitterFollow = () => {
    if (typeof window === 'undefined') return;

    window.open('https://x.com/DeWildxyz', '_blank')
    setConditions(prev => ({
      ...prev,
      isTwitterFollowed: true
    }))
  }

  const handleTwitterHandleInput = (handle: string) => {
    setTwitterHandle(handle)
    setConditions(prev => ({
      ...prev,
      hasTwitterHandle: handle.trim() !== ''
    }))
  }

  const handleDiscordJoin = () => {
    window.open('https://discord.gg/ygh7CtbNZe', '_blank');
  }

  const handleDiscordCheck = async () => {
    try {
      const response = await fetch('/api/discord/auth');
      const { url } = await response.json();

      window.open(url, '_blank');

      const handleMessage = (event: MessageEvent) => {
        if (event.data.type === 'discord-auth') {
          window.removeEventListener('message', handleMessage);
          if (event.data.success) {
            setConditions(prev => ({
              ...prev,
              isDiscordJoined: true,
              discordUsername: event.data.username
            }));
          }
        }
      };

      window.addEventListener('message', handleMessage);
    } catch (error) {
      console.error('Discord auth error:', error);
    }
  }

  const areAllConditionsMet = () => {
    return conditions.isWalletConnected && 
           conditions.isTwitterFollowed && 
           conditions.isDiscordJoined &&
           conditions.hasTwitterHandle
  }

  return {
    conditions,
    twitterHandle,
    handleTwitterFollow,
    handleTwitterHandleInput,
    handleDiscordJoin,
    handleDiscordCheck,
    areAllConditionsMet
  }
}