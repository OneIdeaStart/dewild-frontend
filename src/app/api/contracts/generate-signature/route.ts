// src/app/api/contracts/generate-signature/route.ts
import { NextResponse } from 'next/server';
import { ethers } from 'ethers';

const PRIVATE_KEY = process.env.CONTRACT_ADMIN_PRIVATE_KEY || '';

export async function POST(request: Request) {
  try {
    const { wallet } = await request.json();
    
    if (!wallet) {
      return NextResponse.json({ error: 'Wallet address is required' }, { status: 400 });
    }
    
    // Check wallet validity
    if (!wallet.match(/^0x[a-fA-F0-9]{40}$/)) {
      return NextResponse.json({ error: 'Invalid wallet address format' }, { status: 400 });
    }
    
    // Create signature
    const adminWallet = new ethers.Wallet(PRIVATE_KEY);
    
    // Hash artist address according to contract format
    const messageHash = ethers.keccak256(
      ethers.solidityPacked(['address'], [wallet])
    );
    
    // Sign hash
    const signature = await adminWallet.signMessage(ethers.getBytes(messageHash));
    
    return NextResponse.json({ 
      success: true, 
      signature
    });
    
  } catch (error: any) {
    console.error('Error generating signature:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to generate signature' },
      { status: 500 }
    );
  }
}