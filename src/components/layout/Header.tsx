'use client'
import Link from 'next/link'
import { Logo } from '../icons/logo'
import ConnectButton from '../web3/ConnectButton'

export default function Header() {
  return (
    <header className="fixed top-0 left-0 w-full backdrop-blur-lg bg-white/75 z-50">
      <div className="w-full mx-auto px-6 flex justify-between items-center py-3">
        <div className="flex items-center gap-10">
          <Link href="/" className="text-black hover:opacity-80 transition-opacity">
            <Logo />
          </Link>

          <nav className="flex gap-10">
            {[
              ['Collection', '/collection'],
              ['Stages', '/stages'],
              ['Roadmap', '/roadmap'],
              ['FAQ', '/faq']
            ].map(([label, href]) => (
              <Link
                key={label}
                href={href}
                className="text-[#002BFF] text-sm leading-5"
              >
                {label}
              </Link>
            ))}
          </nav>
        </div>

        <ConnectButton />
      </div>
    </header>
  )
}