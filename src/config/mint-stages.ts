// src/config/mint-stages.ts
import { MintStage, StageConfig } from '@/types/mint-stages';

export const STAGE_CONFIGS: Record<MintStage, StageConfig> = {
  [MintStage.WHITELIST_REGISTRATION]: {
    title: 'Phase 1. Join Whitelist',
    description: 'Join the whitelist and secure your spot for 999 free DeWild ones! Plus, 1111 more will be available for just 0.001 ETH.',
    price: '0',
    buttonText: 'JOIN WHITELIST',
    isWhitelistOnly: true,
  },
  [MintStage.FREE_MINT]: {
    title: 'Phase 2. Free mint',
    description: 'NFTs with instant reveal, exclusively for whitelisted degens.',
    price: '0',
    buttonText: 'FREE MINT',
    isWhitelistOnly: true,
    duration: 24 * 60 * 60,  // 24 часа
  },
  [MintStage.EARLY_ADOPTERS]: {
    title: 'Phase 3. Early adopters mint',
    description: 'First 24h: Whitelist only. NFTs with instant reveal and early supporter benefits.',
    price: '0.0011',
    buttonText: 'MINT 0.0011 ETH',
    isWhitelistOnly: true,
    duration: 24 * 60 * 60,
  },
  [MintStage.EARLY_ADOPTERS_PUBLIC]: {
    title: 'Phase 3. 🚀 Early adopters mint',  // Тот же заголовок, что показывает что это та же фаза
    description: 'Mint your NFT for 0.001 ETH. Open for everyone.',
    price: '0.0011',
    buttonText: 'MINT 0.0011 ETH',
    isWhitelistOnly: false,
  },
  [MintStage.FIXED_PRICE]: {
    title: 'Phase 4. Fixed price mint',
    description: 'Mint your NFT for 0.011 ETH.',
    price: '0.011',
    buttonText: 'MINT 0.011 ETH',
    isWhitelistOnly: false,
  },
  [MintStage.FINAL_AUCTION]: {
    title: 'Phase 5. English Auction',
    description: 'Bid for the final NFT #11,111.',
    price: 'Auction',
    buttonText: 'PLACE BID',
    isWhitelistOnly: false,
  },
  [MintStage.SOLD_OUT]: {
    title: 'Collection Sold Out',
    description: 'All NFTs have been minted.',
    price: '-',
    buttonText: 'VIEW ON OPENSEA',
    isWhitelistOnly: false,
  }
};