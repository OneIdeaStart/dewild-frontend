// Добавляем новые статусы
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

// Обновляем интерфейс, добавляя новые поля и используя новый тип статуса
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
  // Дополнительные поля для обработки NFT
  promptId?: string;
  promptAssignedAt?: string;
  imageUrl?: string;
  imageUploadedAt?: string;
  mintedAt?: string;
  // Метаданные NFT
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

// Также нужно обновить CollabCheckResponse с новыми статусами
export interface CollabCheckResponse {
  address?: {
    isApplied: boolean;
    status?: ApplicationStatus;  // обновляем тип статуса
    isFull: boolean;
  };
  discord?: boolean;
  twitter?: boolean;
  stats: CollabStats;
}

// Остальные интерфейсы остаются без изменений
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