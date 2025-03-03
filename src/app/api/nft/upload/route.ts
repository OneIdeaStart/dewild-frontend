// src/app/api/nft/upload/route.ts
import { NextResponse } from 'next/server';
import { DB } from '@/lib/db';
import { put } from '@vercel/blob';
import { kv } from '@vercel/kv';

export async function POST(request: Request) {
  try {
    const data = await request.json();
    const { image, traits, statement, wallet } = data;
    
    if (!image || !wallet) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const application = await DB.getApplicationByWallet(wallet);
    if (!application) {
      return NextResponse.json({ error: 'Application not found' }, { status: 404 });
    }

    if (!['approved', 'prompt_received', 'nft_rejected'].includes(application.status)) {
      return NextResponse.json({ 
        error: 'Application status does not allow image upload' 
      }, { status: 400 });
    }

    // Обработка Base64 изображения
    const imageData = image.split(';base64,').pop();
    if (!imageData) {
      return NextResponse.json({ error: 'Invalid image data' }, { status: 400 });
    }

    // Загрузка в Blob Storage
    const buffer = Buffer.from(imageData, 'base64');
    const blob = await put(`nft-images/${application.id}.png`, buffer, {
      contentType: 'image/png',
      access: 'public'
    });

    // Обновление данных заявки
    await DB.updateApplicationNFT(application.id, blob.url);
    await DB.updateStatus(application.id, 'nft_pending');

    // Сохранение метаданных
    const metadata = {
      name: `DeWild #${application.id}`,
      description: statement,
      artist: application.twitter,
      traits,
      statement
    };
    
    await kv.hset(`application:${application.id}`, {
      metadata: JSON.stringify(metadata)
    });

    return NextResponse.json({ 
      success: true, 
      message: 'Image uploaded successfully'
    });
  } catch (error: any) {
    console.error('Error uploading NFT image:', error);
    return NextResponse.json(
      { error: 'Failed to upload image', details: error?.message },
      { status: 500 }
    );
  }
}