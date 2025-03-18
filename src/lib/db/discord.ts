// lib/db/discord.ts
import { kv } from '@vercel/kv';
import { discordService } from '@/lib/discord';
import { CollabApplication } from '@/types/collab';
import { DB } from '@/lib/db';

/**
 * Extension of DB class for working with Discord
 */
export class DiscordDB {
  /**
   * Creating Discord channel for application
   */
  static async createDiscordChannel(application: CollabApplication): Promise<string | null> {
    try {
      // Strict check for channel existence
      if (application.discordChannelId) {
        console.log(`Application ${application.id} already has Discord channel ${application.discordChannelId}`);
        return application.discordChannelId;
      }

      // Check if channel is currently being created
      const lockKey = `discord:channel:lock:${application.id}`;
      const isLocked = await kv.get(lockKey);
      if (isLocked) {
        console.log(`Channel creation is already in progress for application ${application.id}`);
        return null;
      }

      // Set lock for 1 minute
      await kv.set(lockKey, true, { ex: 60 });

      try {
        // Create new channel through Discord API
        const channelId = await discordService.createApplicationChannel(application);
        
        if (channelId) {
          // Save channel ID directly in application
          await DB.updateApplication(application.id, { discordChannelId: channelId });
          console.log(`Created Discord channel ${channelId} for application ${application.id}`);
        }
        
        return channelId;
      } finally {
        // Remove lock in any case
        await kv.del(lockKey);
      }
    } catch (error) {
      console.error('Error creating Discord channel:', error);
      return null;
    }
  }

  /**
   * Updating application status in Discord channel
   */
  static async updateDiscordChannelStatus(application: CollabApplication): Promise<boolean> {
    try {
      console.log(`Attempting to update Discord channel for application ${application.id} with status ${application.status}`);
      
      // Use channel ID from application
      const channelId = application.discordChannelId;
      if (!channelId) {
        console.log(`Application ${application.id} has no Discord channel, skipping status update`);
        return false;
      }
  
      console.log(`Updating Discord channel ${channelId} for application ${application.id}`);
      
      // Update message in existing channel
      const result = await discordService.updateApplicationStatusMessage(channelId, application);
      console.log(`Discord update result for ${application.id}: ${result}`);
      return result;
    } catch (error) {
      console.error(`Error updating Discord channel status for ${application.id}:`, error);
      return false;
    }
  }

  /**
   * Updating user role when application status changes
   */
  static async updateDiscordUserRole(application: CollabApplication): Promise<boolean> {
    try {
      return await discordService.updateUserRole(application.discord, application.status);
    } catch (error) {
      console.error('Error updating Discord user role:', error);
      return false;
    }
  }

  /**
   * Getting Discord channel by application ID
   */
  static async getApplicationChannel(applicationId: string): Promise<string | null> {
    const application = await DB.getApplicationById(applicationId);
    return application?.discordChannelId || null;
  }

  /**
   * Deleting Discord channel for application
   */
  static async deleteApplicationChannelMapping(applicationId: string, channelId: string): Promise<void> {
    try {
      // Update application, removing channel ID
      await DB.updateApplication(applicationId, { discordChannelId: undefined });
      console.log(`Discord channel reference removed for application ${applicationId}`);
    } catch (error) {
      console.error('Error removing Discord channel reference:', error);
      throw error;
    }
  }
}