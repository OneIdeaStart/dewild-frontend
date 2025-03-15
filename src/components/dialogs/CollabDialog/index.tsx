import { useCollabConditions } from '@/hooks/useCollabConditions'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent } from '@/components/ui/dialog'
import { Check } from 'lucide-react'
import { useState, useEffect } from 'react'
import { useAppKitAccount } from '@reown/appkit/react'
import { CollabError, CollabStats } from '@/types/collab'

interface CollabDialogProps {
  onClose: (success?: boolean) => void
}

export default function CollabDialog({ onClose }: CollabDialogProps) {
  const { address } = useAppKitAccount()
  const [collabError, setCollabError] = useState<CollabError>(null)
  const [collabStats, setCollabStats] = useState<CollabStats | null>(null)
  const [isVerifying, setIsVerifying] = useState(false)
  const [isDiscordVerifying, setIsDiscordVerifying] = useState(false)
  // Добавляем новое состояние для отслеживания процесса отправки заявки
  const [isSubmitting, setIsSubmitting] = useState(false)

  const { 
    conditions, 
    tweetUrl,
    handleTwitterFollow,
    handleShareTweet,
    handleTweetUrlInput,
    handleVerifyTweet,
    handleDiscordJoin,
    handleDiscordCheck,
    areAllConditionsMet 
  } = useCollabConditions(setCollabError, setIsVerifying, setIsDiscordVerifying)

  const fetchCollabStats = async () => {
    try {
      const response = await fetch('/api/collab/check')
      const data = await response.json()
      setCollabStats(data.stats)
    } catch (error) {
      console.error('Failed to fetch collab stats:', error)
    }
  }

  useEffect(() => {
    fetchCollabStats()
  }, [])

  const handleSubmit = async () => {
    if (!conditions.isDiscordJoined) {
      setCollabError({ type: 'discord', message: 'Please join our Discord server' })
      return
    }
   
    if (!conditions.isTwitterFollowed) {
      setCollabError({ type: 'twitter', message: 'Please follow us on X (Twitter)' })
      return
    }
   
    if (!conditions.hasSharedTweet) {
      setCollabError({ type: 'twitter', message: 'Please share the post on X (Twitter)' })
      return
    }

    if (!conditions.hasTweetUrlInput) {
      setCollabError({ type: 'twitter', message: 'Please verify your tweet' });
      return;
    }

    if (collabStats?.isFull) {
      setCollabError({ type: 'limit', message: 'Collaboration list is full' })
      return
    }

    // Устанавливаем состояние отправки в true
    setIsSubmitting(true)

    try {
      const entry = {
        wallet: address!,
        discord: conditions.discordUsername,
        twitter: conditions.twitterHandle
      }
  
      const response = await fetch('/api/collab/join', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(entry)
      })

      const data = await response.json()

      if (!response.ok) {
        setCollabError(data.error)
        // Сбрасываем состояние отправки при ошибке
        setIsSubmitting(false)
        return
      }

      if (data.success) {
        fetchCollabStats()
      }

      onClose(true)
    } catch (error) {
      console.error('Submit error:', error)
      setCollabError({
        type: 'server',
        message: 'Failed to submit collab application'
      })
      // Сбрасываем состояние отправки при ошибке
      setIsSubmitting(false)
    }
  }

  return (
    <div className="relative flex flex-col items-center w-full h-full">
      <div className="relative z-10 flex flex-col items-center gap-8 px-3 mt-20 sm:mt-8 w-full max-w-[448px]">
        {/* Header */}
        <div className="flex justify-between items-center w-full">
          <h1 className="text-[48px] font-extrabold uppercase leading-[48px]">
            Apply for Collab
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
            <path d="M12.4501 37.6501L10.3501 35.5501L21.9001 24.0001L10.3501 12.4501L12.4501 10.3501L24.0001 21.9001L35.5501 10.3501L37.6501 12.4501L26.1001 24.0001L37.6501 35.5501L35.5501 37.6501L24.0001 26.1001L12.4501 37.6501Z" fill="black" />
          </svg>
        </div>

        <div className="flex flex-col gap-3 w-full">
          {/* Step 1: Connect Wallet */}
          <div className="bg-accent-blue p-4 rounded-[16px] flex justify-between items-center">
            <div className="text-[#7EF3E1] text-[24px] leading-[24px] font-extrabold uppercase">
              01. Connect wallet
            </div>
            <div className="flex items-center gap-2">
              <div 
                className="text-[#7EF3E1] text-[24px] leading-[24px] font-extrabold uppercase"
                id="wallet-address"
              >
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
                  className="w-[54px]"
                  withLoader
                  isLoading={isDiscordVerifying}
                  disabled={isDiscordVerifying}
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

          {/* Step 4: Share post */}
          <div className="bg-accent-green p-4 rounded-[16px] flex justify-between items-center">
            <div className="text-[#99C1D7] text-[24px] leading-[24px] font-extrabold uppercase">
              04. Share post on X.com
            </div>
            {conditions.hasSharedTweet ? (
              <div className="flex items-center gap-2">
                <Check className="w-6 h-6 text-[#FDC867]" />
              </div>
            ) : (
              <Button
                onClick={handleShareTweet}
                variant="primary"
                size="sm"
              >
                Share
              </Button>
            )}
          </div>

          {/* Step 5: Tweet URL */}
          <div className="bg-accent-yellow p-4 rounded-[16px] flex flex-col gap-2">
            <div className="flex justify-between items-center">
              <div className="text-[#48926D] text-[24px] leading-[24px] font-extrabold uppercase">
                05. Shared Post URL
              </div>
              {conditions.hasTweetUrlInput && <Check className="w-6 h-6 text-[#48926D]" />}
            </div>
            <div className="flex items-center gap-2">
            <div className="flex-1 bg-white text-black text-[24px] leading-[24px] font-extrabold uppercase py-2 pl-3 pr-2 rounded-[12px] border border-black flex justify-between items-center">
              <input
                value={tweetUrl}
                onChange={(e) => handleTweetUrlInput(e.target.value)}
                placeholder="Paste your tweet URL here"
                className="outline-none w-[calc(100%-68px)]" // вычитаем ширину кнопки и отступ
                id="tweet-url"
                name="tweet-url"
              />
              <Button
                onClick={handleVerifyTweet}
                variant="primary"
                size="sm"
                className="w-[54px]"
                withLoader
                isLoading={isVerifying}
                disabled={isVerifying}
              >
                Check
              </Button>
            </div>
            </div>
          </div>
        </div>

        <div className="relative w-full max-w-[448px]">
          {collabError && (
            <div className="absolute top-[-48px] left-[50%] transform -translate-x-[50%] flex flex-col items-center">
              <div className="bg-[#D90004] rounded-[8px] px-4 py-2 text-white text-[16px] font-extrabold uppercase text-center whitespace-nowrap">
                {collabError.message}
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
              disabled={collabStats?.isFull || isSubmitting}
              withLoader
              isLoading={isSubmitting}
            >
              {collabStats?.isFull ? 'COLLAB LIST FULL' : 'Submit Application'}
            </Button>
            <button
              onClick={() => onClose(false)}
              className="text-black text-[24px] font-extrabold uppercase w-full"
              disabled={isSubmitting}
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}