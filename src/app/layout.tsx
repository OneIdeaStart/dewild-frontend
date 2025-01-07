import type { Metadata } from 'next';
import { headers } from 'next/headers';
import ContextProvider from "@/context";
import { MintStageProvider } from '@/context/MintStageContext';
import Header from "@/components/layout/Header";
import { sofia } from '@/styles/fonts'
import './globals.css';

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