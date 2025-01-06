import type { Metadata } from 'next';
import { headers } from 'next/headers';
import ContextProvider from "@/context";
import { MintStageProvider } from '@/context/MintStageContext';
import Header from "@/components/layout/Header";
import { sofia } from '@/styles/fonts'
import './globals.css';

export const metadata: Metadata = {
  title: 'DeWild',
  description: 'DeWild NFT Collection',
  icons: {
    icon: '/favicon.ico',
  },
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieHeaders = await headers();
  const cookies = cookieHeaders.get("cookie");

  return (
    <html lang="en" className={sofia.variable}>
      <body>
        <ContextProvider cookies={cookies}>
          <MintStageProvider>
            <Header />
            {children}
          </MintStageProvider>
        </ContextProvider>
      </body>
    </html>
  );
}