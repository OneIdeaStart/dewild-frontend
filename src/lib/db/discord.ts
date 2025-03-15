import { kv } from '@vercel/kv';
import { discordService } from '@/lib/discord';
import { CollabApplication } from '@/types/collab';
import { DB } from '@/lib/db';

/**
 * Расширение DB класса для работы с Discord
 */
export class DiscordDB {
  /**
   * Создание Discord канала для заявки
   */
  static async createDiscordChannel(application: CollabApplication): Promise<string | null> {
    try {
      // Проверяем, есть ли уже ID канала в заявке
      if (application.discordChannelId) {
        console.log(`Using existing Discord channel ${application.discordChannelId} for application ${application.id}`);
        return application.discordChannelId;
      }

      // Создаем новый канал через Discord API
      const channelId = await discordService.createApplicationChannel(application);
      
      if (channelId) {
        // Сохраняем ID канала прямо в заявке
        await DB.updateApplication(application.id, { discordChannelId: channelId });
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
      // Используем ID канала из заявки
      const channelId = application.discordChannelId;
      if (!channelId) {
        // Канал не создан, создаем новый
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

  /**
   * Получение Discord канала по ID заявки
   */
  static async getApplicationChannel(applicationId: string): Promise<string | null> {
    const application = await DB.getApplicationById(applicationId);
    return application?.discordChannelId || null;
  }

  /**
   * Удаление Discord канала для заявки
   */
  static async deleteApplicationChannelMapping(applicationId: string, channelId: string): Promise<void> {
    try {
      // Обновляем заявку, удаляя ID канала
      await DB.updateApplication(applicationId, { discordChannelId: undefined });
      console.log(`Discord channel reference removed for application ${applicationId}`);
    } catch (error) {
      console.error('Error removing Discord channel reference:', error);
      throw error;
    }
  }
}