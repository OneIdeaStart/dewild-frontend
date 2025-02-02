'use client';

import { useEffect } from 'react';
import { useAppKit, useAppKitAccount, useAppKitNetwork } from '@reown/appkit/react';
import { useDisconnect } from 'wagmi';
import { base } from '@reown/appkit/networks';

export default function ConnectButton() {
  const { open } = useAppKit();
  const { address, isConnected } = useAppKitAccount();
  const { chainId, switchNetwork } = useAppKitNetwork();
  const { disconnect } = useDisconnect();

  // Оставляем всю логику как есть
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
    <button 
      onClick={handleClick}
      className="px-4 pt-[9px] pb-[7px] bg-white border-2 border-black rounded-[10px] flex items-center justify-center hover:bg-[#FFF7AC] transition-opacity"
      id="connect-wallet-button"
      type="button" // Явно указываем тип кнопки
    >
      <span 
        className="text-black text-base font-bold font-['Sofia Sans Extra Condensed'] uppercase leading-5"
        id="wallet-address-display"
      >
        {isConnected 
          ? `${address?.slice(0, 6)}...${address?.slice(-4)}`
          : 'Connect Wallet'
        }
      </span>
    </button>
  );
}