import { kv } from '@vercel/kv';
import { CollabApplication, CollabStats } from '@/types/collab';
import { generateWildRating } from '@/lib/utils';

const COLLAB_LIMIT = 11111;

// Используем тот же интерфейс, что и в CollabApplication
type ApplicationRecord = {
  [key: string]: unknown;
} & CollabApplication;

export class DB {
  private static readonly KEYS = {
    ALL_APPLICATIONS: 'applications:all',    
    PENDING: 'applications:pending',         
    APPROVED: 'applications:approved',       
    REJECTED: 'applications:rejected',       
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
      moderatorVotes: record.moderatorVotes
    };

    return application;
  }

  // Получение заявки по кошельку
  static async getApplicationByWallet(wallet: string): Promise<CollabApplication | null> {
    const id = await kv.hget<string>(this.KEYS.BY_WALLET, wallet.toLowerCase());
    if (!id) return null;
    return this.getApplicationById(id);
  }

  // Получение заявки по twitter
  static async getApplicationByTwitter(twitter: string): Promise<CollabApplication | null> {
    const id = await kv.hget<string>(this.KEYS.BY_TWITTER, twitter.toLowerCase());
    if (!id) return null;
    return this.getApplicationById(id);
  }

  // Создание новой заявки
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

    return application as CollabApplication;
  }

  // Добавление голоса модератора
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

  // Обновление статуса
  static async updateStatus(id: string, status: 'pending' | 'approved' | 'rejected') {
    const app = await this.getApplicationById(id);
    if (!app) throw new Error('Application not found');

    await kv.srem(`applications:${app.status}`, id);
    await kv.sadd(`applications:${status}`, id);
    await kv.hset(`application:${id}`, { status });
  }

  // Получение статистики
  static async getStats(): Promise<CollabStats> {
    const [total, pending, approved, rejected] = await Promise.all([
      kv.scard(this.KEYS.ALL_APPLICATIONS),
      kv.scard(this.KEYS.PENDING),
      kv.scard(this.KEYS.APPROVED),
      kv.scard(this.KEYS.REJECTED),
    ]);

    return {
      total,
      pending,
      approved,
      rejected,
      remaining: COLLAB_LIMIT - total,
      isFull: total >= COLLAB_LIMIT
    };
  }
}