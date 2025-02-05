export interface CollabApplication {
  id: string;              // Wild Rating ID (DWXXXXXX)
  wallet: string;          // адрес кошелька
  twitter: string;         // twitter handle
  discord: string;         // discord handle
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
  moderatorVotes: {
    discordId: string;     // discord ID модератора
    vote: 'approve' | 'reject';
    votedAt: string;
    comment?: string;
  }[];
}

export interface CollabStats {
  total: number;
  pending: number;
  approved: number;
  rejected: number;
  remaining: number;
  isFull: boolean;
}

export interface CollabCheckResponse {
  address?: {
    isApplied: boolean;
    status?: 'pending' | 'approved' | 'rejected';
    isFull: boolean;
  };
  discord?: boolean;
  twitter?: boolean;
  stats: CollabStats;
}

export type CollabError = {
  type: 'address' | 'discord' | 'twitter' | 'server' | 'limit' | 'validation';
  message: string;
} | null;