import { kv } from '@vercel/kv';
import { CollabEntry } from '@/types/collab';

const WHITELIST_LIMIT = 5555;

interface CollabStats {
  total: number;
  remaining: number;
}

export async function GET(request: Request) {
  try {
    const collabEntries = await kv.get<CollabEntry[]>('whitelist:entries') || [];
    const stats = await kv.get<CollabStats>('whitelist:stats') || {
      total: collabEntries.length,
      remaining: WHITELIST_LIMIT - collabEntries.length
    };

    const { searchParams } = new URL(request.url);
    const address = searchParams.get('address');
    const discord = searchParams.get('discord');
    const twitter = searchParams.get('twitter');

    if (!address && !discord && !twitter) {
      return Response.json({
        stats: {
          total: stats.total,
          remaining: stats.remaining,
          isFull: collabEntries.length >= WHITELIST_LIMIT
        }
      });
    }

    const checks = {
      address: address ? {
        isApplied: collabEntries.some(  // Изменили здесь
          (entry: CollabEntry) => entry.w.toLowerCase() === address.toLowerCase()
        ),
        position: collabEntries.findIndex(
          (entry: CollabEntry) => entry.w.toLowerCase() === address.toLowerCase()
        ) + 1,
        isFull: collabEntries.length >= WHITELIST_LIMIT
      } : undefined,
      discord: discord ? collabEntries.some(
        (entry: CollabEntry) => entry.d === discord
      ) : undefined,
      twitter: twitter ? collabEntries.some(
        (entry: CollabEntry) => entry.t.toLowerCase() === twitter.toLowerCase()
      ) : undefined,
      stats: {
        total: stats.total,
        remaining: stats.remaining,
        isFull: collabEntries.length >= WHITELIST_LIMIT
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