import { useState, useEffect } from 'react'
import { useAppKitAccount } from '@reown/appkit/react'
import { generateWildRating } from '@/lib/utils'
import { CollabError } from '@/types/collab'

interface CollabConditions {
  isWalletConnected: boolean
  isTwitterFollowed: boolean
  isDiscordJoined: boolean
  hasSharedTweet: boolean
  hasTweetUrlInput: boolean
  discordUsername: string
  discordId: string
  twitterHandle: string
}

type SetErrorType = (error: CollabError) => void;

export const useCollabConditions = (
    setError: SetErrorType,
    setIsVerifying: (loading: boolean) => void,
    setIsDiscordVerifying: (loading: boolean) => void
  ) => {
  const { isConnected } = useAppKitAccount();
 
  const [conditions, setConditions] = useState<CollabConditions>({
    isWalletConnected: false,
    isTwitterFollowed: false,
    isDiscordJoined: false,
    hasSharedTweet: false,
    hasTweetUrlInput: false,  // изменили
    discordUsername: '',
    discordId: '',
    twitterHandle: ''
  });

  const statuses = [
    "UNLEASHED 🔥",
    "WILD & FREE 🌟",
    "UNTAMED 🎯",
    "UNBOUND 💫",
    "UNSTOPPABLE ⚡️"
  ];

  const [tweetUrl, setTweetUrl] = useState('');

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
        hasSharedTweet: false,
        hasTweetUrlInput: false,
        discordUsername: '',
        discordId: '',
        twitterHandle: ''
      });
      
      setTweetUrl('');
      
      sessionStorage.removeItem('collabConditions');
      sessionStorage.removeItem('tweetUrl');
      
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
      sessionStorage.setItem('collabConditions', JSON.stringify(conditions))
    }
  }, [conditions]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('tweetUrl', tweetUrl)
    }
  }, [tweetUrl]);

  const handleTwitterFollow = () => {
    if (typeof window === 'undefined') return;
  
    window.open('https://x.com/DeWildClub', '_blank');
  
    setTimeout(() => {
      setConditions((prev) => ({
        ...prev,
        isTwitterFollowed: true,
      }));
    }, 3000);
  };

  const handleShareTweet = () => {
    if (typeof window === 'undefined') return;
  
    const wildRating = generateWildRating();
    const randomStatus = statuses[Math.floor(Math.random() * statuses.length)];
    
    const text = `Joining @DeWildClub artist community!
  
    Art Status: ${randomStatus}
    Wild Rating: ${wildRating}
  
    11,111 artists. One wild collection.
    Think you're wild enough? 👉 https://dewild.club
  
    #DeWildClub #NFTArt #NFTCommunity`;
  
    const encodedText = encodeURIComponent(text);
    window.open(`https://twitter.com/intent/tweet?text=${encodedText}`, '_blank');
  
    sessionStorage.setItem('wildRating', wildRating);
    
    // Добавлен таймаут в 3000 мс (3 секунды), точно такой же как в handleTwitterFollow
    setTimeout(() => {
      setConditions(prev => ({
        ...prev,
        hasSharedTweet: true
      }));
    }, 3000);
  }
  

  const handleTweetUrlInput = (url: string) => {
    setTweetUrl(url);
    // Не меняем условие сразу при вводе URL
    // Оно изменится после проверки
  }

  const handleVerifyTweet = async () => {
    if (!tweetUrl) {
      setError({ type: 'twitter', message: 'Please enter tweet URL' });
      return;
    }
  
    setIsVerifying(true); // Добавляем в начале
    try {
      const expectedWildRating = sessionStorage.getItem('wildRating');
      if (!expectedWildRating) {
        setError({ type: 'twitter', message: 'Please share the post first' });
        setIsVerifying(false); // Добавляем при ранней ошибке
        return;
      }
  
      const response = await fetch('/api/twitter/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tweetUrl, verificationCode: expectedWildRating })
      });
  
      const data = await response.json();
  
      if (data.verified) {
        setConditions(prev => ({
          ...prev,
          hasTweetUrlInput: true,
          twitterHandle: data.twitterHandle
        }));
        setError(null);
      } else {
        setError({ type: 'twitter', message: data.error || 'Invalid tweet' });
      }
    } catch (error) {
      console.error('Failed to verify tweet:', error);
      setError({ type: 'twitter', message: 'Failed to verify tweet' });
    } finally {
      setIsVerifying(false); // Добавляем в finally
    }
  }  

  const handleDiscordJoin = () => {
    window.open('https://discord.gg/ttte5Zqn9X', '_blank');
  }

  const handleDiscordCheck = async () => {
    setIsDiscordVerifying(true);
    try {
      const response = await fetch('/api/discord/auth');
      const { url } = await response.json();
  
      const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
  
      if (isMobile) {
        window.location.href = url;
      } else {
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
            setIsDiscordVerifying(false);
          }
        };
  
        window.addEventListener('message', handleMessage);
      }
    } catch (error) {
      console.error('Discord auth error:', error);
      setIsDiscordVerifying(false);
    }
  }

  const areAllConditionsMet = () => {
    return conditions.isWalletConnected && 
           conditions.isTwitterFollowed && 
           conditions.isDiscordJoined &&
           conditions.hasSharedTweet &&
           conditions.hasTweetUrlInput
  }

  return {
    conditions,
    tweetUrl,
    handleTwitterFollow,
    handleShareTweet,
    handleTweetUrlInput,
    handleVerifyTweet,    // Добавили эту функцию
    handleDiscordJoin,
    handleDiscordCheck,
    areAllConditionsMet
  }  
}