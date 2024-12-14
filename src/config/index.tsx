import { cookieStorage, createStorage } from '@wagmi/core';
import { WagmiAdapter } from '@reown/appkit-adapter-wagmi';
import { base } from '@reown/appkit/networks';
import { createAppKit } from '@reown/appkit/react';

// Project ID
export const projectId = process.env.NEXT_PUBLIC_PROJECT_ID;

if (!projectId) {
  throw new Error('Project ID is not defined');
}

// Networks
export const networks = [base];

// Wagmi Adapter Configuration
export const wagmiAdapter = new WagmiAdapter({
  storage: createStorage({ storage: cookieStorage }),
  ssr: true,
  projectId,
  networks,
});

export const config = wagmiAdapter.wagmiConfig;

// Modal Initialization
export const modal = createAppKit({
  adapters: [wagmiAdapter],
  projectId,
  networks: [base], // Только Base сеть
  defaultNetwork: base,
  metadata: {
    name: 'DeWild',
    description: 'NFT Platform',
    url: 'https://dewild.example.com',
    icons: [],
  },
});
