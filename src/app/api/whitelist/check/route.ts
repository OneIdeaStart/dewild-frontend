// src/app/api/whitelist/check/route.ts
import { kv } from '@vercel/kv';
import { WhitelistEntry } from '@/types/whitelist';

const WHITELIST_LIMIT = 10000;

interface WhitelistStats {
  total: number;
  remaining: number;
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const address = searchParams.get('address');
    const discord = searchParams.get('discord');
    const twitter = searchParams.get('twitter');

    if (!address && !discord && !twitter) {
      return Response.json(
        { error: 'No parameters provided' },
        { status: 400 }
      );
    }

    // Получаем текущий whitelist
    const whitelistEntries = await kv.get<WhitelistEntry[]>('whitelist:entries') || [];
    const stats = await kv.get<WhitelistStats>('whitelist:stats') || {
      total: whitelistEntries.length,
      remaining: WHITELIST_LIMIT - whitelistEntries.length
    };

    const checks = {
      address: address ? {
        isWhitelisted: whitelistEntries.some(
          (entry: WhitelistEntry) => entry.address.toLowerCase() === address.toLowerCase()
        ),
        position: whitelistEntries.findIndex(
          (entry: WhitelistEntry) => entry.address.toLowerCase() === address.toLowerCase()
        ) + 1
      } : undefined,
      discord: discord ? whitelistEntries.some(
        (entry: WhitelistEntry) => entry.discord === discord
      ) : undefined,
      twitter: twitter ? whitelistEntries.some(
        (entry: WhitelistEntry) => entry.twitter.toLowerCase() === twitter.toLowerCase()
      ) : undefined,
      stats: {
        total: stats.total,
        remaining: stats.remaining,
        isFull: stats.total >= WHITELIST_LIMIT
      }
    };

    return Response.json(checks);
  } catch (error) {
    console.error('Check error:', error);
    return Response.json(
      { error: 'Check failed' },
      { status: 500 }
    );
  }
}