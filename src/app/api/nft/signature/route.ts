// src/app/api/nft/signature/route.ts
import { NextResponse } from 'next/server';
import { DB } from '@/lib/db';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const wallet = searchParams.get('wallet');
    
    if (!wallet) {
      return NextResponse.json({ error: 'Wallet address is required' }, { status: 400 });
    }
    
    // Получаем заявку
    const application = await DB.getApplicationByWallet(wallet);
    
    if (!application) {
      return NextResponse.json({ error: 'Application not found' }, { status: 404 });
    }
    
    if (application.status !== 'nft_approved') {
      return NextResponse.json({ 
        error: 'NFT not approved for minting',
        status: application.status
      }, { status: 400 });
    }
    
    // Получаем сохраненную подпись
    const signature = await DB.getNFTSignature(wallet);
    console.log(`Signature for wallet ${wallet}:`, signature);
    
    if (!signature) {
      return NextResponse.json({ 
        error: 'Signature not found, please contact admin', 
      }, { status: 404 });
    }
    
    return NextResponse.json({ 
      signature,
      applicationId: application.id
    });
    
  } catch (error: any) {
    console.error('Error getting signature:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to get signature' },
      { status: 500 }
    );
  }
}