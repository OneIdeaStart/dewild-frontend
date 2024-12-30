import type { Metadata } from 'next';
import { headers } from 'next/headers';
import ContextProvider from "@/context";
import { MintStageProvider } from '@/context/MintStageContext'; // Импортируем новый провайдер
import Header from "@/components/layout/Header";
import { Azeret_Mono, JetBrains_Mono } from 'next/font/google';
import './globals.css';

const azeretMono = Azeret_Mono({
  subsets: ['latin'],
  variable: '--font-azeret',
  preload: true,
  display: 'swap',
  weight: ['100', '200', '300', '400', '500', '700']
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin', 'cyrillic'],
  variable: '--font-jetbrains',
  preload: true,
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'DeWild',
  description: 'DeWild NFT Collection',
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieHeaders = await headers();
  const cookies = cookieHeaders.get("cookie");

  return (
    <html lang="en" className={`${azeretMono.variable} ${jetbrainsMono.variable}`}>
      <head>
        <link rel="icon" href="/favicon.ico" />
      </head>
      <body>
        <ContextProvider cookies={cookies}>
          <MintStageProvider> {/* Вкладываем новый провайдер */}
            <Header />
            {children}
          </MintStageProvider>
        </ContextProvider>
      </body>
    </html>
  );
}
