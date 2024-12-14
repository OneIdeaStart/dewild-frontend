import type { Metadata } from "next";
import { headers } from "next/headers";
import ContextProvider from "@/context";
import Header from "@/components/layout/Header";
import { Azeret_Mono } from "next/font/google";
import "./globals.css";

const azeretMono = Azeret_Mono({
  subsets: ['latin'],
  variable: '--font-azeret',  // изменили здесь
  weight: ['400', '500', '600', '700'],
});

export const metadata: Metadata = {
  title: "DeWild",
  description: "DeWild NFT Collection",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieHeaders = await headers();
  const cookies = cookieHeaders.get("cookie");

  return (
    <html lang="en" className={azeretMono.variable}>
      <body className="font-mono bg-white text-black">
        <ContextProvider cookies={cookies}>
          <Header />
          {children}
        </ContextProvider>
      </body>
    </html>
  );
}
