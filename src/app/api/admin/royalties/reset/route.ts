// src/app/api/admin/royalties/reset/route.ts
import { NextResponse } from 'next/server';
import { Redis } from '@upstash/redis';

export const runtime = 'nodejs';

export async function POST() {
  try {
    // Инициализация Redis клиента
    const redis = new Redis({
      url: process.env.KV_REST_API_URL || '',
      token: process.env.KV_REST_API_TOKEN || '',
    });

    // Константы для ключей Redis
    const PROCESSED_TX_KEY = 'royalty:processed_transactions';
    const LAST_RUN_KEY = 'royalty:last_run';
    const LOGS_KEY = 'royalty:logs';

    // Добавляем запись в логи о сбросе
    await redis.lpush(LOGS_KEY, `[${new Date().toISOString()}] Database reset initiated by admin`);

    // Сбрасываем список обработанных транзакций
    await redis.del(PROCESSED_TX_KEY);
    
    // Сбрасываем время последнего запуска
    await redis.del(LAST_RUN_KEY);
    
    // Оставляем лог о сбросе, но удаляем остальные логи
    await redis.ltrim(LOGS_KEY, 0, 0);
    
    return NextResponse.json({
      success: true,
      message: 'Royalty database has been reset successfully'
    });
  } catch (error: any) {
    console.error('Error resetting royalty database:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to reset royalty database' },
      { status: 500 }
    );
  }
}