// src/types/whitelist.ts
export interface WhitelistEntry {
    address: string;
    discord: string;
    twitter: string;
    joinedAt: string;
  }
  
  export type WhitelistError = {
    type: 'address' | 'discord' | 'twitter' | 'server'
    message: string
  } | null