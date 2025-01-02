// src/app/api/whitelist/join/route.ts
import { kv } from '@vercel/kv';
import { WhitelistEntry } from '@/types/whitelist';

const WHITELIST_LIMIT = 10000;

export async function POST(request: Request) {
 try {
   console.log('Incoming POST request to /api/whitelist/join:', request);

   const entry = await request.json();
   console.log('Parsed entry data:', entry);

   // Получаем текущий whitelist
   const whitelistEntries = await kv.get<WhitelistEntry[]>('whitelist:entries') || [];
   console.log('Current whitelist data:', whitelistEntries);

   // Проверяем лимит
   if (whitelistEntries.length >= WHITELIST_LIMIT) {
     return Response.json(
       { error: { type: 'limit', message: 'Whitelist round is completed' }},
       { status: 403 }
     );
   }

   // Проверяем Discord
   const isDiscordTaken = whitelistEntries.some(
     (e: WhitelistEntry) => e.discord === entry.discord
   );
   console.log('Is Discord taken:', isDiscordTaken);
   if (isDiscordTaken) {
     return Response.json(
       { error: { type: 'discord', message: 'This Discord account is already whitelisted' }},
       { status: 400 }
     );
   }

   // Проверяем Twitter
   const isTwitterTaken = whitelistEntries.some(
     (e: WhitelistEntry) => e.twitter.toLowerCase() === entry.twitter.toLowerCase()
   );
   console.log('Is Twitter handle taken:', isTwitterTaken);
   if (isTwitterTaken) {
     return Response.json(
       { error: { type: 'twitter', message: 'This Twitter handle is already whitelisted' }},
       { status: 400 }
     );
   }

   // Проверяем адрес
   const isAddressTaken = whitelistEntries.some(
     (e: WhitelistEntry) => e.address.toLowerCase() === entry.address.toLowerCase()
   );
   console.log('Is wallet address taken:', isAddressTaken);
   if (isAddressTaken) {
     return Response.json(
       { error: { type: 'address', message: 'This wallet is already whitelisted' }},
       { status: 400 }
     );
   }

   // Валидация полей
   if (!entry.address || !entry.discord || !entry.twitter || !entry.joinedAt) {
     console.log('Missing fields:', {
       address: !entry.address,
       discord: !entry.discord,
       twitter: !entry.twitter,
       joinedAt: !entry.joinedAt
     });
     return Response.json(
       { error: { type: 'validation', message: 'Missing required fields' }},
       { status: 400 }
     );
   }

   // Добавляем в whitelist
   try {
     await kv.set('whitelist:entries', [...whitelistEntries, entry]);
     
     // Опционально: сохраняем доп. статистику
     await kv.set('whitelist:stats', {
       total: whitelistEntries.length + 1,
       remaining: WHITELIST_LIMIT - (whitelistEntries.length + 1),
       lastUpdated: new Date().toISOString()
     });

     console.log('Successfully added to whitelist:', entry);
     return Response.json({ 
       success: true,
       position: whitelistEntries.length + 1,
       remaining: WHITELIST_LIMIT - (whitelistEntries.length + 1)
     });
   } catch (error) {
     console.error('Error saving to KV:', error);
     return Response.json(
       { error: { type: 'database', message: 'Failed to save to database' }},
       { status: 500 }
     );
   }

 } catch (error) {
   console.error('Whitelist join error:', error);
   return Response.json(
     { error: { type: 'server', message: 'Failed to join whitelist' }},
     { status: 500 }
   );
 }
}