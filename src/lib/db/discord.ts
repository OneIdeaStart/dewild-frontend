// src/lib/db/discord.ts
import { kv } from '@vercel/kv';
import { discordService } from '@/lib/discord';
import { CollabApplication } from '@/types/collab';

/**
 * Расширение DB класса для работы с Discord
 */
export class DiscordDB {
  static readonly KEYS = {
    APPLICATION_CHANNEL_MAP: 'discord:application:channel',
    CHANNEL_APPLICATION_MAP: 'discord:channel:application',
  };

  /**
   * Сохранение связи между заявкой и Discord каналом
   */
  static async saveApplicationChannel(applicationId: string, channelId: string): Promise<void> {
    await kv.hset(this.KEYS.APPLICATION_CHANNEL_MAP, { [applicationId]: channelId });
    await kv.hset(this.KEYS.CHANNEL_APPLICATION_MAP, { [channelId]: applicationId });
  }

  /**
   * Получение Discord канала для заявки
   */
  static async getApplicationChannel(applicationId: string): Promise<string | null> {
    return kv.hget<string>(this.KEYS.APPLICATION_CHANNEL_MAP, applicationId);
  }

  /**
   * Получение заявки для Discord канала
   */
  static async getChannelApplication(channelId: string): Promise<string | null> {
    return kv.hget<string>(this.KEYS.CHANNEL_APPLICATION_MAP, channelId);
  }

  /**
   * Удаление связи между заявкой и Discord каналом
   */
  static async deleteApplicationChannelMapping(applicationId: string, channelId: string): Promise<void> {
    try {
      await kv.hdel(this.KEYS.APPLICATION_CHANNEL_MAP, applicationId);
      await kv.hdel(this.KEYS.CHANNEL_APPLICATION_MAP, channelId);
      
      console.log(`Mapping between application ${applicationId} and channel ${channelId} deleted`);
    } catch (error) {
      console.error('Error deleting application channel mapping:', error);
      throw error;
    }
  }

  /**
   * Создание Discord канала для заявки
   */
  static async createDiscordChannel(application: CollabApplication): Promise<string | null> {
    try {
      // Проверяем, существует ли уже канал для этой заявки
      const existingChannelId = await this.getApplicationChannel(application.id);
      if (existingChannelId) {
        // Канал уже существует, возвращаем его ID
        return existingChannelId;
      }

      // Создаем новый канал через Discord API
      const channelId = await discordService.createApplicationChannel(application);
      
      if (channelId) {
        // Сохраняем связь между заявкой и каналом
        await this.saveApplicationChannel(application.id, channelId);
        console.log(`Created Discord channel ${channelId} for application ${application.id}`);
      }
      
      return channelId;
    } catch (error) {
      console.error('Error creating Discord channel:', error);
      return null;
    }
  }

  /**
   * Обновление статуса заявки в Discord канале
   */
  static async updateDiscordChannelStatus(application: CollabApplication): Promise<boolean> {
    try {
      // Получаем ID канала для заявки
      const channelId = await this.getApplicationChannel(application.id);
      if (!channelId) {
        // Канал не найден, создаем новый
        const newChannelId = await this.createDiscordChannel(application);
        if (!newChannelId) {
          return false;
        }
        return await discordService.sendApplicationStatusMessage(newChannelId, application);
      }

      // Обновляем сообщение в существующем канале
      return await discordService.updateApplicationStatusMessage(channelId, application);
    } catch (error) {
      console.error('Error updating Discord channel status:', error);
      return false;
    }
  }

  /**
   * Обновление роли пользователя при изменении статуса заявки
   */
  static async updateDiscordUserRole(application: CollabApplication): Promise<boolean> {
    try {
      return await discordService.updateUserRole(application.discord, application.status);
    } catch (error) {
      console.error('Error updating Discord user role:', error);
      return false;
    }
  }
}