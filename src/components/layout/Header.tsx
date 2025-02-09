'use client'

import { useEffect, useState } from 'react'
import { Logo } from '../icons/logo'
import ConnectButton from '../web3/ConnectButton'

export default function Header() {
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setTimeout(() => {
      setIsLoaded(true);
    }, 0); // 1.4s - 0.2s = 1.2s
  }, []);

  return (
    <header className={`fixed top-0 left-0 right-0 px-4 pt-4 w-full min-w-[320px] z-50 -translate-y-full ${
      isLoaded ? 'animate-header-slide' : ''
    }`}>
      <div className="mx-auto relative flex justify-between items-center"> {/* Добавили flex контейнер */}
        {/* Social Icons - скрываем на мобильных */}
        <div className="hidden sm:flex items-center gap-2">
          {/* Twitter/X */}
          <a 
            href="https://x.com/DeWildClub" 
            target="_blank"
            className="w-10 h-10 bg-white rounded-lg flex items-center justify-center hover:opacity-80 transition-opacity"
          >
            <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M25.2213 12H27.9803L21.9224 18.7897L29 28H23.4459L19.0973 22.403L14.119 28H11.3599L17.7777 20.738L11 12H16.6921L20.6208 17.1129L25.2213 12ZM24.2556 26.4059H25.7851L15.8884 13.5351H14.2449L24.2556 26.4059Z" fill="black"/>
            </svg>
          </a>
          {/* Discord */}
          <a 
            href="https://discord.gg/ygh7CtbNZe" 
            target="_blank"
            className="w-10 h-10 bg-white rounded-lg flex items-center justify-center hover:opacity-80 transition-opacity"
          >
            <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M26.9419 13.34C25.6473 12.714 24.263 12.2591 22.8157 12C22.638 12.3321 22.4304 12.7788 22.2872 13.1341C20.7488 12.895 19.2245 12.895 17.7143 13.1341C17.5712 12.7788 17.3588 12.3321 17.1795 12C15.7307 12.2591 14.3448 12.7157 13.0502 13.3433C10.4389 17.4214 9.73099 21.3981 10.0849 25.3184C11.8169 26.655 13.4953 27.467 15.1455 27.9984C15.5529 27.4189 15.9163 26.8028 16.2293 26.1536C15.6331 25.9195 15.0621 25.6306 14.5226 25.2952C14.6657 25.1856 14.8057 25.071 14.941 24.9531C18.2318 26.5438 21.8074 26.5438 25.0589 24.9531C25.1958 25.071 25.3358 25.1856 25.4774 25.2952C24.9362 25.6322 24.3637 25.9211 23.7675 26.1553C24.0805 26.8028 24.4423 27.4205 24.8513 28C26.503 27.4687 28.183 26.6567 29.915 25.3184C30.3303 20.7738 29.2056 16.8336 26.9419 13.34ZM16.6776 22.9075C15.6898 22.9075 14.8796 21.9543 14.8796 20.7937C14.8796 19.6331 15.6725 18.6783 16.6776 18.6783C17.6829 18.6783 18.493 19.6314 18.4757 20.7937C18.4772 21.9543 17.6829 22.9075 16.6776 22.9075ZM23.3223 22.9075C22.3344 22.9075 21.5243 21.9543 21.5243 20.7937C21.5243 19.6331 22.3171 18.6783 23.3223 18.6783C24.3275 18.6783 25.1376 19.6314 25.1203 20.7937C25.1203 21.9543 24.3275 22.9075 23.3223 22.9075Z" fill="black"/>
            </svg>
          </a>
        </div>

        {/* Logo - на мобильных слева */}
        <div className="sm:absolute sm:left-1/2 sm:top-0 sm:-translate-x-1/2">
          <a 
            href="#top"
            className="w-10 h-10 pl-[2px] bg-white rounded-lg flex items-center justify-center hover:opacity-80 transition-opacity"
            onClick={(e) => {
              e.preventDefault();
              window.scrollTo({top: 0, behavior: 'smooth'});
            }}
          >
            <Logo />
          </a>
        </div>

        {/* Connect Wallet Button */}
        <div className="sm:absolute sm:right-0">
          <ConnectButton />
        </div>
      </div>
    </header>
  )
}