// src/types/whitelist.ts

export interface WhitelistEntry {
  address: string;
  discord: string;
  twitter: string;
  joinedAt: string;
}

export interface WhitelistStats {
  total: number;
  remaining: number;
  lastUpdated?: string;
  isFull: boolean;
}

export interface WhitelistCheckResponse {
  address?: boolean;
  discord?: boolean;
  twitter?: boolean;
  stats: WhitelistStats;
}

export type WhitelistError = {
  type: 'address' | 'discord' | 'twitter' | 'server' | 'limit' | 'validation' | 'database';
  message: string;
} | null;