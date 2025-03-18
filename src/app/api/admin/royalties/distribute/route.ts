// src/app/api/admin/royalties/distribute/route.ts
import { NextResponse } from 'next/server';
import { manualDistribution, getRecentLogs } from '@/scripts/royalty-distributor';

export const runtime = 'nodejs';

export async function POST() {
  try {
    // Start royalty distribution
    const result = await manualDistribution();
    
    // Return result
    return NextResponse.json(result);
  } catch (error: any) {
    console.error('Error distributing royalties:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to distribute royalties' },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    // Get last 50 logs
    const logs = await getRecentLogs(50);
    
    return NextResponse.json({ logs });
  } catch (error: any) {
    console.error('Error getting royalty logs:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to get royalty logs' },
      { status: 500 }
    );
  }
}