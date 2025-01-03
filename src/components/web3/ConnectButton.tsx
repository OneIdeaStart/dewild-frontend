'use client';

import { Button } from '@/components/ui/button';
import { useAppKit, useAppKitAccount, useAppKitNetwork } from '@reown/appkit/react';
import { useDisconnect } from 'wagmi'; // Добавляем этот импорт
import { base } from '@reown/appkit/networks';

export default function ConnectButton() {
  const { open } = useAppKit();
  const { address, isConnected } = useAppKitAccount();
  const { chainId, switchNetwork } = useAppKitNetwork();
  const { disconnect } = useDisconnect(); // Используем wagmi disconnect

  const handleClick = async () => {
    try {
      if (isConnected) {
        open({ view: 'Account' });
      } else {
        // Проверяем сеть перед подключением
        if (chainId !== base.id) {
          await switchNetwork(base);
        }
  
        // Пытаемся подключиться
        try {
          await open({ view: 'Connect' });
        } catch (connectionError: any) {
          console.error('Initial connection error:', connectionError);
          // Если есть ошибка подключения, очищаем состояние
          await disconnect();
          // Даем время на очистку состояния
          await new Promise(resolve => setTimeout(resolve, 500));
          // Пробуем снова
          await open({ view: 'Connect' });
        }
      }
    } catch (error) {
      console.error('Connection error:', error);
    }
  };

  return (
    <Button
      onClick={handleClick}
      variant="default"
      size="default"
      className="shadow-[-4px_4px_0px_0px_#000000] uppercase min-w-[160px]"
    >
      {isConnected 
        ? `${address?.slice(0, 6)}...${address?.slice(-4)}`
        : 'Connect Wallet'
      }
    </Button>
  );
}