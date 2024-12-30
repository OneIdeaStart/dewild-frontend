// src/app/api/whitelist/join/route.ts
import { NextResponse } from 'next/server';
import { addToWhitelist, readWhitelist } from '@/lib/whitelist';
import { WhitelistEntry } from '@/types/whitelist';

export async function POST(request: Request) {
 try {
   const entry = await request.json();
   
   console.log('Received entry:', entry);

   // Читаем текущий whitelist
   const whitelist = readWhitelist();

   // Проверяем уникальность Discord
   const isDiscordTaken = whitelist.entries.some(
    (e: WhitelistEntry) => e.discord === entry.discord
   );
   if (isDiscordTaken) {
     return Response.json(
       { error: { type: 'discord', message: 'This Discord account is already whitelisted' }},
       { status: 400 }
     );
   }

   // Проверяем уникальность Twitter
   const isTwitterTaken = whitelist.entries.some(
    (e: WhitelistEntry) => e.twitter.toLowerCase() === entry.twitter.toLowerCase()
   );
   if (isTwitterTaken) {
     return Response.json(
       { error: { type: 'twitter', message: 'This Twitter handle is already whitelisted' }},
       { status: 400 }
     );
   }

   // Проверяем адрес
   const isAddressTaken = whitelist.entries.some(
    (e: WhitelistEntry) => e.address.toLowerCase() === entry.address.toLowerCase()
   );
   if (isAddressTaken) {
     return Response.json(
       { error: { type: 'address', message: 'This wallet is already whitelisted' }},
       { status: 400 }
     );
   }

   // Проверяем наличие всех полей
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

   const result = await addToWhitelist(entry);

   if (!result.success) {
     return Response.json(
       { error: result.error },
       { status: 400 }
     );
   }

   return Response.json({ success: true });

 } catch (error) {
   console.error('Whitelist join error:', error);
   return Response.json(
     { error: { type: 'server', message: 'Failed to join whitelist' }},
     { status: 500 }
   );
 }
}