import { kv } from '@vercel/kv';
import { CollabEntry } from '@/types/collab';

const WHITELIST_LIMIT = 5555; // Изменили лимит

export async function POST(request: Request) {
try {
  const entry = await request.json();

  // Получаем текущий whitelist
  const whitelistEntries = await kv.get<CollabEntry[]>('whitelist:entries') || [];

  // Проверяем лимит
  if (whitelistEntries.length >= WHITELIST_LIMIT) {
    return Response.json(
      { error: { type: 'limit', message: 'Collab list is full' }},
      { status: 403 }
    );
  }

  // Проверяем Discord
  const isDiscordTaken = whitelistEntries.some(
    (e: CollabEntry) => e.d === entry.discord // Меняем на e.d
  );
  if (isDiscordTaken) {
    return Response.json(
      { error: { type: 'discord', message: 'This Discord account already applied' }},
      { status: 400 }
    );
  }

  // Проверяем Twitter
  const isTwitterTaken = whitelistEntries.some(
    (e: CollabEntry) => e.t.toLowerCase() === entry.twitter.toLowerCase() // Меняем на e.t
  );
  if (isTwitterTaken) {
    return Response.json(
      { error: { type: 'twitter', message: 'This Twitter handle already applied' }},
      { status: 400 }
    );
  }

  // Проверяем адрес
  const isAddressTaken = whitelistEntries.some(
    (e: CollabEntry) => e.w.toLowerCase() === entry.address.toLowerCase() // Меняем на e.w
  );
  if (isAddressTaken) {
    return Response.json(
      { error: { type: 'address', message: 'This wallet already applied' }},
      { status: 400 }
    );
  }

  // Валидация полей
  if (!entry.address || !entry.discord || !entry.twitter) { // Убрали проверку joinedAt
    return Response.json(
      { error: { type: 'validation', message: 'Missing required fields' }},
      { status: 400 }
    );
  }

  // Преобразуем входные данные в сокращенный формат
  const compactEntry: CollabEntry = {
    w: entry.address,
    d: entry.discord,
    t: entry.twitter
  };

  // Добавляем в whitelist
  try {
    await kv.set('whitelist:entries', [...whitelistEntries, compactEntry]);
    
    // Обновляем статистику
    await kv.set('whitelist:stats', {
      total: whitelistEntries.length + 1,
      remaining: WHITELIST_LIMIT - (whitelistEntries.length + 1),
      lastUpdated: new Date().toISOString()
    });

    return Response.json({ 
      success: true,
      position: whitelistEntries.length + 1,
      remaining: WHITELIST_LIMIT - (whitelistEntries.length + 1)
    });
  } catch (error) {
    return Response.json(
      { error: { type: 'database', message: 'Failed to save to database' }},
      { status: 500 }
    );
  }

} catch (error) {
  return Response.json(
    { error: { type: 'server', message: 'Failed to submit application' }},
    { status: 500 }
  );
}
}