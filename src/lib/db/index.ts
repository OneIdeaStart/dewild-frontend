// src/lib/db/index.ts
import { kv } from '@vercel/kv';
import { CollabApplication, CollabStats, ApplicationStatus } from '@/types/collab';
import { generateWildRating } from '@/lib/utils';
import { PromptData, PromptStatus, PROMPT_KEYS } from '@/types/prompt';
import { del } from '@vercel/blob';
import { DiscordDB } from './discord';

const COLLAB_LIMIT = 11111;

// Use same interface as in CollabApplication
type ApplicationRecord = {
  [key: string]: unknown;
} & CollabApplication;

export class DB {
  static readonly KEYS = {
    ALL_APPLICATIONS: 'applications:all',    
    PENDING: 'applications:pending',         
    APPROVED: 'applications:approved',       
    REJECTED: 'applications:rejected',
    // Add new keys for statuses
    PROMPT_RECEIVED: 'applications:prompt_received',
    PROMPT_EXPIRED: 'applications:prompt_expired',
    NFT_PENDING: 'applications:nft_pending',
    NFT_APPROVED: 'applications:nft_approved',
    NFT_REJECTED: 'applications:nft_rejected',
    MINTED: 'applications:minted',
    UNMINTED: 'applications:unminted',
    BY_WALLET: 'applications:by:wallet',     
    BY_TWITTER: 'applications:by:twitter'    
  };

  static async getApplicationById(id: string): Promise<CollabApplication | null> {
    const record = await kv.hgetall<ApplicationRecord>(`application:${id}`);
    if (!record) return null;
    
    // Convert record from Redis to CollabApplication
    const application: CollabApplication = {
      id: record.id,
      wallet: record.wallet,
      twitter: record.twitter,
      discord: record.discord,
      status: record.status,
      createdAt: record.createdAt,
      moderatorVotes: record.moderatorVotes,
      discordChannelId: record.discordChannelId,
      promptId: record.promptId,
      promptAssignedAt: record.promptAssignedAt,
      imageUrl: record.imageUrl,
      imageUploadedAt: record.imageUploadedAt,
      mintedAt: record.mintedAt,
      metadata: record.metadata
    };
  
    // Now check if metadata needs parsing, if it's a string
    if (application.metadata && typeof application.metadata === 'string') {
      try {
        application.metadata = JSON.parse(application.metadata as string);
      } catch (e) {
        // Error during parsing, but continue execution
      }
    }
  
    return application;
  }

  static async getAllApplications(status?: string, search?: string): Promise<CollabApplication[]> {
    // If status specified, take from corresponding set
    const setKey = status ? `applications:${status}` : this.KEYS.ALL_APPLICATIONS;
    const applicationIds = await kv.smembers(setKey);
    
    // Get data of each application
    const applications = await Promise.all(
      applicationIds.map(id => this.getApplicationById(id))
    );
  
    // Filter null values
    const filteredApps = applications.filter((app): app is CollabApplication => app !== null);
  
    // Apply search if specified
    if (search) {
      const searchLower = search.toLowerCase();
      return filteredApps.filter(app => 
        app.twitter.toLowerCase().includes(searchLower) ||
        app.discord.toLowerCase().includes(searchLower) ||
        app.wallet.toLowerCase().includes(searchLower)
      );
    }
  
    // Sort by creation date (newest first)
    return filteredApps.sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  static async getApplicationByWallet(wallet: string): Promise<CollabApplication | null> {
    const id = await kv.hget<string>(this.KEYS.BY_WALLET, wallet.toLowerCase());
    if (!id) return null;
    return this.getApplicationById(id);
  }

  static async getApplicationByTwitter(twitter: string): Promise<CollabApplication | null> {
    const id = await kv.hget<string>(this.KEYS.BY_TWITTER, twitter.toLowerCase());
    if (!id) return null;
    return this.getApplicationById(id);
  }

  static async createApplication(
    wallet: string, 
    twitter: string, 
    discord: string
  ): Promise<CollabApplication> {
    // Check existing applications
    const existingByWallet = await this.getApplicationByWallet(wallet);
    if (existingByWallet) {
      throw new Error('Wallet already has application');
    }
  
    const existingByTwitter = await this.getApplicationByTwitter(twitter);
    if (existingByTwitter) {
      throw new Error('Twitter account already has application');
    }
  
    const id = generateWildRating();
    const application: ApplicationRecord = {
      id,
      wallet,
      twitter,
      discord,
      status: 'pending',
      createdAt: new Date().toISOString(),
      moderatorVotes: []
    };
  
    await kv.hset(`application:${id}`, application);
    await kv.sadd(this.KEYS.ALL_APPLICATIONS, id);
    await kv.sadd(this.KEYS.PENDING, id);
    await kv.hset(this.KEYS.BY_WALLET, { [wallet.toLowerCase()]: id });
    await kv.hset(this.KEYS.BY_TWITTER, { [twitter.toLowerCase()]: id });
  
    // Create channel for new application and send notification
    const appObj = application as CollabApplication;
    try {
      // Import discordService dynamically to avoid circular dependencies
      const { discordService } = await import('@/lib/discord');
      const channelId = await discordService.createApplicationChannel(appObj);
      if (channelId) {
        // Save channel ID in application
        await kv.hset(`application:${id}`, { discordChannelId: channelId });
        appObj.discordChannelId = channelId;
      }
    } catch (error) {
      console.error('Failed to create Discord channel:', error);
    }
  
    return appObj;
  }

  static async deleteApplication(id: string) {
    try {
      const app = await this.getApplicationById(id);
      if (!app) {
        throw new Error('Application not found');
      }
      
      // Save Discord channel ID for subsequent deletion
      const discordChannelId = app.discordChannelId;
      if (discordChannelId) {
        console.log(`Application ${id} has Discord channel ${discordChannelId} that will be deleted`);
      }
      
      // Check if there's a linked prompt
      if (app.promptId) {
        // Get current prompt status
        const promptStatus = (await this.getPrompt(app.promptId))?.status;
        
        // If prompt is in assigned status, return it to available
        if (promptStatus === 'assigned') {
          await this.setPromptStatus(app.promptId, 'available');
        }
      }
      
      // Delete image from Blob Storage if it exists
      if (app.imageUrl) {
        try {
          if (app.imageUrl.includes('vercel-storage.com')) {
            // Try to get file name from URL
            const imagePathMatch = app.imageUrl.match(/\/([^\/]+\.[^\/]+)$/);
            if (imagePathMatch && imagePathMatch[1]) {
              const fileName = imagePathMatch[1];
              
              // Check if blob-url is in different formats
              if (app.imageUrl.includes('/nft-images/')) {
                // Format /nft-images/{id}.png
                await del('nft-images/' + fileName);
              } else {
                // Old format or other URL format
                await del(fileName);
              }
            }
          }
        } catch (blobError) {
          // Ignore image deletion error
          console.error('Error deleting image blob:', blobError);
        }
      }
      
      // Delete thumbnails or other related images if they exist
      try {
        // Check for thumbnails or other formats
        if (app.imageUrl) {
          const baseName = app.imageUrl.replace(/\.[^.]+$/, ''); // Remove extension
          
          // Try to delete thumbnail version
          try {
            await del(baseName + '_thumb.jpg');
          } catch (e) {
            // Ignore error if thumbnail doesn't exist
          }
          
          // Try to delete preview version
          try {
            await del(baseName + '_preview.jpg');
          } catch (e) {
            // Ignore error if preview doesn't exist
          }
        }
      } catch (additionalBlobError) {
        // Ignore errors when deleting additional images
        console.error('Error deleting additional image files:', additionalBlobError);
      }
      
      // Delete from all sets
      await kv.srem(this.KEYS.ALL_APPLICATIONS, id);
      await kv.srem(`applications:${app.status}`, id);
      await kv.hdel(this.KEYS.BY_WALLET, app.wallet.toLowerCase());
      await kv.hdel(this.KEYS.BY_TWITTER, app.twitter.toLowerCase());
      
      // Delete application itself
      await kv.del(`application:${id}`);
      
      // Delete Discord channel if it exists
      if (discordChannelId) {
        try {
          // Import discordService dynamically
          const { discordService } = await import('@/lib/discord');
          console.log(`Attempting to delete Discord channel ${discordChannelId} for application ${id}`);
          const deleted = await discordService.deleteChannel(discordChannelId);
          console.log(`Discord channel ${discordChannelId} deletion result: ${deleted ? 'success' : 'failed'}`);
        } catch (discordError) {
          console.error(`Failed to delete Discord channel ${discordChannelId}:`, discordError);
        }
      }
      
      return true;
    } catch (error) {
      console.error(`Error deleting application ${id}:`, error);
      throw error;
    }
  }

  static async updateApplication(id: string, updates: Partial<CollabApplication>): Promise<boolean> {
    try {
      const app = await this.getApplicationById(id);
      if (!app) {
        console.error(`Cannot update application ${id}: not found`);
        return false;
      }
      
      await kv.hset(`application:${id}`, updates);
      return true;
    } catch (error) {
      console.error(`Failed to update application ${id}:`, error);
      return false;
    }
  }

  static async addModeratorVote(
    applicationId: string,
    moderatorId: string,
    vote: 'approve' | 'reject',
    comment?: string
  ) {
    const app = await this.getApplicationById(applicationId);
    if (!app) throw new Error('Application not found');

    if (app.moderatorVotes.some(v => v.discordId === moderatorId)) {
      throw new Error('Moderator already voted');
    }

    const newVote = {
      discordId: moderatorId,
      vote,
      votedAt: new Date().toISOString(),
      comment
    };

    const updatedVotes = [...app.moderatorVotes, newVote];
    
    if (updatedVotes.length >= 5) {
      const approveVotes = updatedVotes.filter(v => v.vote === 'approve').length;
      const newStatus = approveVotes >= 3 ? 'approved' : 'rejected';
      await this.updateStatus(applicationId, newStatus);
    }

    await kv.hset(`application:${applicationId}`, {
      moderatorVotes: updatedVotes
    });
  }

  static async updateStatus(id: string, status: ApplicationStatus) {
    const app = await this.getApplicationById(id);
    if (!app) throw new Error('Application not found');
  
    // Save previous status for logging
    const previousStatus = app.status;
  
    // Update status in Redis sets
    await kv.srem(`applications:${app.status}`, id);
    await kv.sadd(`applications:${status}`, id);
    
    // Update application status in Redis
    await kv.hset(`application:${id}`, { status });
    
    console.log(`Updated application ${id} status from ${previousStatus} to ${status}`);
  
    // Give Redis a little time to update data
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Get fully updated application
    const updatedApp = await this.getApplicationById(id);
    
    if (updatedApp) {
      console.log(`Retrieved updated application: ${JSON.stringify({
        id: updatedApp.id,
        status: updatedApp.status,
        promptId: updatedApp.promptId,
        discordChannelId: updatedApp.discordChannelId
      })}`);
      
      // Import DiscordDB and update channel
      try {
        const { DiscordDB } = await import('../db/discord');
        
        // Update status in Discord channel
        if (updatedApp.discordChannelId) {
          await DiscordDB.updateDiscordChannelStatus(updatedApp)
            .then(success => {
              console.log(`Discord status update for ${id} ${success ? 'succeeded' : 'failed'}`);
            })
            .catch(error => {
              console.error(`Failed to update Discord channel for ${id}:`, error);
            });
        }
        
        // Update user role if necessary
        if (status === 'approved' || status === 'minted') {
          await DiscordDB.updateDiscordUserRole(updatedApp)
            .catch(error => {
              console.error(`Failed to update Discord user role for ${id}:`, error);
            });
        }
      } catch (error) {
        console.error(`Failed to import or use DiscordDB for ${id}:`, error);
      }
    } else {
      console.error(`Could not retrieve updated application ${id} after status change`);
    }
  }

  static async getStats(): Promise<CollabStats> {
    const [
      total,
      pending,
      approved,
      prompt_received,
      prompt_expired,
      nft_pending,
      nft_approved,
      nft_rejected,
      minted,
      unminted,
    ] = await Promise.all([
      kv.scard(this.KEYS.ALL_APPLICATIONS),
      kv.scard(this.KEYS.PENDING),
      kv.scard(this.KEYS.APPROVED),
      kv.scard(this.KEYS.PROMPT_RECEIVED),
      kv.scard(this.KEYS.PROMPT_EXPIRED),
      kv.scard(this.KEYS.NFT_PENDING),
      kv.scard(this.KEYS.NFT_APPROVED),
      kv.scard(this.KEYS.NFT_REJECTED),
      kv.scard(this.KEYS.MINTED),
      kv.scard(this.KEYS.UNMINTED),
    ]);

    return {
      total,
      pending,
      approved,
      rejected: await kv.scard(this.KEYS.REJECTED),
      remaining: COLLAB_LIMIT - total,
      isFull: total >= COLLAB_LIMIT,
      // Add additional statistics if needed
      extras: {
        prompt_received,
        prompt_expired,
        nft_pending,
        nft_approved,
        nft_rejected,
        minted,
        unminted,
      }
    };
  }

  static async updateApplicationPrompt(
    id: string,
    promptId: string
  ): Promise<void> {
    const app = await this.getApplicationById(id);
    if (!app) throw new Error('Application not found');
  
    // Update application data with prompt
    await kv.hset(`application:${id}`, {
      promptId,
      promptAssignedAt: new Date().toISOString()
    });
    
    // Update status to prompt_received
    await this.updateStatus(id, 'prompt_received');
  }

  static async updateApplicationNFT(
    id: string,
    imageUrl: string
  ): Promise<void> {
    const app = await this.getApplicationById(id);
    if (!app) throw new Error('Application not found');

    await kv.hset(`application:${id}`, {
      imageUrl,
      imageUploadedAt: new Date().toISOString()
    });
  }

  static async updateMintStatus(
    id: string,
    status: 'minted' | 'unminted'
  ): Promise<void> {
    const app = await this.getApplicationById(id);
    if (!app) throw new Error('Application not found');

    await kv.hset(`application:${id}`, {
      status,
      mintedAt: status === 'minted' ? new Date().toISOString() : null
    });
  }

  static async getPrompt(promptId: string): Promise<PromptData | null> {
    return kv.hgetall<PromptData>(PROMPT_KEYS.getStatusKey(promptId));
  }

  static async setPromptStatus(
    promptId: string,
    status: PromptStatus,
    wallet?: string
  ): Promise<void> {
    const oldStatus = (await this.getPrompt(promptId))?.status;
    if (oldStatus) {
      // Remove from old set
      await kv.srem(`prompts:${oldStatus}`, promptId);
    }

    // Add to new set
    await kv.sadd(`prompts:${status}`, promptId);

    // Update prompt data
    const updateData: Partial<PromptData> = {
      status,
      ...(status === 'assigned' && {
        assignedTo: wallet,
        assignedAt: new Date().toISOString()
      }),
      ...(status === 'used' && {
        usedAt: new Date().toISOString()
      })
    };

    await kv.hset(PROMPT_KEYS.getStatusKey(promptId), updateData);
  }

  static async getRandomAvailablePrompt(): Promise<string | null> {
    return kv.srandmember(PROMPT_KEYS.AVAILABLE);
  }

  static async updateApplicationMetadata(
    id: string,
    metadata: any
  ): Promise<void> {
    const app = await this.getApplicationById(id);
    if (!app) throw new Error('Application not found');
  
    await kv.hset(`application:${id}`, {
      metadata: JSON.stringify(metadata)
    });
  }

  static async saveNFTSignature(
    id: string,
    signature: string
  ): Promise<void> {
    const app = await this.getApplicationById(id);
    if (!app) throw new Error('Application not found');
    
    await kv.hset(`application:${id}`, {
      nftSignature: signature
    });
  }
  
  static async getNFTSignature(wallet: string): Promise<string | null> {
    const id = await kv.hget<string>(this.KEYS.BY_WALLET, wallet.toLowerCase());
    if (!id) return null;
    
    const signature = await kv.hget<string>(`application:${id}`, 'nftSignature');
    return signature;
  }

  static async updateMintTransaction(
    id: string,
    txHash: string
  ): Promise<void> {
    const app = await this.getApplicationById(id);
    if (!app) throw new Error('Application not found');
  
    await kv.hset(`application:${id}`, {
      mintTransaction: txHash,
      mintedAt: new Date().toISOString()
    });
  }

  static async clearApplicationImage(id: string): Promise<void> {
    const app = await this.getApplicationById(id);
    if (!app) throw new Error('Application not found');
  
    // Remove image URL and timestamp
    await kv.hset(`application:${id}`, {
      imageUrl: null,
      imageUploadedAt: null
    });
  }
}