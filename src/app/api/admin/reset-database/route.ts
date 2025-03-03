// src/app/api/admin/reset-database/route.ts
import { NextResponse } from 'next/server';
import { kv } from '@vercel/kv';
import { DB } from '@/lib/db';
import { PROMPT_KEYS } from '@/types/prompt';

// Simple admin key for endpoint protection (use more robust authentication in production)
const ADMIN_KEY = process.env.ADMIN_SECRET_KEY || 'your-secret-admin-key';

export async function POST(request: Request) {
  try {
    const data = await request.json();
    const { adminKey } = data;
    
    // Check authorization
    if (adminKey !== ADMIN_KEY) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // 1. Get all applications
    const applicationIds = await kv.smembers(DB.KEYS.ALL_APPLICATIONS);
    
    // 2. Delete all applications
    for (const id of applicationIds) {
      // Get application to know wallet and twitter
      const app = await DB.getApplicationById(id);
      
      if (app) {
        // Remove from all sets
        await kv.srem(DB.KEYS.ALL_APPLICATIONS, id);
        await kv.srem(`applications:${app.status}`, id);
        await kv.hdel(DB.KEYS.BY_WALLET, app.wallet.toLowerCase());
        await kv.hdel(DB.KEYS.BY_TWITTER, app.twitter.toLowerCase());
        
        // Remove the application itself
        await kv.del(`application:${id}`);
      }
    }
    
    // 3. Reset NFT counter
    await kv.set('nft:counter', 0);
    
    // 4. Clear NFT data
    const nftKeys = await kv.keys('nft:*');
    for (const key of nftKeys) {
      await kv.del(key);
    }
    
    // 5. Reset prompt statuses to 'available'
    const assignedPrompts = await kv.smembers('prompts:assigned');
    const usedPrompts = await kv.smembers('prompts:used');
    
    // Move prompts from assigned and used to available
    for (const promptId of [...assignedPrompts, ...usedPrompts]) {
      // Remove from current sets
      await kv.srem('prompts:assigned', promptId);
      await kv.srem('prompts:used', promptId);
      
      // Add to available
      await kv.sadd(PROMPT_KEYS.AVAILABLE, promptId);
      
      // Update prompt status
      await kv.hset(PROMPT_KEYS.getStatusKey(promptId), {
        status: 'available',
        assignedTo: null,
        assignedAt: null,
        usedAt: null
      });
    }
    
    return NextResponse.json({ 
      success: true, 
      message: 'Database reset successful',
      details: {
        applications: applicationIds.length,
        prompts: assignedPrompts.length + usedPrompts.length
      }
    });
    
  } catch (error: any) {
    console.error('Error resetting database:', error);
    return NextResponse.json(
      { error: 'Failed to reset database', details: error?.message },
      { status: 500 }
    );
  }
}