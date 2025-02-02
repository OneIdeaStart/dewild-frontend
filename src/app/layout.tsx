import type { Metadata, Viewport } from 'next';
import { headers } from 'next/headers';
import Script from 'next/script';
import ContextProvider from "@/context";
import Header from "@/components/layout/Header";
import { sofia } from '@/styles/fonts'
import { RootProvider } from '@/components/RootProvider';
import './globals.css';

const GA_TRACKING_ID = 'G-5Y83ZWN061';

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
      <head>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_TRACKING_ID}`}
        strategy="afterInteractive"
        crossOrigin="anonymous"
        // Добавляем SameSite атрибуты
        data-cookiesettings='{"SameSite":"Lax", "Secure":true}'
      />
      <Script 
        id="google-analytics" 
        strategy="afterInteractive"
      >
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){
            dataLayer.push(arguments);
          }
          gtag('js', new Date());
          gtag('config', '${GA_TRACKING_ID}', {
            page_path: window.location.pathname,
            cookie_flags: 'SameSite=Lax;Secure'  // Добавляем флаги для кук
          });
        `}
      </Script>
      </head>
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