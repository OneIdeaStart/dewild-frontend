import { useWhitelistConditions } from '@/hooks/useWhitelistConditions'
import { Button } from '@/components/ui/button'
import { Check } from 'lucide-react'
import { useState } from 'react'
import { useAppKitAccount } from '@reown/appkit/react'
import { WhitelistError } from '@/types/whitelist'

interface WhitelistDialogProps {
  onClose: (success?: boolean) => void
}

export default function WhitelistDialog({ onClose }: WhitelistDialogProps) {
  const { address } = useAppKitAccount()
  const { 
    conditions, 
    twitterHandle,
    handleTwitterFollow,
    handleTwitterHandleInput,
    handleDiscordJoin,
    handleDiscordCheck,
    areAllConditionsMet 
  } = useWhitelistConditions()

  const [showError, setShowError] = useState(false)
  const [whitelistError, setWhitelistError] = useState<WhitelistError>(null)
  
  const handleSubmit = async () => {
    if (!conditions.isWalletConnected) {
      setWhitelistError({ type: 'address', message: 'Please connect your wallet first' });
      return;
    }
    
    if (!conditions.isDiscordJoined) {
      setWhitelistError({ type: 'discord', message: 'Please join our Discord server' });
      return;
    }
    
    if (!conditions.isTwitterFollowed) {
      setWhitelistError({ type: 'twitter', message: 'Please follow us on X (Twitter)' });
      return;
    }
    
    if (!conditions.hasTwitterHandle) {
      setWhitelistError({ type: 'twitter', message: 'Please enter your X (Twitter) handle' });
      return;
    }
  
    try {
      const entry = {
        address: address!,
        discord: conditions.discordUsername,
        twitter: twitterHandle,
        joinedAt: new Date().toISOString()
      }
  
      const response = await fetch('/api/whitelist/join', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(entry)
      })
  
      if (!response.ok) {
        const data = await response.json()
        setWhitelistError(data.error)
        return
      }
  
      onClose(true) // передаем true при успешном добавлении
    } catch (error) {
      console.error('Submit error:', error)
      setWhitelistError({
        type: 'server',
        message: 'Failed to join whitelist'
      })
    }
  }

  return (
    <div className="flex flex-col w-full h-full relative pt-10 sm:pt-0">
      <div className="relative z-10">
        <div className="px-3 md:px-6 py-6 flex justify-between items-center">
          <h1 className="text-[24px] sm:text-[36px] font-mono font-normal leading-[36px] sm:leading-[48px]">Join whitelist</h1>
          <div className="w-[48px] h-[48px] relative">
            <svg 
              onClick={() => onClose(false)} 
              width="48" 
              height="48" 
              viewBox="0 0 48 48" 
              fill="none" 
              xmlns="http://www.w3.org/2000/svg"
              className="cursor-pointer"
            >
              <path d="M12.4501 37.6501L10.3501 35.5501L21.9001 24.0001L10.3501 12.4501L12.4501 10.3501L24.0001 21.9001L35.5501 10.3501L37.6501 12.4501L26.1001 24.0001L37.6501 35.5501L35.5501 37.6501L24.0001 26.1001L12.4501 37.6501Z" fill="black"/>
            </svg>
          </div>
        </div>

        <div className="px-3 md:px-6 mt-6 flex flex-col items-center gap-12">
          <div className="w-full max-w-[448px] flex flex-col gap-8">
            <div className="flex flex-col gap-8">
              {/* Wallet */}
              <div className="flex items-end whitespace-nowrap h-6">
                <span className="text-sm font-bold font-mono leading-6">1.</span>
                <span className="text-sm font-bold font-mono ml-2 leading-6">Connect wallet</span>
                <div className="flex-1 mx-4">
                  <div className="w-full border-b-2 border-dotted border-black translate-y-[-7px]"></div>
                </div>
                <div className="flex items-center gap-2">
                  {address && (
                    <span className="text-sm font-mono leading-6">{`${address.slice(0, 6)}...${address.slice(-4)}`}</span>
                  )}
                  {conditions.isWalletConnected && <Check className="w-5 h-5 text-[#03CB00]" />}
                </div>
              </div>

              {/* Discord */}
              <div className="flex items-end whitespace-nowrap h-6">
                <span className="text-sm font-bold font-mono leading-6">2.</span>
                <span className="text-sm font-bold font-mono ml-2 leading-6">Join our Discord</span>
                <div className="flex-1 mx-4">
                  <div className="w-full border-b-2 border-dotted border-black translate-y-[-7px]"></div>
                </div>
                {conditions.isDiscordJoined ? (
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-mono leading-6">
                      {conditions.discordUsername}
                    </span>
                    <Check className="w-5 h-5 text-[#03CB00]" />
                  </div>
                ) : (
                  <div className="flex items-center gap-1">
                    <button onClick={handleDiscordJoin} className="text-[#002BFF] text-sm font-mono leading-6 hover:underline">Join</button>
                    <span className="text-sm font-mono leading-6">|</span>
                    <button 
                      onClick={handleDiscordCheck}
                      className="text-[#002BFF] text-sm font-mono leading-6 hover:underline"
                    >
                      Check
                    </button>
                  </div>
                )}
              </div>

              {/* Twitter */}
              <div className="flex items-end whitespace-nowrap h-6">
                <span className="text-sm font-bold font-mono leading-6">3.</span>
                <span className="text-sm font-bold font-mono ml-2 leading-6">Follow us on X</span>
                <div className="flex-1 mx-4">
                  <div className="w-full border-b-2 border-dotted border-black translate-y-[-7px]"></div>
                </div>
                {conditions.isTwitterFollowed ? (
                  <Check className="w-5 h-5 text-[#03CB00]" />
                ) : (
                  <button onClick={handleTwitterFollow} className="text-[#002BFF] text-sm font-mono leading-6 hover:underline">Follow</button>
                )}
              </div>
            </div>

            {/* Twitter Handle Input */}
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold font-mono">4.</span>
                <span className="text-sm font-bold font-mono">Your X handle</span>
              </div>
              <div className="flex items-center border border-black px-4 py-2">
                <span className="text-sm font-mono">@</span>
                <input
                  value={twitterHandle}
                  onChange={(e) => handleTwitterHandleInput(e.target.value)}
                  placeholder="Your X handle"
                  className="w-full bg-transparent text-sm font-mono pl-1 outline-none placeholder:text-[#888888]"
                />
                {conditions.hasTwitterHandle && <Check className="w-5 h-5 text-[#03CB00]" />}
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col items-center gap-8">
              <Button
                onClick={handleSubmit}
                variant="primary"
                size="lg"
                className="w-full h-[40px] uppercase font-mono"
              >
                JOIN WHITELIST
              </Button>

              {whitelistError && (
                <p className="text-red-500 text-sm font-mono">
                  {whitelistError.message}
                </p>
              )}

              <button
                onClick={() => onClose(false)}
                className="text-[#002BFF] text-sm font-mono hover:underline"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}