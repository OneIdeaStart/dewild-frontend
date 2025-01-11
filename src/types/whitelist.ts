export interface WhitelistEntry {
  w: string;  // wallet address
  d: string;  // discord
  t: string;  // twitter
}

export interface WhitelistStats {
  total: number;
  remaining: number;
  lastUpdated?: string;
  isFull: boolean;
}

export interface WhitelistCheckResponse {
  address?: {
    isWhitelisted: boolean;
    position: number;
  };
  discord?: boolean;
  twitter?: boolean;
  stats: WhitelistStats;
}

export type WhitelistError = {
  type: 'address' | 'discord' | 'twitter' | 'server' | 'limit' | 'validation' | 'database';
  message: string;
} | null;