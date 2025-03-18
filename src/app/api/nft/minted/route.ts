// src/app/api/nft/minted/route.ts
import { NextResponse } from 'next/server';
import { DB } from '@/lib/db';
import { kv } from '@vercel/kv';

export async function POST(request: Request) {
  try {
    const { wallet, txHash } = await request.json();
    
    if (!wallet || !txHash) {
      return NextResponse.json({ error: 'Wallet and txHash are required' }, { status: 400 });
    }
    
    // Get application
    const application = await DB.getApplicationByWallet(wallet);
    
    if (!application) {
      return NextResponse.json({ error: 'Application not found' }, { status: 404 });
    }
    
    // Update status to minted
    await DB.updateStatus(application.id, 'minted');
    
    // Save transaction hash and timestamp
    await kv.hset(`application:${application.id}`, {
      mintTransaction: txHash,
      mintedAt: new Date().toISOString()
    });
    
    return NextResponse.json({ 
      success: true, 
      message: 'NFT status updated to minted',
      nftNumber: application.nftNumber // Return nftNumber from application
    });
    
  } catch (error: any) {
    console.error('Error updating mint status:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to update mint status' },
      { status: 500 }
    );
  }
}