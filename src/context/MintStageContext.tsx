"use client";

import React, { createContext, useContext, useState, useEffect } from 'react'
import { MintStage } from '@/types/mint-stages'
import { STAGE_CONFIGS } from '@/config/mint-stages'
import { useAppKitAccount } from '@reown/appkit/react'

interface MintStageContextValue {
  currentStage: MintStage
  isWhitelisted: boolean
  isLoading: boolean
  checkWhitelistStatus: () => Promise<void>
}

const MintStageContext = createContext<MintStageContextValue | undefined>(undefined)

export const MintStageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { address, isConnected } = useAppKitAccount()
  const [currentStage, setCurrentStage] = useState<MintStage>(MintStage.WHITELIST_REGISTRATION)
  const [isWhitelisted, setIsWhitelisted] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const checkWhitelistStatus = async () => {
      if (!address) return
      setIsLoading(true)
      try {
        const response = await fetch(`/api/whitelist/check?address=${address}`)
        const data = await response.json()
        // Используем data.address.isWhitelisted вместо data.address
        setIsWhitelisted(data.address?.isWhitelisted || false)
      } catch (error) {
        console.error('Error checking whitelist status:', error)
        setIsWhitelisted(false)
      } finally {
        setIsLoading(false)
      }
  }

  useEffect(() => {
    if (isConnected) {
      checkWhitelistStatus()
    }
  }, [address, isConnected])

  return (
    <MintStageContext.Provider
      value={{
        currentStage,
        isWhitelisted,
        isLoading,
        checkWhitelistStatus,
      }}
    >
      {children}
    </MintStageContext.Provider>
  )
}

export const useMintStageContext = () => {
  const context = useContext(MintStageContext)
  if (!context) {
    throw new Error('useMintStageContext must be used within a MintStageProvider')
  }
  return context
}
