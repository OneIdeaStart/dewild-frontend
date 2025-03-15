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
    
    // Получаем заявку
    const app = await DB.getApplicationById(id);
    if (!app) {
      return NextResponse.json(
        { error: 'Application not found' },
        { status: 404 }
      );
    }

    // Сохраняем ID канала Discord перед удалением заявки
    const channelId = app.discordChannelId;

    // Если заявка уже одобрена на уровне контракта, нужно сначала отозвать разрешение
    if (app.status === 'nft_approved' || app.status === 'minted') {
      // Определяем базовый URL
      const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 
                     (request.headers.get('host') ? `http://${request.headers.get('host')}` : 'http://localhost:3000');
      
      try {
        // Вызываем отзыв артиста в контракте
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
        
        // Получаем результат отзыва
        const revokeResult = await revokeResponse.json();
        console.log('Revoke response data:', revokeResult);
        
        // Если отзыв не удался, возвращаем ошибку и НЕ удаляем заявку
        if (!revokeResponse.ok) {
          return NextResponse.json({
            success: false,
            error: `Cannot delete application: Contract revocation failed: ${revokeResult.error || 'Unknown error'}`
          }, { status: 500 });
        }
        
        // Если отзыв успешен или артист уже был отозван, удаляем заявку
        if (revokeResult.success) {
          await DB.deleteApplication(id);
          
          // Удаляем Discord канал, если он существует
          if (channelId) {
            try {
              await discordService.deleteChannel(channelId);
              console.log(`Discord channel ${channelId} for application ${id} deleted`);
            } catch (discordError) {
              console.error(`Failed to delete Discord channel: ${discordError}`);
              // Продолжаем выполнение, даже если не удалось удалить канал
            }
          }
          
          return NextResponse.json({ 
            success: true,
            message: revokeResult.wasAlreadyRevoked ? 
              'Application deleted (artist was already revoked)' : 
              'Application deleted and artist revoked successfully'
          });
        } else {
          // Если result.success === false, но при этом мы дошли до этой точки,
          // значит что-то пошло не так с логикой
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

    // Если статус заявки не требует отзыва из контракта, просто удаляем её
    await DB.deleteApplication(id);
    
    // Удаляем Discord канал, если он существует
    if (channelId) {
      try {
        await discordService.deleteChannel(channelId);
        console.log(`Discord channel ${channelId} for application ${id} deleted`);
      } catch (discordError) {
        console.error(`Failed to delete Discord channel: ${discordError}`);
        // Продолжаем выполнение, даже если не удалось удалить канал
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
    
    // Получаем текущую заявку, чтобы сохранить promptId
    const application = await DB.getApplicationById(id);
    if (!application) {
      return NextResponse.json({ error: 'Application not found' }, { status: 404 });
    }
    
    // Обрабатываем действие
    if (data.action === 'approve') {
      await DB.updateStatus(id, 'approved');
      
      // Получаем обновленную заявку и обновляем Discord канал
      const updatedApp = await DB.getApplicationById(id);
      if (updatedApp) {
        try {
          await DiscordDB.updateDiscordChannelStatus(updatedApp);
          console.log(`Discord channel for application ${id} updated to status 'approved'`);
        } catch (discordError) {
          console.error(`Failed to update Discord channel: ${discordError}`);
          // Продолжаем выполнение, даже если не удалось обновить канал
        }
      }
      
    } else if (data.action === 'reject') {
      await DB.updateStatus(id, 'rejected');
      
      // Получаем обновленную заявку и обновляем Discord канал
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
      // Получаем информацию о заявке
      const application = await DB.getApplicationById(id);
      if (!application) {
        return NextResponse.json({ error: 'Application not found' }, { status: 404 });
      }
      
      try {
        // Определяем базовый URL
        const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 
                       (request.headers.get('host') ? `http://${request.headers.get('host')}` : 'http://localhost:3000');
        
        // Вызываем контракт для добавления артиста в вайтлист и получения подписи
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
          
          // Не обновляем статус, если контракт не был обновлен
          return NextResponse.json({ 
            success: false, 
            error: `Contract approval failed: ${errorData.error || 'Unknown error'}` 
          }, { status: 500 });
        }
        
        // Получаем результат операции
        const contractResult = await contractResponse.json();
        
        // Только если контракт обновлен и подпись получена, обновляем статус
        if (contractResult.success) {
          await DB.updateStatus(id, 'nft_approved');
          
          // Получаем обновленную заявку и обновляем Discord канал
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
        // Не обновляем статус при ошибке
        return NextResponse.json({ 
          success: false, 
          error: `Contract approval failed: ${error.message || 'Unknown error'}`
        }, { status: 500 });
      }

    } else if (data.action === 'reject_nft') {
      // Получаем информацию о заявке
      const application = await DB.getApplicationById(id);
      if (!application) {
        return NextResponse.json({ error: 'Application not found' }, { status: 404 });
      }
    
      try {
        // Удаляем старое изображение из блоб-хранилища, если оно есть
        if (application.imageUrl) {
          try {
            // Пробуем получить имя файла из URL
            const imagePathMatch = application.imageUrl.match(/\/([^\/]+\.[^\/]+)$/);
            if (imagePathMatch && imagePathMatch[1]) {
              const fileName = imagePathMatch[1];
              
              // Если URL содержит nft-images, удаляем с этим путем
              if (application.imageUrl.includes('/nft-images/')) {
                await del('nft-images/' + fileName);
              } else {
                // Иначе удаляем непосредственно файл
                await del(fileName);
              }
            }
          } catch (error) {
            // Если не удалось удалить, продолжаем выполнение
          }
        }
    
        // Обновляем статус
        await DB.updateStatus(id, 'nft_rejected');
        
        // Очищаем URL изображения в заявке
        await kv.hset(`application:${id}`, {
          imageUrl: null,
          imageUploadedAt: null
        });
        
        // Получаем обновленную заявку и обновляем Discord канал
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