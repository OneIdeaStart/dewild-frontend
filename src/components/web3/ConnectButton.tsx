'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { useAppKit, useAppKitAccount, useAppKitNetwork } from '@reown/appkit/react';
import { useDisconnect } from 'wagmi';
import { base } from '@reown/appkit/networks';

export default function ConnectButton() {
  const { open } = useAppKit();
  const { address, isConnected } = useAppKitAccount();
  const { chainId, switchNetwork } = useAppKitNetwork();
  const { disconnect } = useDisconnect();

  const handleClick = async () => {
    try {
      if (isConnected) {
        open({ view: 'Account' });
      } else {
        await disconnect();
        
        if (typeof window !== 'undefined') {
          Object.keys(localStorage).forEach(key => {
            if (key.startsWith('wagmi') || key.startsWith('appkit')) {
              localStorage.removeItem(key);
            }
          });
        }

        await new Promise(resolve => setTimeout(resolve, 1000));

        if (chainId !== base.id) {
          await switchNetwork(base);
        }

        await open({ view: 'Connect' });
      }
    } catch (error) {
      console.error('Connection error:', error);
    }
  };

  useEffect(() => {
    if (!isConnected && typeof window !== 'undefined' && window.localStorage.getItem('wagmi.connected')) {
      localStorage.removeItem('wagmi.connected');
    }
  }, [isConnected]);

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