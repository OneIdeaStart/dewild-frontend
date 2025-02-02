// src/context/index.tsx
'use client';

import { wagmiAdapter, projectId } from '../config';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { base } from '@reown/appkit/networks';
import { createAppKit } from '@reown/appkit/react';
import React, { type ReactNode } from 'react';
import { cookieToInitialState, WagmiProvider, type Config } from 'wagmi';

const queryClient = new QueryClient();

type Props = {
  children: ReactNode;
  cookies: string | null;
};

function ContextProvider({ children, cookies }: Props) {
  if (!projectId) {
    throw new Error('NEXT_PUBLIC_PROJECT_ID is not defined');
  }

  const modal = createAppKit({
    adapters: [wagmiAdapter],
    projectId,
    networks: [base],
    defaultNetwork: base,
    metadata: {
      name: 'DeWild',
      description: 'NFT Collection',
      url: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
      icons: []
    },
    features: {
      analytics: true,
    },
  });

  return (
    <WagmiProvider config={wagmiAdapter.wagmiConfig as Config}>
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    </WagmiProvider>
  );
}

export default ContextProvider;