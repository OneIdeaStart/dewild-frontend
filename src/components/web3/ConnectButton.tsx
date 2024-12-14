'use client';

import { Button } from '@/components/ui/button';
import { useAppKit, useAppKitAccount, useAppKitNetwork } from '@reown/appkit/react';
import { base } from '@reown/appkit/networks';

export default function ConnectButton() {
  const { open } = useAppKit();
  const { address, isConnected } = useAppKitAccount();
  const { chainId, switchNetwork } = useAppKitNetwork();

  const handleConnect = async () => {
    // Если сеть неверная, сначала переключаем на Base
    if (chainId !== base.id) {
      try {
        await switchNetwork(base);
      } catch (error) {
        console.error('Failed to switch network:', error);
        // Открываем модал для ручного переключения
        open({ view: 'Networks' });
        return;
      }
    }
    open({ view: 'Connect' });
  };

  const handleAccountModal = () => {
    if (chainId !== base.id) {
      // Если неверная сеть, показываем модал переключения сети
      open({ view: 'Networks' });
      return;
    }
    open({ view: 'Account' });
  };

  // Отображение индикатора неверной сети
  if (isConnected && chainId !== base.id) {
    return (
      <Button
        onClick={() => open({ view: 'Networks' })}
        variant="default"
        size="default"
        className="shadow-[-4px_4px_0px_0px_#000000] uppercase flex items-center gap-2 bg-red-500 text-white"
      >
        Switch to Base
      </Button>
    );
  }

  if (!isConnected) {
    return (
      <Button
        onClick={handleConnect}
        variant="default"
        size="default"
        className="shadow-[-4px_4px_0px_0px_#000000] uppercase"
      >
        Connect Wallet
      </Button>
    );
  }

  return (
    <Button
      onClick={handleAccountModal}
      variant="default"
      size="default"
      className="shadow-[-4px_4px_0px_0px_#000000] uppercase flex items-center gap-2"
    >
      {/* Индикатор Base Network */}
      <div className="w-2 h-2 rounded-full bg-green-500" />
      <span>{`${address?.slice(0, 6)}...${address?.slice(-4)}`}</span>
    </Button>
  );
}