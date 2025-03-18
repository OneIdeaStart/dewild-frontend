// src/lib/discord/index.ts
import axios from 'axios';
import { CollabApplication } from '@/types/collab';

// Extend types for working with Discord API
type DiscordChannel = {
  id: string;
  name: string;
  type: number;
  guild_id: string;
  permission_overwrites: PermissionOverwrite[];
};

type DiscordUser = {
  id: string;
  username: string;
  discriminator: string;
};

type PermissionOverwrite = {
  id: string;
  type: number; // 0 for role, 1 for user
  allow: string;
  deny: string;
};

// Discord API constants
const CHANNEL_TYPE_TEXT = 0;
// Use regular strings instead of BigInt for compatibility
const PERMISSION_VIEW_CHANNEL = "1024"; // (1 << 10)
const PERMISSION_SEND_MESSAGES = "2048"; // (1 << 11)
const PERMISSION_READ_MESSAGE_HISTORY = "65536"; // (1 << 16)
const PERMISSION_ADD_REACTIONS = "64"; // (1 << 6)

export class DiscordService {
  private token: string;
  private guildId: string;
  private dewildOneRoleId: string;
  private applicationsCategoryId: string;
  private botRoleId: string;

  constructor() {
    this.token = process.env.DISCORD_BOT_TOKEN || '';
    this.guildId = process.env.DISCORD_SERVER_ID || '';
    this.dewildOneRoleId = process.env.DISCORD_DEWILD_ONE_ROLE_ID || '';
    this.applicationsCategoryId = process.env.DISCORD_APPLICATIONS_CATEGORY_ID || '';
    this.botRoleId = process.env.DISCORD_BOT_ROLE_ID || '';

    if (!this.token || !this.guildId) {
      console.error('Discord service initialized without required environment variables');
    }
  }

  private get headers() {
    return {
      'Authorization': `Bot ${this.token}`,
      'Content-Type': 'application/json',
    };
  }

  /**
   * Gets Discord user ID by their Discord tag (username#discriminator)
   */
  async getUserIdByUsername(discordTag: string): Promise<string | null> {
    try {
      // Extract username and discriminator
      const [username, discriminator] = discordTag.split('#');
      
      // Get server member list through Discord API
      const response = await axios.get<any[]>(
        `https://discord.com/api/v10/guilds/${this.guildId}/members?limit=1000`,
        { headers: this.headers }
      );
      
      // Check that response.data is an array
      if (!Array.isArray(response.data)) {
        console.error('Unexpected response format from Discord API:', response.data);
        return null;
      }
      
      // Find user by name and discriminator
      const member = response.data.find((m: any) => {
        if (!m.user) return false;
        const user = m.user;
        return user.username === username && 
               (discriminator ? user.discriminator === discriminator : true);
      });
      
      return member && member.user ? member.user.id : null;
    } catch (error) {
      console.error('Failed to get Discord user ID:', error);
      return null;
    }
  }

  /**
   * Creates private channel for artist application
   */
  async createApplicationChannel(application: CollabApplication): Promise<string | null> {
    try {
      // Get Discord user ID
      const userId = await this.getUserIdByUsername(application.discord);
      if (!userId) {
        console.error(`User ${application.discord} not found in Discord server`);
        return null;
      }

      // Create channel name based on application ID
      // Use prefix app- to distinguish application channels
      const channelName = `app-${application.id}`;

      // Set up access rights
      // 1. By default, channel is hidden from everyone (@everyone)
      // 2. User who submitted application has access to channel
      // 3. Add bot role for access
      const permissionOverwrites = [
        {
          id: this.guildId, // @everyone role
          type: 0, // type "role"
          allow: '0',
          deny: PERMISSION_VIEW_CHANNEL // Hide channel
        },
        {
          id: userId,
          type: 1, // type "user"
          // As permissions just specify sum value
          allow: "68672", // 1024 + 2048 + 65536 + 64
          deny: '0'
        }
      ];

      // If bot role is set, add it to permissions
      if (this.botRoleId) {
        permissionOverwrites.push({
          id: this.botRoleId,
          type: 0, // type "role"
          allow: "68672", // Same permissions as user
          deny: '0'
        });
      }

      // Create channel through Discord API
      const response = await axios.post<{ id: string }>(
        `https://discord.com/api/v10/guilds/${this.guildId}/channels`,
        {
          name: channelName,
          type: CHANNEL_TYPE_TEXT,
          parent_id: this.applicationsCategoryId, // Category for applications channel
          permission_overwrites: permissionOverwrites,
          topic: `Application channel for ${application.discord} (${application.twitter})`,
          sync_permissions: true // Synchronize permissions with category
        },
        { headers: this.headers }
      );

      const channelId = response.data.id;
      
      // Send initial message with application information
      await this.sendApplicationStatusMessage(channelId, application);
      
      return channelId;
    } catch (error) {
      console.error('Failed to create application channel:', error);
      return null;
    }
  }

  /**
   * Sends application status message to channel
   */
  async sendApplicationStatusMessage(channelId: string, application: CollabApplication): Promise<boolean> {
    try {
      // Form message depending on application status
      const message = this.getStatusMessage(application);
      
      // Send message
      await axios.post(
        `https://discord.com/api/v10/channels/${channelId}/messages`,
        { content: message },
        { headers: this.headers }
      );
      
      return true;
    } catch (error) {
      console.error('Failed to send application status message:', error);
      return false;
    }
  }

  /**
   * Updates application status message
   * Finds the latest message from the bot and updates it
   */
  async updateApplicationStatusMessage(channelId: string, application: CollabApplication): Promise<boolean> {
    try {
      // Get latest messages in channel
      const messagesResponse = await axios.get<any[]>(
        `https://discord.com/api/v10/channels/${channelId}/messages?limit=10`,
        { headers: this.headers }
      );
      
      // Check that response.data is an array
      if (!Array.isArray(messagesResponse.data)) {
        console.error('Unexpected response format from Discord API:', messagesResponse.data);
        // If format doesn't match expected, send new message
        return await this.sendApplicationStatusMessage(channelId, application);
      }
      
      // Find last message from bot
      const botMessages = messagesResponse.data.filter((msg: any) => msg.author && msg.author.bot === true);
      if (botMessages.length === 0) {
        // If no messages from bot, send new one
        return await this.sendApplicationStatusMessage(channelId, application);
      }
      
      const lastBotMessage = botMessages[0];
      
      // Form new message
      const message = this.getStatusMessage(application);
      
      // Update message
      await axios.patch(
        `https://discord.com/api/v10/channels/${channelId}/messages/${lastBotMessage.id}`,
        { content: message },
        { headers: this.headers }
      );
      
      return true;
    } catch (error) {
      console.error('Failed to update application status message:', error);
      return false;
    }
  }

  /**
   * Forms text of application status message
   */
  private getStatusMessage(application: CollabApplication): string {
    const statusEmoji = this.getStatusEmoji(application.status);
    const created = new Date(application.createdAt).toLocaleString('ru-RU');
    
    let message = `# DeWild Application: ${application.id}\n\n`;
    message += `👤 **Discord**: ${application.discord}\n`;
    message += `🐦 **Twitter**: ${application.twitter}\n`;
    message += `💼 **Wallet**: \`${application.wallet}\`\n`;
    message += `⏱️ **Created**: ${created}\n\n`;
    
    message += `## Current Status: ${statusEmoji} ${this.formatStatus(application.status)}\n\n`;
    
    // Add details depending on status
    switch (application.status) {
      case 'pending':
        message += `Your application is being reviewed by our team. Please be patient.\n`;
        break;
      case 'approved':
        message += `Congratulations! Your application has been approved. You can now proceed to the next step and submit your NFT design.\n`;
        break;
      case 'rejected':
        message += `We're sorry, but your application has been rejected. If you think this is a mistake, please contact our team.\n`;
        break;
      case 'prompt_received':
        message += `You've received a prompt for your NFT. Please check your dashboard to proceed with creation.\n`;
        if (application.promptAssignedAt) {
          const promptDate = new Date(application.promptAssignedAt).toLocaleString('ru-RU');
          message += `📋 **Prompt received**: ${promptDate}\n`;
        }
        break;
      case 'nft_pending':
        message += `Your NFT design has been submitted and is currently under review. We'll update you soon.\n`;
        if (application.imageUploadedAt) {
          const uploadDate = new Date(application.imageUploadedAt).toLocaleString('ru-RU');
          message += `🖼️ **Design submitted**: ${uploadDate}\n`;
        }
        break;
      case 'nft_approved':
        message += `Great news! Your NFT design has been approved. You can now mint your NFT on our platform.\n`;
        break;
      case 'nft_rejected':
        message += `Your NFT design was not approved. Please check your dashboard for feedback and try again.\n`;
        break;
      case 'minted':
        message += `🎉 Congratulations! Your NFT has been successfully minted and is now part of the DeWild collection.\n`;
        if (application.mintedAt) {
          const mintDate = new Date(application.mintedAt).toLocaleString('ru-RU');
          message += `⛓️ **Minted on**: ${mintDate}\n`;
        }
        break;
      default:
        message += `Application is being processed.\n`;
    }
    
    message += `\n> Check your dashboard at https://dewild.club/dashboard for more details.`;
    
    return message;
  }

  /**
   * Returns emoji for application status
   */
  private getStatusEmoji(status: string): string {
    switch (status) {
      case 'pending': return '⏳';
      case 'approved': return '✅';
      case 'rejected': return '❌';
      case 'prompt_received': return '📝';
      case 'prompt_expired': return '⏰';
      case 'nft_pending': return '🔍';
      case 'nft_approved': return '🎨';
      case 'nft_rejected': return '🚫';
      case 'minted': return '🏆';
      case 'unminted': return '📦';
      default: return '❓';
    }
  }

  /**
   * Formats status for display
   */
  private formatStatus(status: string): string {
    switch (status) {
      case 'pending': return 'Pending Review';
      case 'approved': return 'Application Approved';
      case 'rejected': return 'Application Rejected';
      case 'prompt_received': return 'Prompt Received';
      case 'prompt_expired': return 'Prompt Expired';
      case 'nft_pending': return 'NFT Design Under Review';
      case 'nft_approved': return 'NFT Design Approved';
      case 'nft_rejected': return 'NFT Design Rejected';
      case 'minted': return 'NFT Minted';
      case 'unminted': return 'Ready for Minting';
      default: return status.charAt(0).toUpperCase() + status.slice(1);
    }
  }

  /**
   * Updates user role depending on application status
   */
  async updateUserRole(discordTag: string, applicationStatus: string): Promise<boolean> {
    try {
      // Get Discord user ID
      const userId = await this.getUserIdByUsername(discordTag);
      if (!userId) {
        console.error(`User ${discordTag} not found in Discord server`);
        return false;
      }
      
      // Determine role to add
      let roleId = '';
      
      switch (applicationStatus) {
        case 'approved':
          roleId = process.env.DISCORD_DEWILD_PROSPECT_ROLE_ID || '';
          break;
        case 'minted':
          roleId = process.env.DISCORD_DEWILD_ARTIST_ROLE_ID || '';
          break;
        default:
          // For other statuses don't change role
          return true;
      }
      
      if (!roleId) {
        console.warn(`Role ID not configured for status: ${applicationStatus}`);
        return false;
      }
      
      // Add role to user
      await axios.put(
        `https://discord.com/api/v10/guilds/${this.guildId}/members/${userId}/roles/${roleId}`,
        {},
        { headers: this.headers }
      );
      
      return true;
    } catch (error) {
      console.error('Failed to update user role:', error);
      return false;
    }
  }

  /**
   * Deletes channel in Discord
   */
  async deleteChannel(channelId: string): Promise<boolean> {
    try {
      // Delete channel through Discord API
      await axios.delete(
        `https://discord.com/api/v10/channels/${channelId}`,
        { headers: this.headers }
      );
      
      return true;
    } catch (error) {
      return false;
    }
  }
}

// Export service instance for use in other modules
export const discordService = new DiscordService();