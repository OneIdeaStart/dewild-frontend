// src/app/api/admin/royalties/reset/route.ts
import { NextResponse } from 'next/server';
import { Redis } from '@upstash/redis';

export const runtime = 'nodejs';

export async function POST() {
  try {
    // Initialize Redis client
    const redis = new Redis({
      url: process.env.KV_REST_API_URL || '',
      token: process.env.KV_REST_API_TOKEN || '',
    });

    // Constants for Redis keys
    const PROCESSED_TX_KEY = 'royalty:processed_transactions';
    const LAST_RUN_KEY = 'royalty:last_run';
    const LOGS_KEY = 'royalty:logs';

    // Add record to logs about reset
    await redis.lpush(LOGS_KEY, `[${new Date().toISOString()}] Database reset initiated by admin`);

    // Reset list of processed transactions
    await redis.del(PROCESSED_TX_KEY);
    
    // Reset last run time
    await redis.del(LAST_RUN_KEY);
    
    // Keep log about reset, but delete other logs
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