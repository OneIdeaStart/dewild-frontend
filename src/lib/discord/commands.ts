// src/lib/discord/commands.ts
import axios from 'axios';

// Types for Discord API
type DiscordCommand = {
  name: string;
  description: string;
  options?: DiscordCommandOption[];
  type?: number;
};

type DiscordCommandOption = {
  name: string;
  description: string;
  type: number;
  required?: boolean;
  choices?: { name: string; value: string }[];
};

// Constants from Discord API
const COMMAND_TYPE_CHAT_INPUT = 1;
const OPTION_TYPE_STRING = 3;
const OPTION_TYPE_INTEGER = 4;
const OPTION_TYPE_BOOLEAN = 5;

/**
 * Class for registering and managing Discord slash commands
 */
export class DiscordCommands {
  private token: string;
  private clientId: string;
  private guildId: string;

  constructor() {
    this.token = process.env.DISCORD_BOT_TOKEN || '';
    this.clientId = process.env.NEXT_PUBLIC_DISCORD_CLIENT_ID || '';
    this.guildId = process.env.DISCORD_SERVER_ID || '';

    if (!this.token || !this.clientId || !this.guildId) {
      console.error('Discord commands service initialized without required environment variables');
    }
  }

  private get headers() {
    return {
      'Authorization': `Bot ${this.token}`,
      'Content-Type': 'application/json',
    };
  }

  /**
   * Registers commands in Discord
   */
  async registerCommands() {
    try {
      // Define command set for application
      const commands: DiscordCommand[] = [
        {
          name: 'status',
          description: 'Check your application status',
          type: COMMAND_TYPE_CHAT_INPUT
        },
        {
          name: 'help',
          description: 'Show available commands and help information',
          type: COMMAND_TYPE_CHAT_INPUT
        },
        {
          name: 'dashboard',
          description: 'Get a link to your dashboard',
          type: COMMAND_TYPE_CHAT_INPUT
        }
      ];

      // Register commands for specific server (update faster)
      const response = await axios.put<DiscordCommand[]>(
        `https://discord.com/api/v10/applications/${this.clientId}/guilds/${this.guildId}/commands`,
        commands,
        { headers: this.headers }
      );

      console.log(`Registered ${response.data.length} Discord commands`);
      return response.data;
    } catch (error) {
      console.error('Failed to register Discord commands:', error);
      throw error;
    }
  }

  /**
   * Deletes all commands from Discord
   */
  async deleteAllCommands() {
    try {
      // Get list of existing commands
      const response = await axios.get<{ id: string }[]>(
        `https://discord.com/api/v10/applications/${this.clientId}/guilds/${this.guildId}/commands`,
        { headers: this.headers }
      );

      // Delete each command
      for (const command of response.data) {
        await axios.delete(
          `https://discord.com/api/v10/applications/${this.clientId}/guilds/${this.guildId}/commands/${command.id}`,
          { headers: this.headers }
        );
      }

      console.log(`Deleted ${response.data.length} Discord commands`);
      return true;
    } catch (error) {
      console.error('Failed to delete Discord commands:', error);
      throw error;
    }
  }
}

// Export instance for use in other modules
export const discordCommands = new DiscordCommands();