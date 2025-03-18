// src/app/api/discord/webhook/route.ts
import { NextResponse } from 'next/server';

// Check Discord signature to protect webhook
function verifyDiscordSignature(request: Request): boolean {
  // In a real application, X-Signature-Ed25519 and X-Signature-Timestamp should be verified
  // Simplified implementation for MVP
  const signature = request.headers.get('X-Signature-Ed25519');
  const timestamp = request.headers.get('X-Signature-Timestamp');
  
  // In real implementation, signature should be verified here
  return true;
}

export async function POST(request: Request) {
  try {
    // Check request signature from Discord
    if (!verifyDiscordSignature(request)) {
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
    }
    
    // Parse request data
    const data = await request.json();
    
    // Process only PING requests for connection check
    if (data.type === 1) {
      return NextResponse.json({ type: 1 });
    }
    
    // For all other requests return standard response
    return NextResponse.json({
      type: 4,
      data: {
        content: "Commands are temporarily disabled. Please check the dashboard at https://dewild.club/dashboard for updates.",
        flags: 64 // Ephemeral message (visible only to sender)
      }
    });
  } catch (error) {
    console.error('Error in Discord webhook:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}