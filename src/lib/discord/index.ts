// src/lib/discord/index.ts
import axios from 'axios';
import { CollabApplication } from '@/types/collab';

// Расширяем типы для работы с Discord API
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
  type: number; // 0 для роли, 1 для пользователя
  allow: string;
  deny: string;
};

// Discord API константы
const CHANNEL_TYPE_TEXT = 0;
// Используем обычные строки вместо BigInt для совместимости
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
   * Получает Discord ID пользователя по его Discord тегу (username#discriminator)
   */
  async getUserIdByUsername(discordTag: string): Promise<string | null> {
    try {
      // Извлекаем имя пользователя и дискриминатор
      const [username, discriminator] = discordTag.split('#');
      
      // Получаем список участников сервера через API Discord
      const response = await axios.get<any[]>(
        `https://discord.com/api/v10/guilds/${this.guildId}/members?limit=1000`,
        { headers: this.headers }
      );
      
      // Проверяем, что response.data это массив
      if (!Array.isArray(response.data)) {
        console.error('Unexpected response format from Discord API:', response.data);
        return null;
      }
      
      // Ищем пользователя по имени и дискриминатору
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
   * Создает приватный канал для заявки артиста
   */
  async createApplicationChannel(application: CollabApplication): Promise<string | null> {
    try {
      // Получаем Discord ID пользователя
      const userId = await this.getUserIdByUsername(application.discord);
      if (!userId) {
        console.error(`User ${application.discord} not found in Discord server`);
        return null;
      }

      // Создаем имя канала на основе ID заявки
      // Используем префикс app- для различения каналов заявок
      const channelName = `app-${application.id}`;

      // Настраиваем права доступа
      // 1. По умолчанию, канал скрыт от всех (@everyone)
      // 2. Пользователь, подавший заявку, имеет доступ к каналу
      // 3. Добавляем роль бота для доступа
      const permissionOverwrites = [
        {
          id: this.guildId, // @everyone роль
          type: 0, // тип "роль"
          allow: '0',
          deny: PERMISSION_VIEW_CHANNEL // Скрываем канал
        },
        {
          id: userId,
          type: 1, // тип "пользователь"
          // В качестве разрешений просто указываем суммарное значение
          allow: "68672", // 1024 + 2048 + 65536 + 64
          deny: '0'
        }
      ];

      // Если задана роль бота, добавляем ее в разрешения
      if (this.botRoleId) {
        permissionOverwrites.push({
          id: this.botRoleId,
          type: 0, // тип "роль"
          allow: "68672", // Такие же разрешения как у пользователя
          deny: '0'
        });
      }

      // Создаем канал через API Discord
      const response = await axios.post<{ id: string }>(
        `https://discord.com/api/v10/guilds/${this.guildId}/channels`,
        {
          name: channelName,
          type: CHANNEL_TYPE_TEXT,
          parent_id: this.applicationsCategoryId, // Категория для каналов заявок
          permission_overwrites: permissionOverwrites,
          topic: `Application channel for ${application.discord} (${application.twitter})`,
          sync_permissions: true // Синхронизировать разрешения с категорией
        },
        { headers: this.headers }
      );

      const channelId = response.data.id;
      
      // Отправляем начальное сообщение с информацией о заявке
      await this.sendApplicationStatusMessage(channelId, application);
      
      return channelId;
    } catch (error) {
      console.error('Failed to create application channel:', error);
      return null;
    }
  }

  /**
   * Отправляет сообщение о статусе заявки в канал
   */
  async sendApplicationStatusMessage(channelId: string, application: CollabApplication): Promise<boolean> {
    try {
      // Формируем сообщение в зависимости от статуса заявки
      const message = this.getStatusMessage(application);
      
      // Отправляем сообщение
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
   * Обновляет сообщение о статусе заявки
   * Находит последнее сообщение от бота и обновляет его
   */
  async updateApplicationStatusMessage(channelId: string, application: CollabApplication): Promise<boolean> {
    try {
      // Получаем последние сообщения в канале
      const messagesResponse = await axios.get<any[]>(
        `https://discord.com/api/v10/channels/${channelId}/messages?limit=10`,
        { headers: this.headers }
      );
      
      // Проверяем, что response.data это массив
      if (!Array.isArray(messagesResponse.data)) {
        console.error('Unexpected response format from Discord API:', messagesResponse.data);
        // Если формат не соответствует ожидаемому, отправляем новое сообщение
        return await this.sendApplicationStatusMessage(channelId, application);
      }
      
      // Находим последнее сообщение от бота
      const botMessages = messagesResponse.data.filter((msg: any) => msg.author && msg.author.bot === true);
      if (botMessages.length === 0) {
        // Если сообщений от бота нет, отправляем новое
        return await this.sendApplicationStatusMessage(channelId, application);
      }
      
      const lastBotMessage = botMessages[0];
      
      // Формируем новое сообщение
      const message = this.getStatusMessage(application);
      
      // Обновляем сообщение
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
   * Формирует текст сообщения о статусе заявки
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
    
    // Добавляем детали в зависимости от статуса
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
   * Возвращает эмодзи для статуса заявки
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
   * Форматирует статус для отображения
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
   * Обновляет роль пользователя в зависимости от статуса заявки
   */
  async updateUserRole(discordTag: string, applicationStatus: string): Promise<boolean> {
    try {
      // Получаем Discord ID пользователя
      const userId = await this.getUserIdByUsername(discordTag);
      if (!userId) {
        console.error(`User ${discordTag} not found in Discord server`);
        return false;
      }
      
      // Определяем роль, которую нужно добавить
      let roleId = '';
      
      switch (applicationStatus) {
        case 'approved':
          roleId = process.env.DISCORD_DEWILD_PROSPECT_ROLE_ID || '';
          break;
        case 'minted':
          roleId = process.env.DISCORD_DEWILD_ARTIST_ROLE_ID || '';
          break;
        default:
          // Для других статусов не меняем роль
          return true;
      }
      
      if (!roleId) {
        console.warn(`Role ID not configured for status: ${applicationStatus}`);
        return false;
      }
      
      // Добавляем роль пользователю
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
   * Удаляет канал в Discord
   */
  async deleteChannel(channelId: string): Promise<boolean> {
    try {
      // Удаляем канал через API Discord
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

// Экспортируем инстанс сервиса для использования в других модулях
export const discordService = new DiscordService();