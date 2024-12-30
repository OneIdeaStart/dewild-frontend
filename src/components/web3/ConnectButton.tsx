// src/components/web3/ConnectButton.tsx
'use client';

import { Button } from '@/components/ui/button';
import { useAppKit, useAppKitAccount, useAppKitNetwork } from '@reown/appkit/react';
import { base } from '@reown/appkit/networks';

export default function ConnectButton() {
  const { open } = useAppKit();
  const { address, isConnected } = useAppKitAccount();
  const { chainId, switchNetwork } = useAppKitNetwork();

  const handleClick = async () => {
    try {
      if (isConnected) {
        // Если подключен - открываем меню аккаунта
        open({ view: 'Account' });
      } else {
        // Если не подключен - проверяем сеть и открываем меню подключения
        if (chainId !== base.id) {
          await switchNetwork(base);
        }
        open({ view: 'Connect' });
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