import { DB } from '@/lib/db';
import { CollabApplication, CollabStats } from '@/types/collab';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const address = searchParams.get('address');
    const discord = searchParams.get('discord');
    const twitter = searchParams.get('twitter');

    // Get statistics
    const stats = await DB.getStats();

    if (!address && !discord && !twitter) {
      return Response.json({ stats });
    }

    // Get data for checks
    const application = address 
      ? await DB.getApplicationByWallet(address)
      : twitter 
        ? await DB.getApplicationByTwitter(twitter)
        : null;

    // Ensure that status will always be one of the valid values
    const status = application?.status || 'pending';
    
    const checks = {
      address: address ? {
        isApplied: Boolean(application),
        status: status as 'pending' | 'approved' | 'rejected',
        isFull: stats.isFull
      } : undefined,
      twitter: twitter ? Boolean(application) : undefined,
      stats
    };

    return Response.json(checks);
  } catch (error) {
    console.error('Check error:', error);
    return Response.json(
      { error: 'Check failed' },
      { status: 500 }
    );
  }
}