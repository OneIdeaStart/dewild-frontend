import { cookieStorage, createStorage } from '@wagmi/core';
import { WagmiAdapter } from '@reown/appkit-adapter-wagmi';
import { base, baseSepolia } from '@reown/appkit/networks';
import { createAppKit } from '@reown/appkit/react';
import { http } from 'viem';
import { injected } from '@wagmi/connectors';

if (!process.env.NEXT_PUBLIC_PROJECT_ID) throw new Error('NEXT_PUBLIC_PROJECT_ID is not defined');

export const projectId = process.env.NEXT_PUBLIC_PROJECT_ID;

export const wagmiAdapter = new WagmiAdapter({
  networks: [base, baseSepolia],
  projectId,
  storage: createStorage({
    storage: typeof window !== 'undefined' ? window.localStorage : undefined
  }),
  transports: {
    [base.id]: http('https://mainnet.base.org'),
    [baseSepolia.id]: http('https://sepolia.base.org')
  },
  connectors: [injected({
    shimDisconnect: true
  })]
});

export const modal = createAppKit({
  adapters: [wagmiAdapter],
  projectId,
  networks: [base, baseSepolia], // Добавьте baseSepolia
  defaultNetwork: baseSepolia,
  metadata: {
    name: 'DeWild',
    description: 'NFT Platform',
    url: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
    icons: []
  }
});