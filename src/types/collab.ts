export interface CollabEntry {
  w: string;  // wallet address
  d: string;  // discord
  t: string;  // twitter
}

export interface CollabStats {
  total: number;
  remaining: number;
  lastUpdated?: string;
  isFull: boolean;
}

export interface CollabCheckResponse {
  address?: {
    isApplied: boolean;
    position: number;
  };
  discord?: boolean;
  twitter?: boolean;
  stats: CollabStats;
}

export type CollabError = {
  type: 'address' | 'discord' | 'twitter' | 'server' | 'limit' | 'validation' | 'database';
  message: string;
} | null;