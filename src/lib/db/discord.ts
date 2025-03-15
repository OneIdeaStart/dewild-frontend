// lib/db/discord.ts
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
      // Строгая проверка наличия канала
      if (application.discordChannelId) {
        console.log(`Application ${application.id} already has Discord channel ${application.discordChannelId}`);
        return application.discordChannelId;
      }

      // Проверяем, не создается ли канал в данный момент
      const lockKey = `discord:channel:lock:${application.id}`;
      const isLocked = await kv.get(lockKey);
      if (isLocked) {
        console.log(`Channel creation is already in progress for application ${application.id}`);
        return null;
      }

      // Устанавливаем блокировку на 1 минуту
      await kv.set(lockKey, true, { ex: 60 });

      try {
        // Создаем новый канал через Discord API
        const channelId = await discordService.createApplicationChannel(application);
        
        if (channelId) {
          // Сохраняем ID канала прямо в заявке
          await DB.updateApplication(application.id, { discordChannelId: channelId });
          console.log(`Created Discord channel ${channelId} for application ${application.id}`);
        }
        
        return channelId;
      } finally {
        // Удаляем блокировку в любом случае
        await kv.del(lockKey);
      }
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
        console.log(`Application ${application.id} has no Discord channel, skipping status update`);
        return false;
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