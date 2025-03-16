// src/app/api/collab/application/route.ts
import { NextResponse } from 'next/server';
import { DB } from '@/lib/db';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const wallet = searchParams.get('wallet');
    const id = searchParams.get('id');

    if (!wallet && !id) {
      return Response.json({ error: 'Wallet address or application ID is required' }, { status: 400 });
    }

    let application;
    
    if (id) {
      application = await DB.getApplicationById(id);
    } else if (wallet) {
      application = await DB.getApplicationByWallet(wallet);
    }
    
    if (!application) {
      return Response.json({ error: 'Application not found' }, { status: 404 });
    }

    return Response.json(application);
  } catch (error: any) {
    console.error('Error fetching application:', error);
    return Response.json(
      { error: 'Failed to fetch application', details: error?.message },
      { status: 500 }
    );
  }
}