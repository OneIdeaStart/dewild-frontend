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
   
    const [conditions, setConditions] = useState<WhitelistConditions>({
      isWalletConnected: false,
      isTwitterFollowed: false,
      isDiscordJoined: false,
      hasTwitterHandle: false,
      discordUsername: '',
      discordId: ''
    });
  
    const [twitterHandle, setTwitterHandle] = useState('');

    // Проверяем результат Discord авторизации при загрузке
    useEffect(() => {
      if (typeof window !== 'undefined') {
          const discordAuth = localStorage.getItem('discord_auth');
          if (discordAuth) {
              try {
                  const authData = JSON.parse(discordAuth);
                  if (authData.success) {
                      setConditions(prev => ({
                          ...prev,
                          isDiscordJoined: true,
                          discordUsername: authData.username
                      }));
                  }
                  // Очищаем после использования
                  localStorage.removeItem('discord_auth');
              } catch (error) {
                  console.error('Failed to parse discord_auth:', error);
              }
          }
      }
  }, []);
  
    // Сброс при отключении кошелька
    useEffect(() => {
      if (!isConnected) {
        setConditions({
          isWalletConnected: false,
          isTwitterFollowed: false,
          isDiscordJoined: false,
          hasTwitterHandle: false,
          discordUsername: '',
          discordId: ''
        });
        
        setTwitterHandle('');
        
        sessionStorage.removeItem('whitelistConditions');
        sessionStorage.removeItem('twitterHandle');
        
        if (typeof window !== 'undefined') {
          window.localStorage.removeItem('wagmi.wallet');
          window.localStorage.removeItem('wagmi.connected');
        }
      }
    }, [isConnected]);
  
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
    
      window.open('https://x.com/DeWildClub', '_blank');
    
      setTimeout(() => {
        setConditions((prev) => ({
          ...prev,
          isTwitterFollowed: true,
        }));
      }, 1500);
    };

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

        // Проверяем, мобильное ли устройство
        const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

        if (isMobile) {
          // На мобильных открываем в том же окне
          window.location.href = url;
        } else {
          // На десктопе открываем в новом окне
          const authWindow = window.open(url, '_blank');

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
        }
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