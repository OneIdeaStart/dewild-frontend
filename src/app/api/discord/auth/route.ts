// src/app/api/whitelist/discord/auth/route.ts
import { NextResponse } from 'next/server'; // Правильный импорт для Next.js 13+

export async function GET(request: Request) {
  try {
    const DISCORD_CLIENT_ID = process.env.NEXT_PUBLIC_DISCORD_CLIENT_ID;
    const redirectUri = 'https://dewild.xyz/api/discord/callback';
    
    const oauthUrl = 'https://discord.com/oauth2/authorize' + 
      `?client_id=${DISCORD_CLIENT_ID}` + 
      `&redirect_uri=${encodeURIComponent(redirectUri)}` +
      '&response_type=code' +
      '&scope=identify%20guilds.members.read';

    return NextResponse.json({ url: oauthUrl }); // Используем NextResponse.json
  } catch (error) {
    console.error('Auth error:', error);
    return NextResponse.json({ error: 'Auth failed' }, { status: 500 });
  }
}