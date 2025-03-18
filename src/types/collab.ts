// Add new statuses
export type ApplicationStatus = 
  | 'pending'
  | 'rejected'
  | 'approved'
  | 'prompt_received'
  | 'prompt_expired'
  | 'nft_pending'
  | 'nft_approved'
  | 'nft_rejected'
  | 'minted'
  | 'unminted';

// Update interface, adding new fields and using new status type
export interface CollabApplication {
  id: string;
  wallet: string;
  twitter: string;
  discord: string;
  status: string;
  createdAt: string;
  discordChannelId?: string;
  moderatorVotes: Array<{
    discordId: string;
    vote: 'approve' | 'reject';
    votedAt: string;
    comment?: string;
  }>;
  // Additional fields for NFT processing
  promptId?: string;
  promptAssignedAt?: string;
  imageUrl?: string;
  imageUploadedAt?: string;
  mintedAt?: string;
  nftNumber?: number;
  metadata?: {
    traits?: {
      animal: string;
      material: string;
      material_color: string;
      background: string;
      pattern_color: string;
      eyes_color: string;
    };
    statement?: string;
  };
}

// Also need to update CollabCheckResponse with new statuses
export interface CollabCheckResponse {
  address?: {
    isApplied: boolean;
    status?: ApplicationStatus;  // Update status type
    isFull: boolean;
  };
  discord?: boolean;
  twitter?: boolean;
  stats: CollabStats;
}

// Other interfaces remain unchanged
export interface CollabStats {
  total: number;
  pending: number;
  approved: number;
  rejected: number;
  remaining: number;
  isFull: boolean;
  extras?: {
    prompt_received: number;
    prompt_expired: number;
    nft_pending: number;
    nft_approved: number;
    nft_rejected: number;
    minted: number;
    unminted: number;
  };
}

export type CollabError = {
  type: 'address' | 'discord' | 'twitter' | 'server' | 'limit' | 'validation';
  message: string;
} | null;