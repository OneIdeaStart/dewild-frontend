import type { Metadata, Viewport } from 'next';
import { headers } from 'next/headers';
import ContextProvider from "@/context";
import Header from "@/components/layout/Header";
import { sofia } from '@/styles/fonts'
import { RootProvider } from '@/components/RootProvider';
import './globals.css';

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
}

export const metadata: Metadata = {
  title: 'DeWild Club',
  description: 'Join the wild side of DeFi',
  icons: {
    icon: '/favicon.ico',
  },
  metadataBase: new URL('https://dewild.club'),
  openGraph: {
    type: 'website',
    title: 'DeWild Club',
    description: 'Join the wild side of DeFi 🦁',
    url: 'https://dewild.club',
    images: [{
      url: '/images/dewild-share.png',
      width: 1200,
      height: 630,
      alt: 'DeWild Club - Join the wild side',
    }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'DeWild Club',
    description: 'Join the wild side of DeFi 🦁',
    images: ['/images/dewild-share.png'],
  }
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
      <head />
      <body>
        <ContextProvider cookies={cookies}>
          <RootProvider>
            <Header />
            {children}
          </RootProvider>
        </ContextProvider>
      </body>
    </html>
  );
}