// src/app/api/admin/applications/[id]/route.ts
import { NextResponse } from 'next/server';
import { type NextRequest } from 'next/server';
import { DB } from '@/lib/db';
import { DiscordDB } from '@/lib/db/discord';
import { discordService } from '@/lib/discord';
import { del } from '@vercel/blob';
import { kv } from '@vercel/kv';

export async function DELETE(
  request: NextRequest,
  { params }: any
) {
  try {
    const id = (await params).id;
    
    // Get application
    const app = await DB.getApplicationById(id);
    if (!app) {
      return NextResponse.json(
        { error: 'Application not found' },
        { status: 404 }
      );
    }

    // Save Discord channel ID before deleting application
    const channelId = app.discordChannelId;

    // If application is already approved at contract level, need to revoke permission first
    if (app.status === 'nft_approved' || app.status === 'minted') {
      // Determine base URL
      const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 
                     (request.headers.get('host') ? `http://${request.headers.get('host')}` : 'http://localhost:3000');
      
      try {
        // Call artist revocation in contract
        const revokeResponse = await fetch(`${baseUrl}/api/contracts/revoke-artist`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ 
            wallet: app.wallet,
            applicationId: id
          }),
        });
        
        console.log('Revoke response status:', revokeResponse.status);
        
        // Get revocation result
        const revokeResult = await revokeResponse.json();
        console.log('Revoke response data:', revokeResult);
        
        // If revocation failed, return error and DO NOT delete application
        if (!revokeResponse.ok) {
          return NextResponse.json({
            success: false,
            error: `Cannot delete application: Contract revocation failed: ${revokeResult.error || 'Unknown error'}`
          }, { status: 500 });
        }
        
        // If revocation is successful or artist was already revoked, delete application
        if (revokeResult.success) {
          await DB.deleteApplication(id);
          
          // Delete Discord channel if it exists
          if (channelId) {
            try {
              await discordService.deleteChannel(channelId);
              console.log(`Discord channel ${channelId} for application ${id} deleted`);
            } catch (discordError) {
              console.error(`Failed to delete Discord channel: ${discordError}`);
              // Continue execution even if failed to delete channel
            }
          }
          
          return NextResponse.json({ 
            success: true,
            message: revokeResult.wasAlreadyRevoked ? 
              'Application deleted (artist was already revoked)' : 
              'Application deleted and artist revoked successfully'
          });
        } else {
          // If result.success === false, but we reached this point,
          // something went wrong with the logic
          return NextResponse.json({
            success: false,
            error: 'Unexpected error with contract revocation'
          }, { status: 500 });
        }
      } catch (error: any) {
        console.error('Error during revoke artist:', error);
        return NextResponse.json({
          success: false,
          error: `Error during revoke process: ${error.message || 'Unknown error'}`
        }, { status: 500 });
      }
    }

    // If application status doesn't require revocation from contract, just delete it
    await DB.deleteApplication(id);
    
    // Delete Discord channel if it exists
    if (channelId) {
      console.log(`Attempting to delete Discord channel ${channelId} for application ${id}`);
      try {
        const deleted = await discordService.deleteChannel(channelId);
        if (deleted) {
          console.log(`Discord channel ${channelId} for application ${id} deleted successfully`);
        } else {
          console.error(`Failed to delete Discord channel ${channelId} - API returned failure`);
        }
      } catch (discordError) {
        console.error(`Exception while deleting Discord channel ${channelId}:`, discordError);
      }
    }
    
    return NextResponse.json({ success: true });
    
  } catch (error: any) {
    return NextResponse.json(
      { error: 'Failed to delete application', details: error?.message },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest, { params }: any) {
  try {
    const id = (await params).id;
    const data = await request.json();
    
    // Get current application to save promptId
    const application = await DB.getApplicationById(id);
    if (!application) {
      return NextResponse.json({ error: 'Application not found' }, { status: 404 });
    }
    
    // Process action
    if (data.action === 'approve') {
      await DB.updateStatus(id, 'approved');
      
      // Get updated application and update Discord channel
      const updatedApp = await DB.getApplicationById(id);
      if (updatedApp) {
        try {
          await DiscordDB.updateDiscordChannelStatus(updatedApp);
          console.log(`Discord channel for application ${id} updated to status 'approved'`);
        } catch (discordError) {
          console.error(`Failed to update Discord channel: ${discordError}`);
          // Continue execution even if failed to update channel
        }
      }
      
    } else if (data.action === 'reject') {
      await DB.updateStatus(id, 'rejected');
      
      // Get updated application and update Discord channel
      const updatedApp = await DB.getApplicationById(id);
      if (updatedApp) {
        try {
          await DiscordDB.updateDiscordChannelStatus(updatedApp);
          console.log(`Discord channel for application ${id} updated to status 'rejected'`);
        } catch (discordError) {
          console.error(`Failed to update Discord channel: ${discordError}`);
        }
      }
      
    } else if (data.action === 'approve_nft') {
      // Get application information
      const application = await DB.getApplicationById(id);
      if (!application) {
        return NextResponse.json({ error: 'Application not found' }, { status: 404 });
      }
      
      try {
        // Determine base URL
        const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 
                       (request.headers.get('host') ? `http://${request.headers.get('host')}` : 'http://localhost:3000');
        
        // Call contract to add artist to whitelist and get signature
        const contractResponse = await fetch(`${baseUrl}/api/contracts/approve-artist`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ 
            wallet: application.wallet,
            applicationId: id
          }),
        });
        
        if (!contractResponse.ok) {
          const errorData = await contractResponse.json();
          
          // Don't update status if contract wasn't updated
          return NextResponse.json({ 
            success: false, 
            error: `Contract approval failed: ${errorData.error || 'Unknown error'}` 
          }, { status: 500 });
        }
        
        // Get operation result
        const contractResult = await contractResponse.json();
        
        // Only if contract is updated and signature is received, update status
        if (contractResult.success) {
          await DB.updateStatus(id, 'nft_approved');
          
          // Get updated application and update Discord channel
          const updatedApp = await DB.getApplicationById(id);
          if (updatedApp) {
            try {
              await DiscordDB.updateDiscordChannelStatus(updatedApp);
              console.log(`Discord channel for application ${id} updated to status 'nft_approved'`);
            } catch (discordError) {
              console.error(`Failed to update Discord channel: ${discordError}`);
            }
          }
          
          return NextResponse.json({ 
            success: true, 
            transaction: contractResult.txHash,
            signature: contractResult.signature,
            wasAlreadyApproved: contractResult.wasAlreadyApproved
          });
        } else {
          return NextResponse.json({ 
            success: false, 
            error: 'Failed to approve artist in contract' 
          }, { status: 500 });
        }
        
      } catch (error: any) {
        // Don't update status on error
        return NextResponse.json({ 
          success: false, 
          error: `Contract approval failed: ${error.message || 'Unknown error'}`
        }, { status: 500 });
      }

    } else if (data.action === 'reject_nft') {
      // Get application information
      const application = await DB.getApplicationById(id);
      if (!application) {
        return NextResponse.json({ error: 'Application not found' }, { status: 404 });
      }
    
      try {
        // Delete old image from blob storage if it exists
        if (application.imageUrl) {
          try {
            // Try to get file name from URL
            const imagePathMatch = application.imageUrl.match(/\/([^\/]+\.[^\/]+)$/);
            if (imagePathMatch && imagePathMatch[1]) {
              const fileName = imagePathMatch[1];
              
              // If URL contains nft-images, delete with this path
              if (application.imageUrl.includes('/nft-images/')) {
                await del('nft-images/' + fileName);
              } else {
                // Otherwise delete the file directly
                await del(fileName);
              }
            }
          } catch (error) {
            // If failed to delete, continue execution
          }
        }
    
        // Update status
        await DB.updateStatus(id, 'nft_rejected');
        
        // Clear image URL in application
        await kv.hset(`application:${id}`, {
          imageUrl: null,
          imageUploadedAt: null
        });
        
        // Get updated application and update Discord channel
        const updatedApp = await DB.getApplicationById(id);
        if (updatedApp) {
          try {
            await DiscordDB.updateDiscordChannelStatus(updatedApp);
            console.log(`Discord channel for application ${id} updated to status 'nft_rejected'`);
          } catch (discordError) {
            console.error(`Failed to update Discord channel: ${discordError}`);
          }
        }
    
        return NextResponse.json({ success: true });
      } catch (error: any) {
        return NextResponse.json(
          { error: 'Failed to reject NFT', details: error?.message },
          { status: 500 }
        );
      }
    }        

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error in PATCH route:', error);
    return NextResponse.json(
      { error: 'Failed to update application', details: error?.message },
      { status: 500 }
    );
  }
}