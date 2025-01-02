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
        // Если не подключен, сначала очищаем предыдущие подключения
        if (window.localStorage.getItem('wagmi.wallet')) {
          await disconnect();
          // Даем время на очистку состояния
          await new Promise(resolve => setTimeout(resolve, 500));
        }

        if (chainId !== base.id) {
          await switchNetwork(base);
        }

        // Теперь пробуем подключиться
        try {
          await open({ view: 'Connect' });
        } catch (connectionError: any) {
          if (connectionError?.message?.includes('Connection declined')) {
            // Даем еще время и пробуем снова
            await new Promise(resolve => setTimeout(resolve, 1000));
            await open({ view: 'Connect' });
          }
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