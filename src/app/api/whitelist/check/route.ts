import { kv } from '@vercel/kv';
import { WhitelistEntry } from '@/types/whitelist';

const WHITELIST_LIMIT = 5555;

interface WhitelistStats {
  total: number;
  remaining: number;
}

export async function GET(request: Request) {
  try {
    // Сначала получаем данные
    const whitelistEntries = await kv.get<WhitelistEntry[]>('whitelist:entries') || [];
    const stats = await kv.get<WhitelistStats>('whitelist:stats') || {
      total: whitelistEntries.length,
      remaining: WHITELIST_LIMIT - whitelistEntries.length
    };

    // Затем проверяем параметры
    const { searchParams } = new URL(request.url);
    const address = searchParams.get('address');
    const discord = searchParams.get('discord');
    const twitter = searchParams.get('twitter');

    // Если параметров нет, возвращаем только статистику
    if (!address && !discord && !twitter) {
      return Response.json({
        stats: {
          total: stats.total,
          remaining: stats.remaining,
          isFull: whitelistEntries.length >= WHITELIST_LIMIT
        }
      });
    }

    // Остальные проверки
    const checks = {
      address: address ? {
        isWhitelisted: whitelistEntries.some(
          (entry: WhitelistEntry) => entry.w.toLowerCase() === address.toLowerCase()
        ),
        position: whitelistEntries.findIndex(
          (entry: WhitelistEntry) => entry.w.toLowerCase() === address.toLowerCase()
        ) + 1,
        isFull: whitelistEntries.length >= WHITELIST_LIMIT
      } : undefined,
      discord: discord ? whitelistEntries.some(
        (entry: WhitelistEntry) => entry.d === discord
      ) : undefined,
      twitter: twitter ? whitelistEntries.some(
        (entry: WhitelistEntry) => entry.t.toLowerCase() === twitter.toLowerCase()
      ) : undefined,
      stats: {
        total: stats.total,
        remaining: stats.remaining,
        isFull: whitelistEntries.length >= WHITELIST_LIMIT
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