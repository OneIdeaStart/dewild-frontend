// src/lib/db/index.ts
import { kv } from '@vercel/kv';
import { CollabApplication, CollabStats, ApplicationStatus } from '@/types/collab';
import { generateWildRating } from '@/lib/utils';
import { PromptData, PromptStatus, PROMPT_KEYS } from '@/types/prompt';
import { del } from '@vercel/blob';
import { DiscordDB } from './discord';

const COLLAB_LIMIT = 11111;

// Используем тот же интерфейс, что и в CollabApplication
type ApplicationRecord = {
  [key: string]: unknown;
} & CollabApplication;

export class DB {
  static readonly KEYS = {
    ALL_APPLICATIONS: 'applications:all',    
    PENDING: 'applications:pending',         
    APPROVED: 'applications:approved',       
    REJECTED: 'applications:rejected',
    // Добавляем новые ключи для статусов
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
    
    // Преобразуем запись из Redis в CollabApplication
    const application: CollabApplication = {
      id: record.id,
      wallet: record.wallet,
      twitter: record.twitter,
      discord: record.discord,
      status: record.status,
      createdAt: record.createdAt,
      moderatorVotes: record.moderatorVotes,
      // Другие поля
      promptId: record.promptId,
      promptAssignedAt: record.promptAssignedAt,
      imageUrl: record.imageUrl,
      imageUploadedAt: record.imageUploadedAt,
      mintedAt: record.mintedAt,
      metadata: record.metadata
    };
  
    // Теперь проверяем, нужно ли парсить metadata, если она строка
    if (application.metadata && typeof application.metadata === 'string') {
      try {
        application.metadata = JSON.parse(application.metadata as string);
      } catch (e) {
        // Ошибка при парсинге, но продолжаем выполнение
      }
    }
  
    return application;
  }

  static async getAllApplications(status?: string, search?: string): Promise<CollabApplication[]> {
    // Если указан статус, берем из соответствующего сета
    const setKey = status ? `applications:${status}` : this.KEYS.ALL_APPLICATIONS;
    const applicationIds = await kv.smembers(setKey);
    
    // Получаем данные каждой заявки
    const applications = await Promise.all(
      applicationIds.map(id => this.getApplicationById(id))
    );
  
    // Фильтруем null значения
    const filteredApps = applications.filter((app): app is CollabApplication => app !== null);
  
    // Применяем поиск если указан
    if (search) {
      const searchLower = search.toLowerCase();
      return filteredApps.filter(app => 
        app.twitter.toLowerCase().includes(searchLower) ||
        app.discord.toLowerCase().includes(searchLower) ||
        app.wallet.toLowerCase().includes(searchLower)
      );
    }
  
    // Сортируем по дате создания (новые первыми)
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
    // Проверяем существующие заявки
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
  
    // Создаем канал для новой заявки и отправляем уведомление (асинхронно)
    const appObj = application as CollabApplication;
    DiscordDB.createDiscordChannel(appObj)
      .catch(error => console.error('Failed to create Discord channel:', error));
  
    return appObj;
  }

  static async deleteApplication(id: string) {
    try {
      const app = await this.getApplicationById(id);
      if (!app) {
        throw new Error('Application not found');
      }
      
      // Проверяем, есть ли привязанный промпт
      if (app.promptId) {
        // Получаем текущий статус промпта
        const promptStatus = (await this.getPrompt(app.promptId))?.status;
        
        // Если промпт в статусе assigned, возвращаем его в available
        if (promptStatus === 'assigned') {
          await this.setPromptStatus(app.promptId, 'available');
        }
      }
      
      // Удаляем изображение из Blob Storage, если оно существует
      if (app.imageUrl) {
        try {
          if (app.imageUrl.includes('vercel-storage.com')) {
            // Пробуем получить имя файла из URL
            const imagePathMatch = app.imageUrl.match(/\/([^\/]+\.[^\/]+)$/);
            if (imagePathMatch && imagePathMatch[1]) {
              const fileName = imagePathMatch[1];
              
              // Проверяем, есть ли blob-url в разных форматах
              if (app.imageUrl.includes('/nft-images/')) {
                // Формат /nft-images/{id}.png
                await del('nft-images/' + fileName);
              } else {
                // Старый формат или другой формат URL
                await del(fileName);
              }
            }
          }
        } catch (blobError) {
          // Игнорируем ошибку удаления изображения
        }
      }
      
      // Удаляем миниатюры или другие связанные изображения, если они есть
      try {
        // Проверяем наличие миниатюр или других форматов
        if (app.imageUrl) {
          const baseName = app.imageUrl.replace(/\.[^.]+$/, ''); // Удаляем расширение
          
          // Попытка удалить thumbnail версию
          try {
            await del(baseName + '_thumb.jpg');
          } catch (e) {
            // Игнорируем ошибку, если миниатюры нет
          }
          
          // Попытка удалить preview версию
          try {
            await del(baseName + '_preview.jpg');
          } catch (e) {
            // Игнорируем ошибку, если preview нет
          }
        }
      } catch (additionalBlobError) {
        // Игнорируем ошибки при удалении дополнительных изображений
      }
      
      // Удаляем из всех сетов
      await kv.srem(this.KEYS.ALL_APPLICATIONS, id);
      await kv.srem(`applications:${app.status}`, id);
      await kv.hdel(this.KEYS.BY_WALLET, app.wallet.toLowerCase());
      await kv.hdel(this.KEYS.BY_TWITTER, app.twitter.toLowerCase());
      
      // Удаляем саму заявку
      await kv.del(`application:${id}`);
      
      return true;
    } catch (error) {
      throw error;
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
  
    await kv.srem(`applications:${app.status}`, id);
    await kv.sadd(`applications:${status}`, id);
    
    // Обновляем только статус, сохраняя остальные данные
    await kv.hset(`application:${id}`, { status });
  
    // Получаем обновленную заявку
    const updatedApp = await this.getApplicationById(id);
    
    // Асинхронно обновляем статус в Discord канале
    if (updatedApp) {
      import('../db/discord').then(({ DiscordDB }) => {
        DiscordDB.updateDiscordChannelStatus(updatedApp)
          .catch(error => console.error('Failed to update Discord channel:', error));
        
        // Обновляем роль пользователя при необходимости
        if (status === 'approved' || status === 'minted') {
          DiscordDB.updateDiscordUserRole(updatedApp)
            .catch(error => console.error('Failed to update Discord user role:', error));
        }
      }).catch(error => {
        console.error('Failed to import DiscordDB:', error);
      });
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
      // Добавляем дополнительную статистику, если нужно
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

    await kv.hset(`application:${id}`, {
      promptId,
      promptAssignedAt: new Date().toISOString()
    });
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
      // Удаляем из старого сета
      await kv.srem(`prompts:${oldStatus}`, promptId);
    }

    // Добавляем в новый сет
    await kv.sadd(`prompts:${status}`, promptId);

    // Обновляем данные промпта
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
  
    // Удаляем URL изображения и временную метку
    await kv.hset(`application:${id}`, {
      imageUrl: null,
      imageUploadedAt: null
    });
  }
}