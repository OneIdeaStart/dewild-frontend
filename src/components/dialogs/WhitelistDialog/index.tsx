import { useWhitelistConditions } from '@/hooks/useWhitelistConditions'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent } from '@/components/ui/dialog'
import { Check } from 'lucide-react'
import { useState, useEffect } from 'react'
import { useAppKitAccount } from '@reown/appkit/react'
import { WhitelistError, WhitelistStats } from '@/types/whitelist'

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

  const [whitelistError, setWhitelistError] = useState<WhitelistError>(null)
  const [whitelistStats, setWhitelistStats] = useState<WhitelistStats | null>(null)

  const fetchWhitelistStats = async () => {
    try {
      const response = await fetch('/api/whitelist/check')
      const data = await response.json()
      setWhitelistStats(data.stats)
    } catch (error) {
      console.error('Failed to fetch whitelist stats:', error)
    }
  }

  useEffect(() => {
    fetchWhitelistStats()
  }, [])
 
  const handleSubmit = async () => {
    if (!conditions.isDiscordJoined) {
      setWhitelistError({ type: 'discord', message: 'Please join our Discord server' })
      return
    }
   
    if (!conditions.isTwitterFollowed) {
      setWhitelistError({ type: 'twitter', message: 'Please follow us on X (Twitter)' })
      return
    }
   
    if (!conditions.hasTwitterHandle) {
      setWhitelistError({ type: 'twitter', message: 'Please enter your X (Twitter) handle' })
      return
    }

    if (whitelistStats?.isFull) {
      setWhitelistError({ type: 'limit', message: 'Whitelist is full' })
      return
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
 
      const data = await response.json()

      if (!response.ok) {
        setWhitelistError(data.error)
        return
      }

      if (data.success) {
        fetchWhitelistStats()
      }
 
      onClose(true)
    } catch (error) {
      console.error('Submit error:', error)
      setWhitelistError({
        type: 'server',
        message: 'Failed to join whitelist'
      })
    }
  }

  return (
    <div className="relative flex flex-col items-center w-full h-full">
      <div className="relative z-10 flex flex-col items-center gap-8 px-3 mt-20 sm:mt-8 w-full max-w-[448px]">
        {/* Header */}
        <div className="flex justify-between items-center w-full">
          <h1 className="text-[48px] font-extrabold uppercase leading-[48px]">
            Join whitelist
          </h1>
          <svg
            onClick={() => onClose(false)}
            width="48"
            height="48"
            viewBox="0 0 48 48"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="cursor-pointer"
          >
            <path
              d="M12.4501 37.6501L10.3501 35.5501L21.9001 24.0001L10.3501 12.4501L12.4501 10.3501L24.0001 21.9001L35.5501 10.3501L37.6501 12.4501L26.1001 24.0001L37.6501 35.5501L35.5501 37.6501L24.0001 26.1001L12.4501 37.6501Z"
              fill="black"
            />
          </svg>
        </div>
  
        <div className="flex flex-col gap-3 w-full">
          {/* Step 1: Connect Wallet */}
          <div className="bg-accent-blue p-4 rounded-[16px] flex justify-between items-center">
            <div className="text-[#7EF3E1] text-[24px] leading-[24px] font-extrabold uppercase">
              01. Connect wallet
            </div>
            <div className="flex items-center gap-2">
              <div className="text-[#7EF3E1] text-[24px] leading-[24px] font-extrabold uppercase">
                {address ? `${address.slice(0, 6)}...${address.slice(-4)}` : 'Not connected'}
              </div>
              {conditions.isWalletConnected && <Check className="w-6 h-6 text-[#7EF3E1]" />}
            </div>
          </div>
  
          {/* Step 2: Join Discord */}
          <div className="bg-accent-pink p-4 rounded-[16px] flex justify-between items-center">
            <div className="text-[#026551] text-[24px] leading-[24px] font-extrabold uppercase">
              02. Join Discord
            </div>
            {conditions.isDiscordJoined ? (
              <div className="flex items-center gap-2">
                <div className="text-[#026551] text-[24px] leading-[24px] font-extrabold uppercase">
                  {conditions.discordUsername}
                </div>
                <Check className="w-6 h-6 text-[#026551]" />
              </div>
            ) : (
              <div className="flex gap-2">
                <Button
                  onClick={handleDiscordJoin}
                  variant="primary"
                  size="sm"
                >
                  Join
                </Button>
                <Button
                  onClick={handleDiscordCheck}
                  variant="primary"
                  size="sm"
                >
                  Check
                </Button>
              </div>
            )}
          </div>
  
          {/* Step 3: Follow on X */}
          <div className="bg-accent-burgundy p-4 rounded-[16px] flex justify-between items-center">
            <div className="text-[#FDC867] text-[24px] leading-[24px] font-extrabold uppercase">
              03. Follow us on X.com
            </div>
            {conditions.isTwitterFollowed ? (
              <div className="flex items-center gap-2">
                <Check className="w-6 h-6 text-[#FDC867]" />
              </div>
            ) : (
              <Button
                onClick={handleTwitterFollow}
                variant="primary"
                size="sm"
              >
                Follow
              </Button>
            )}
          </div>
  
          {/* Step 4: Twitter Handle */}
          <div className="bg-accent-yellow p-4 rounded-[16px] flex flex-col gap-2">
            <div className="flex justify-between items-center">
              <div className="text-[#48926D] text-[24px] leading-[24px] font-extrabold uppercase">
                04. Your X handle
              </div>
              {conditions.hasTwitterHandle && <Check className="w-6 h-6 text-[#48926D]" />}
            </div>
            <div className="flex items-center bg-white text-black text-[24px] leading-[24px] font-extrabold uppercase py-2 px-4 rounded-[12px] border border-black">
              <span className="mr-2">@</span>
              <input
                value={twitterHandle}
                onChange={(e) => handleTwitterHandleInput(e.target.value)}
                placeholder="Your X handle"
                className="w-full outline-none"
              />
            </div>
          </div>
        </div>
 
        <div className="relative w-full max-w-[448px]">
          {whitelistError && (
            <div className="absolute top-[-48px] left-[50%] transform -translate-x-[50%] flex flex-col items-center">
              <div className="bg-[#D90004] rounded-[8px] px-4 py-2 text-white text-[16px] font-extrabold uppercase text-center min-w-[250px]">
                {whitelistError.message}
              </div>
              <div className="w-0 h-0 border-l-[8px] border-l-transparent border-r-[8px] border-r-transparent border-t-[8px] border-t-[#D90004] mt-[-1px]"></div>
            </div>
          )}
          <div className="flex flex-col gap-4">
            <Button
              onClick={handleSubmit}
              variant="primary"
              size="lg"
              className="w-full"
              disabled={whitelistStats?.isFull}
            >
              {whitelistStats?.isFull ? 'WHITELIST FULL' : 'JOIN WHITELIST'}
            </Button>
            <button
              onClick={() => onClose(false)}
              className="text-black text-[24px] font-extrabold uppercase w-full"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}