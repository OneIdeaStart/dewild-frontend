// src/app/api/contracts/approve-artist/route.ts
import { NextResponse } from 'next/server';
import { ethers } from 'ethers';
import { CONTRACTS, ABIS } from '@/lib/web3/contracts';
import { DB } from '@/lib/db';

// Get configuration from environment variables
const PRIVATE_KEY = process.env.CONTRACT_ADMIN_PRIVATE_KEY || '';
const RPC_URL = process.env.BASE_MAINNET_RPC_URL || 'https://mainnet.base.org';

export async function POST(request: Request) {
    try {
      // Read request body only once
      const requestData = await request.json();
      const { wallet, applicationId } = requestData;
      
      if (!wallet) {
        return NextResponse.json({ error: 'Artist wallet address is required' }, { status: 400 });
      }
    
      if (!applicationId) {
        return NextResponse.json({ error: 'Application ID is required' }, { status: 400 });
      }
    
      // Check wallet validity
      if (!wallet.match(/^0x[a-fA-F0-9]{40}$/)) {
        return NextResponse.json({ error: 'Invalid wallet address format' }, { status: 400 });
      }
    
      // Check for private key presence
      if (!PRIVATE_KEY || PRIVATE_KEY === '') {
        return NextResponse.json({ 
          error: 'CONTRACT_ADMIN_PRIVATE_KEY environment variable is not set' 
        }, { status: 500 });
      }
    
      // Provider and wallet setup
      let provider;
      try {
        provider = new ethers.JsonRpcProvider(RPC_URL);
      } catch (providerError: any) {
        return NextResponse.json({ 
          error: `Failed to initialize provider: ${providerError.message}` 
        }, { status: 500 });
      }
    
      let adminWallet;
      try {
          adminWallet = new ethers.Wallet(PRIVATE_KEY, provider);
      } catch (walletError: any) {
          return NextResponse.json({ 
              error: `Failed to initialize wallet: ${walletError.message}` 
          }, { status: 500 });
      }
    
      try {
        // Check network connection
        const network = await provider.getNetwork();
        
        // Get admin wallet balance
        const adminBalance = await provider.getBalance(adminWallet.address);
        
        if (adminBalance === BigInt(0)) {
          return NextResponse.json({ 
            error: 'Admin wallet has no ETH for gas' 
          }, { status: 500 });
        }
      } catch (networkError: any) {
        return NextResponse.json({ 
          error: `Failed to connect to network: ${networkError.message}` 
        }, { status: 500 });
      }
    
      // Get DeWildClub contract address
      const contractAddress = CONTRACTS.MAINNET.DeWildClub;
      
      // Fix: Use first element of ABI array
      const abi = ABIS.DeWildClub as any;
      
      // Create contract instance
      let contract;
      try {
        contract = new ethers.Contract(
          contractAddress, 
          abi, 
          adminWallet
        );
      } catch (contractError: any) {
        return NextResponse.json({ 
          error: `Failed to create contract instance: ${contractError.message}` 
        }, { status: 500 });
      }
      
      // Check if this artist is already approved
      let isApproved;
      try {
        isApproved = await contract.approvedArtists(wallet);
      } catch (approvedCheckError: any) {
        return NextResponse.json({ 
          error: `Failed to check if artist is approved: ${approvedCheckError.message}` 
        }, { status: 500 });
      }
      
      let txHash = '';
      
      if (!isApproved) {
        try {
          // Call artist approval function
          const tx = await contract.approveArtist(wallet);
          
          // Wait for transaction confirmation
          const receipt = await tx.wait();
          txHash = receipt.hash;
        } catch (approveError: any) {
          return NextResponse.json({ 
            error: `Failed to approve artist in contract: ${approveError.message}` 
          }, { status: 500 });
        }
      }
      
      // Generate signature for minting
      let signature;
      try {
        // Hash artist address according to contract format
        const messageHash = ethers.keccak256(
          ethers.solidityPacked(['address'], [wallet])
        );
        
        // Sign hash
        signature = await adminWallet.signMessage(ethers.getBytes(messageHash));
      } catch (signError: any) {
        return NextResponse.json({ 
          error: `Failed to generate signature: ${signError.message}` 
        }, { status: 500 });
      }
      
      // Save signature in database
      try {
        await DB.saveNFTSignature(applicationId, signature);
      } catch (dbError: any) {
        return NextResponse.json({ 
          error: `Failed to save signature to database: ${dbError.message}`,
          wasApproved: true,  // Contract might have been updated, but signature wasn't saved
          txHash,
          signature
        }, { status: 500 });
      }
      
      return NextResponse.json({ 
        success: true, 
        message: 'Artist approved and signature generated',
        wasAlreadyApproved: isApproved,
        txHash,
        signature
      });
      
    } catch (error: any) {
        return NextResponse.json(
        { error: error.message || 'Failed to approve artist in contract' },
        { status: 500 }
        );
    }
}