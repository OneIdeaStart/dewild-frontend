// src/app/api/whitelist/join/route.ts
import { NextResponse } from 'next/server';
import { addToWhitelist, readWhitelist } from '@/lib/whitelist';
import { WhitelistEntry } from '@/types/whitelist';

export async function POST(request: Request) {
  try {
    console.log('Incoming POST request to /api/whitelist/join:', request);
 
    const entry = await request.json();
    console.log('Parsed entry data:', entry);
 
    const whitelist = readWhitelist();
    console.log('Current whitelist data:', whitelist);
 
    const isDiscordTaken = whitelist.entries.some(
      (e: WhitelistEntry) => e.discord === entry.discord
    );
    console.log('Is Discord taken:', isDiscordTaken);
    if (isDiscordTaken) {
      return Response.json(
        { error: { type: 'discord', message: 'This Discord account is already whitelisted' }},
        { status: 400 }
      );
    }
 
    const isTwitterTaken = whitelist.entries.some(
      (e: WhitelistEntry) => e.twitter.toLowerCase() === entry.twitter.toLowerCase()
    );
    console.log('Is Twitter handle taken:', isTwitterTaken);
    if (isTwitterTaken) {
      return Response.json(
        { error: { type: 'twitter', message: 'This Twitter handle is already whitelisted' }},
        { status: 400 }
      );
    }
 
    const isAddressTaken = whitelist.entries.some(
      (e: WhitelistEntry) => e.address.toLowerCase() === entry.address.toLowerCase()
    );
    console.log('Is wallet address taken:', isAddressTaken);
    if (isAddressTaken) {
      return Response.json(
        { error: { type: 'address', message: 'This wallet is already whitelisted' }},
        { status: 400 }
      );
    }
 
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
 
    console.log('Adding to whitelist:', entry);
    const result = await addToWhitelist(entry);
    console.log('Add to whitelist result:', result);
 
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
 