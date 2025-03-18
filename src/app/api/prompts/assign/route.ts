import { NextResponse } from 'next/server';
import { DB } from '@/lib/db';
import { PROMPT_KEYS } from '@/types/prompt';
import { Redis } from '@upstash/redis';

// Create Redis client
const redis = new Redis({
  url: process.env.KV_REST_API_URL!,
  token: process.env.KV_REST_API_TOKEN!
});

export async function GET(request: Request) {
  try {
    // Get wallet address from request
    const { searchParams } = new URL(request.url);
    const wallet = searchParams.get('wallet');

    if (!wallet) {
      return NextResponse.json({ error: 'Wallet address is required' }, { status: 400 });
    }

    // Check existence and status of application
    const application = await DB.getApplicationByWallet(wallet);
    
    if (!application) {
      return NextResponse.json({ error: 'Application not found' }, { status: 404 });
    }
    
    // Add 'nft_rejected' to list of allowed statuses
    if (application.status !== 'approved' && 
        application.status !== 'prompt_received' && 
        application.status !== 'nft_rejected') {
      return NextResponse.json({ 
        error: 'Application is not approved',
        status: application.status  
      }, { status: 403 });
    }

    // Check if there's already an assigned prompt
    if (application.promptId) {
        console.log("Found existing promptId:", application.promptId);
        
        // Get existing prompt
        const promptKey = PROMPT_KEYS.getStatusKey(application.promptId);
        console.log("Looking for prompt at key:", promptKey);
        
        const existingPrompt = await redis.hgetall(promptKey);
        console.log("Existing prompt data:", existingPrompt);
        
        if (existingPrompt && Object.keys(existingPrompt).length > 0) {
        return NextResponse.json({ 
            prompt: existingPrompt,
            isNew: false 
        });
        } else {
        console.log("Prompt not found in Redis, will assign a new one");
        }
    }

    // Get random prompt from available ones
    const promptId = await redis.srandmember(PROMPT_KEYS.AVAILABLE);
    
    if (!promptId) {
      return NextResponse.json({ error: 'No available prompts' }, { status: 500 });
    }

    // Get prompt data
    const promptData = await redis.hgetall(PROMPT_KEYS.getStatusKey(String(promptId)));
    
    // Update prompt status to assigned
    await redis.srem(PROMPT_KEYS.AVAILABLE, String(promptId));
    await redis.sadd(PROMPT_KEYS.ASSIGNED, String(promptId));
    await redis.hset(PROMPT_KEYS.getStatusKey(String(promptId)), {
      status: 'assigned',
      assignedTo: wallet,
      assignedAt: new Date().toISOString()
    });

    // Update application - change status and add promptId
    await DB.updateStatus(application.id, 'prompt_received');
    await DB.updateApplicationPrompt(application.id, String(promptId));

    return NextResponse.json({ 
      prompt: promptData, 
      isNew: true 
    });

  } catch (error: any) {
    console.error('Error assigning prompt:', error);
    return NextResponse.json(
      { error: 'Failed to assign prompt', details: error?.message },
      { status: 500 }
    );
  }
}